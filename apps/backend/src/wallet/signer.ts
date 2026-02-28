import { Keypair } from "@solana/web3.js";

export interface SignerProvider {
  createSigner(): { agentId: string; publicKey: string };
  getSigner(agentId: string): Keypair;
  listSigners(): Array<{ agentId: string; publicKey: string; createdAt: string }>;
}
