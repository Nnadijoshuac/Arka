import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  type Connection,
  type SendOptions
} from "@solana/web3.js";
import type { SignerProvider } from "./signer.js";
import { TxPolicyEngine } from "./txPolicy.js";
import { sendWithRetry } from "./confirm.js";

export class WalletExecutor {
  constructor(
    private readonly connection: Connection,
    private readonly signerProvider: SignerProvider,
    private readonly policy: TxPolicyEngine
  ) {}

  async submitInstructions(
    agentId: string,
    instructions: TransactionInstruction[],
    options?: SendOptions
  ): Promise<string> {
    this.policy.assertProgramAllowlist(instructions);

    const signer = this.signerProvider.getSigner(agentId);
    const payer = signer.publicKey;

    const txBuilder = async () => {
      const latest = await this.connection.getLatestBlockhash("confirmed");
      const tx = new Transaction({
        feePayer: payer,
        blockhash: latest.blockhash,
        lastValidBlockHeight: latest.lastValidBlockHeight
      }).add(...instructions);

      const simulation = await this.connection.simulateTransaction(tx, [signer]);
      if (simulation.value.err) {
        throw new Error(`Simulation failed: ${JSON.stringify(simulation.value.err)}`);
      }

      tx.sign(signer);
      return { tx, lastValidBlockHeight: latest.lastValidBlockHeight };
    };

    return sendWithRetry(this.connection, txBuilder, options);
  }

  async transferSol(agentId: string, to: PublicKey, lamports: number): Promise<string> {
    this.policy.assertLamports(agentId, lamports);
    const from = this.signerProvider.getSigner(agentId).publicKey;
    const ix = SystemProgram.transfer({ fromPubkey: from, toPubkey: to, lamports });
    return this.submitInstructions(agentId, [ix]);
  }

  async createAgent(): Promise<{ agentId: string; publicKey: string }> {
    return this.signerProvider.createSigner();
  }

  listAgents(): Array<{ agentId: string; publicKey: string; createdAt: string }> {
    return this.signerProvider.listSigners();
  }
}
