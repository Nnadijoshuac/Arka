import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import type { AgentRunner } from "../agents/agentRunner.js";
import type { WalletExecutor } from "../wallet/txBuilder.js";
import type { MockDefiClient } from "../protocol/mockDefiClient.js";
import type { SignerProvider } from "../wallet/signer.js";
import type { Connection } from "@solana/web3.js";

type DemoContext = {
  runner: AgentRunner;
  wallet: WalletExecutor;
  protocol: MockDefiClient;
  connection: Connection;
  signerProvider: SignerProvider;
  programId: PublicKey;
  demoSwapAmount: number;
};

type DemoState = {
  adminAgentId?: string;
  mintA?: PublicKey;
  mintB?: PublicKey;
  signatures: string[];
};

const setupSchema = z.object({
  numAgents: z.number().int().positive().max(50).default(5),
  seedAmount: z.number().int().positive().default(100_000)
});

const runSchema = z.object({
  rounds: z.number().int().positive().max(30).default(3),
  amount: z.number().int().positive().default(1000)
});

export async function registerDemoRoutes(app: FastifyInstance, ctx: DemoContext) {
  const state: DemoState = { signatures: [] };

  app.post("/demo/setup", async (req) => {
    const input = setupSchema.parse(req.body ?? {});
    const existing = ctx.runner.listAgents();
    if (existing.length < input.numAgents) {
      await ctx.runner.createAgents(input.numAgents - existing.length);
    }

    const adminCreated = ctx.signerProvider.createSigner();
    state.adminAgentId = adminCreated.agentId;
    const adminSigner = ctx.signerProvider.getSigner(adminCreated.agentId);
    await ctx.connection.requestAirdrop(adminSigner.publicKey, 2_000_000_000);

    state.mintA = await createMint(ctx.connection, adminSigner, adminSigner.publicKey, null, 6);
    state.mintB = await createMint(ctx.connection, adminSigner, adminSigner.publicKey, null, 6);

    const [poolStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool_state"), state.mintA.toBuffer(), state.mintB.toBuffer()],
      ctx.programId
    );
    const [poolAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool_authority"), poolStatePda.toBuffer()],
      ctx.programId
    );

    const vaultA = await getOrCreateAssociatedTokenAccount(
      ctx.connection,
      adminSigner,
      state.mintA,
      poolAuthorityPda,
      true
    );
    const vaultB = await getOrCreateAssociatedTokenAccount(
      ctx.connection,
      adminSigner,
      state.mintB,
      poolAuthorityPda,
      true
    );

    await mintTo(
      ctx.connection,
      adminSigner,
      state.mintB,
      vaultB.address,
      adminSigner.publicKey,
      input.seedAmount
    );
    await mintTo(
      ctx.connection,
      adminSigner,
      state.mintA,
      vaultA.address,
      adminSigner.publicKey,
      input.seedAmount
    );

    const setupAgents = ctx.runner.listAgents();
    for (const agent of setupAgents) {
      const signer = ctx.signerProvider.getSigner(agent.agentId);
      await ctx.connection.requestAirdrop(signer.publicKey, 1_000_000_000);

      const agentAtaA = await getOrCreateAssociatedTokenAccount(
        ctx.connection,
        adminSigner,
        state.mintA,
        signer.publicKey
      );
      await getOrCreateAssociatedTokenAccount(ctx.connection, adminSigner, state.mintB, signer.publicKey);
      await mintTo(
        ctx.connection,
        adminSigner,
        state.mintA,
        agentAtaA.address,
        adminSigner.publicKey,
        input.seedAmount
      );
    }

    if (state.adminAgentId) {
      try {
        const initIx = ctx.protocol.buildInitializePoolInstruction(
          adminSigner.publicKey,
          state.mintA,
          state.mintB
        );
        const sig = await ctx.wallet.submitInstructions(state.adminAgentId, [initIx]);
        state.signatures.push(sig);
      } catch (err) {
        app.log.warn({ err }, "initialize_pool tx failed in setup; continuing demo bootstrap");
      }
    }

    return {
      ok: true,
      mintA: state.mintA.toBase58(),
      mintB: state.mintB.toBase58(),
      poolAuthority: poolAuthorityPda.toBase58(),
      agents: ctx.runner.listAgents().length
    };
  });

  app.post("/demo/run", async (req) => {
    const parsed = runSchema.parse(req.body ?? {});
    const amount = Math.min(parsed.amount, ctx.demoSwapAmount);
    const agents = ctx.runner.listAgents();
    const signatures: string[] = [];
    const errors: Array<{ agentId: string; err: string }> = [];

    for (let round = 0; round < parsed.rounds; round += 1) {
      for (const agent of agents) {
        try {
          const ix = ctx.protocol.buildSwapInstruction(new PublicKey(agent.publicKey), "A_TO_B", amount);
          const sig = await ctx.wallet.submitSwap(agent.agentId, ix, amount);
          signatures.push(sig);
        } catch (err) {
          errors.push({
            agentId: agent.agentId,
            err: err instanceof Error ? err.message : String(err)
          });
        }
      }
    }

    state.signatures.push(...signatures);
    return { ok: true, rounds: parsed.rounds, amount, signatures, errors };
  });

  app.post("/demo/stop", async () => {
    ctx.runner.stop();
    return { ok: true, signatures: state.signatures.slice(-50) };
  });
}
