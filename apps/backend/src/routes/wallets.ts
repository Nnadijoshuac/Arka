import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction
} from "@solana/web3.js";
import {
  createMint,
  getAccount,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
  mintTo
} from "@solana/spl-token";
import type { AgentRunner } from "../agents/agentRunner.js";
import type { WalletExecutor } from "../wallet/txBuilder.js";
import type { MockDefiClient } from "../protocol/mockDefiClient.js";
import type { SignerProvider } from "../wallet/signer.js";
import { HeuristicAiSwapStrategy } from "../agents/strategies/heuristicAiSwap.js";
import { RandomSwapStrategy } from "../agents/strategies/randomSwap.js";
import type { AppConfig } from "../config.js";

type WalletAccount = {
  walletId: string;
  name: string;
  agentId: string;
  publicKey: string;
  strategy: "heuristic_ai" | "random";
  status: "idle" | "active" | "error";
  createdAt: string;
};

type WalletTxRecord = {
  walletId: string;
  agentId: string;
  timestamp: string;
  action: string;
  amount: number;
  status: "ok" | "error" | "hold";
  signature?: string;
  reason?: string;
  error?: string;
};

type WalletContext = {
  runner: AgentRunner;
  wallet: WalletExecutor;
  protocol: MockDefiClient;
  connection: Connection;
  signerProvider: SignerProvider;
  programId: PublicKey;
  config: AppConfig;
};

type MarketState = {
  adminAgentId: string;
  mintA: PublicKey;
  mintB: PublicKey;
  poolState: PublicKey;
  poolAuthority: PublicKey;
  vaultA: PublicKey;
  vaultB: PublicKey;
};

const createWalletSchema = z.object({
  name: z.string().trim().min(2).max(60),
  strategy: z.enum(["heuristic_ai", "random"]).optional()
});

const fundWalletSchema = z.object({
  lamports: z.number().int().positive().default(100_000_000)
});

const executeWalletSchema = z.object({
  rounds: z.number().int().positive().max(30).default(3),
  amount: z.number().int().positive().default(1000)
});

export async function registerWalletRoutes(app: FastifyInstance, ctx: WalletContext) {
  const accounts = new Map<string, WalletAccount>();
  const txByWallet = new Map<string, WalletTxRecord[]>();
  const strategyByWallet = new Map<string, HeuristicAiSwapStrategy | RandomSwapStrategy>();
  let marketState: MarketState | null = null;

  const defaultKeypairPath = join(homedir(), ".config", "solana", "id.json");
  const fundedKeypairPath = process.env.SOLANA_KEYPAIR_PATH ?? defaultKeypairPath;

  function loadFundedSigner(): Keypair {
    const raw = JSON.parse(readFileSync(fundedKeypairPath, "utf8")) as number[];
    return Keypair.fromSecretKey(Uint8Array.from(raw));
  }

  async function transferLamports(from: Keypair, to: PublicKey, lamports: number): Promise<string> {
    const ix = SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to,
      lamports
    });
    const tx = new Transaction().add(ix);
    return sendAndConfirmTransaction(ctx.connection, tx, [from], { commitment: "confirmed" });
  }

  function getWallet(walletId: string): WalletAccount {
    const wallet = accounts.get(walletId);
    if (!wallet) {
      throw new Error(`Wallet ${walletId} not found.`);
    }
    return wallet;
  }

  function recordTx(record: WalletTxRecord): void {
    const current = txByWallet.get(record.walletId) ?? [];
    current.push(record);
    txByWallet.set(record.walletId, current.slice(-200));
  }

  async function ensureMarket(): Promise<MarketState> {
    if (marketState) {
      return marketState;
    }
    const fundedSigner = loadFundedSigner();
    const adminCreated = ctx.signerProvider.createSigner();
    const adminSigner = ctx.signerProvider.getSigner(adminCreated.agentId);

    await transferLamports(fundedSigner, adminSigner.publicKey, 350_000_000);

    const mintA = await createMint(ctx.connection, adminSigner, adminSigner.publicKey, null, 6);
    const mintB = await createMint(ctx.connection, adminSigner, adminSigner.publicKey, null, 6);

    const [poolState] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool_state"), mintA.toBuffer(), mintB.toBuffer()],
      ctx.programId
    );
    const [poolAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool_authority"), poolState.toBuffer()],
      ctx.programId
    );

    const vaultA = getAssociatedTokenAddressSync(mintA, poolAuthority, true);
    const vaultB = getAssociatedTokenAddressSync(mintB, poolAuthority, true);

    const initIx = ctx.protocol.buildInitializePoolInstruction(adminSigner.publicKey, mintA, mintB, {
      poolState,
      poolAuthority,
      vaultA,
      vaultB
    });
    await ctx.wallet.submitInstructions(adminCreated.agentId, [initIx]);

    await mintTo(ctx.connection, adminSigner, mintA, vaultA, adminSigner.publicKey, 500_000);
    await mintTo(ctx.connection, adminSigner, mintB, vaultB, adminSigner.publicKey, 500_000);

    marketState = {
      adminAgentId: adminCreated.agentId,
      mintA,
      mintB,
      poolState,
      poolAuthority,
      vaultA,
      vaultB
    };
    return marketState;
  }

  async function ensureWalletReady(wallet: WalletAccount): Promise<void> {
    const market = await ensureMarket();
    const fundedSigner = loadFundedSigner();
    const signer = ctx.signerProvider.getSigner(wallet.agentId);
    const solBal = await ctx.connection.getBalance(signer.publicKey, "confirmed");
    if (solBal < 80_000_000) {
      await transferLamports(fundedSigner, signer.publicKey, 80_000_000 - solBal);
    }

    const adminSigner = ctx.signerProvider.getSigner(market.adminAgentId);
    const ataA = await getOrCreateAssociatedTokenAccount(ctx.connection, adminSigner, market.mintA, signer.publicKey);
    await getOrCreateAssociatedTokenAccount(ctx.connection, adminSigner, market.mintB, signer.publicKey);
    const balA = await getAccount(ctx.connection, ataA.address);
    if (Number(balA.amount) < 10_000) {
      await mintTo(ctx.connection, adminSigner, market.mintA, ataA.address, adminSigner.publicKey, 120_000);
    }
  }

  app.post("/wallets", async (req) => {
    const input = createWalletSchema.parse(req.body ?? {});
    const created = await ctx.runner.createAgents(1);
    const agent = created[0];
    const walletId = randomUUID();
    const strategyType = input.strategy ?? ctx.config.AGENT_STRATEGY;
    const account: WalletAccount = {
      walletId,
      name: input.name,
      agentId: agent.agentId,
      publicKey: agent.publicKey,
      strategy: strategyType,
      status: "idle",
      createdAt: new Date().toISOString()
    };
    accounts.set(walletId, account);
    strategyByWallet.set(
      walletId,
      strategyType === "random"
        ? new RandomSwapStrategy(ctx.config.DEMO_SWAP_AMOUNT)
        : new HeuristicAiSwapStrategy(ctx.config.DEMO_SWAP_AMOUNT, ctx.config.AI_MIN_CONFIDENCE)
    );
    txByWallet.set(walletId, []);
    return { wallet: account };
  });

  app.get("/wallets", async () => ({ wallets: [...accounts.values()] }));

  app.post("/wallets/:walletId/fund", async (req) => {
    const params = z.object({ walletId: z.string().uuid() }).parse(req.params);
    const input = fundWalletSchema.parse(req.body ?? {});
    const wallet = getWallet(params.walletId);
    const fundedSigner = loadFundedSigner();
    const to = new PublicKey(wallet.publicKey);
    const signature = await transferLamports(fundedSigner, to, input.lamports);
    recordTx({
      walletId: wallet.walletId,
      agentId: wallet.agentId,
      timestamp: new Date().toISOString(),
      action: "fund",
      amount: input.lamports,
      status: "ok",
      signature,
      reason: "Manual funding action."
    });
    return { ok: true, signature };
  });

  app.post("/wallets/:walletId/execute", async (req) => {
    const params = z.object({ walletId: z.string().uuid() }).parse(req.params);
    const input = executeWalletSchema.parse(req.body ?? {});
    const wallet = getWallet(params.walletId);
    const strategy = strategyByWallet.get(wallet.walletId);
    if (!strategy) {
      throw new Error(`Strategy missing for wallet ${wallet.walletId}.`);
    }
    wallet.status = "active";
    await ensureWalletReady(wallet);
    const market = await ensureMarket();

    const signer = ctx.signerProvider.getSigner(wallet.agentId);
    const user = signer.publicKey;
    const userSourceAta = getAssociatedTokenAddressSync(market.mintA, user);
    const userDestAta = getAssociatedTokenAddressSync(market.mintB, user);
    const signatures: string[] = [];
    const errors: string[] = [];
    let holds = 0;

    for (let round = 0; round < input.rounds; round += 1) {
      const decision = strategy.decide({
        agentId: wallet.agentId,
        publicKey: wallet.publicKey,
        strategy: wallet.strategy,
        lastStatus: wallet.status === "active" ? "running" : wallet.status
      });
      if (!decision.action) {
        holds += 1;
        recordTx({
          walletId: wallet.walletId,
          agentId: wallet.agentId,
          timestamp: new Date().toISOString(),
          action: "hold",
          amount: 0,
          status: "hold",
          reason: decision.reason
        });
        continue;
      }
      const finalAmount = Math.max(1, Math.min(input.amount, decision.action.amount, ctx.config.DEMO_SWAP_AMOUNT));
      try {
        const ix = ctx.protocol.buildSwapInstruction(user, decision.action.direction, finalAmount, {
          poolState: market.poolState,
          poolAuthority: market.poolAuthority,
          userSource: userSourceAta,
          userDestination: userDestAta,
          vaultSource: market.vaultA,
          vaultDestination: market.vaultB,
          sourceMint: market.mintA,
          destinationMint: market.mintB
        });
        const signature = await ctx.wallet.submitSwap(wallet.agentId, ix, finalAmount);
        signatures.push(signature);
        recordTx({
          walletId: wallet.walletId,
          agentId: wallet.agentId,
          timestamp: new Date().toISOString(),
          action: `swap:${decision.action.direction}`,
          amount: finalAmount,
          status: "ok",
          signature,
          reason: decision.reason
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(message);
        wallet.status = "error";
        recordTx({
          walletId: wallet.walletId,
          agentId: wallet.agentId,
          timestamp: new Date().toISOString(),
          action: `swap:${decision.action.direction}`,
          amount: finalAmount,
          status: "error",
          error: message
        });
      }
    }

    if (wallet.status !== "error") {
      wallet.status = "idle";
    }
    return {
      ok: true,
      rounds: input.rounds,
      signatures,
      errors,
      holds
    };
  });

  app.get("/wallets/:walletId/transactions", async (req) => {
    const params = z.object({ walletId: z.string().uuid() }).parse(req.params);
    const wallet = getWallet(params.walletId);
    const txs = txByWallet.get(wallet.walletId) ?? [];
    return { walletId: wallet.walletId, transactions: txs.slice(-100).reverse() };
  });

  app.get("/wallets/:walletId/monitor", async (req) => {
    const params = z.object({ walletId: z.string().uuid() }).parse(req.params);
    const wallet = getWallet(params.walletId);
    const walletPubkey = new PublicKey(wallet.publicKey);
    const solLamports = await ctx.connection.getBalance(walletPubkey, "confirmed");
    const market = marketState;
    let tokenA = "0";
    let tokenB = "0";
    if (market) {
      try {
        const ataA = getAssociatedTokenAddressSync(market.mintA, walletPubkey);
        const ataB = getAssociatedTokenAddressSync(market.mintB, walletPubkey);
        tokenA = (await getAccount(ctx.connection, ataA)).amount.toString();
        tokenB = (await getAccount(ctx.connection, ataB)).amount.toString();
      } catch {
        tokenA = "0";
        tokenB = "0";
      }
    }
    const txs = txByWallet.get(wallet.walletId) ?? [];
    const okCount = txs.filter((t) => t.status === "ok").length;
    const errorCount = txs.filter((t) => t.status === "error").length;
    const holdCount = txs.filter((t) => t.status === "hold").length;

    return {
      wallet,
      balances: {
        solLamports,
        tokenA,
        tokenB
      },
      activity: {
        totalTransactions: txs.length,
        okCount,
        errorCount,
        holdCount
      }
    };
  });
}
