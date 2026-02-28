import { PublicKey, SystemProgram } from "@solana/web3.js";

export const SYSTEM_PROGRAM_ID = SystemProgram.programId;
export const SPL_TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
export const ATA_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
export const COMPUTE_BUDGET_PROGRAM_ID = new PublicKey("ComputeBudget111111111111111111111111111111");
export const MOCK_DEFI_PROGRAM_ID = new PublicKey(
  process.env.PROGRAM_ID ?? "Fg6PaFpoGXkYsidMpWxTWqkZx1Yeznq4kQbF5x8h5N7F"
);
