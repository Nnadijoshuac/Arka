import { TransactionInstruction } from "@solana/web3.js";
import {
  ATA_PROGRAM_ID,
  COMPUTE_BUDGET_PROGRAM_ID,
  SPL_TOKEN_PROGRAM_ID,
  SYSTEM_PROGRAM_ID
} from "../solana/constants.js";

export type SpendCaps = {
  maxLamportsPerTransfer: number;
  maxTokenAmountPerSwap: number;
  maxDailyVolume: number;
};

export class PolicyViolation extends Error {}

export class TxPolicyEngine {
  private readonly dailySpend = new Map<string, number>();

  constructor(
    private readonly mockDefiProgramId: string,
    private readonly caps: SpendCaps
  ) {}

  assertProgramAllowlist(instructions: TransactionInstruction[]): void {
    const allowed = new Set([
      SYSTEM_PROGRAM_ID.toBase58(),
      SPL_TOKEN_PROGRAM_ID.toBase58(),
      ATA_PROGRAM_ID.toBase58(),
      COMPUTE_BUDGET_PROGRAM_ID.toBase58(),
      this.mockDefiProgramId
    ]);

    for (const ix of instructions) {
      const pid = ix.programId.toBase58();
      if (!allowed.has(pid)) {
        throw new PolicyViolation(`Program not allowlisted: ${pid}`);
      }
    }
  }

  assertLamports(agentId: string, lamports: number): void {
    if (lamports > this.caps.maxLamportsPerTransfer) {
      throw new PolicyViolation(`Lamports exceed max per transfer: ${lamports}`);
    }
    this.assertDaily(agentId, lamports);
  }

  assertSwapAmount(agentId: string, amount: number): void {
    if (amount > this.caps.maxTokenAmountPerSwap) {
      throw new PolicyViolation(`Swap amount exceeds max: ${amount}`);
    }
    this.assertDaily(agentId, amount);
  }

  private assertDaily(agentId: string, amount: number): void {
    const current = this.dailySpend.get(agentId) ?? 0;
    const next = current + amount;
    if (next > this.caps.maxDailyVolume) {
      throw new PolicyViolation(`Daily cap exceeded for ${agentId}`);
    }
    this.dailySpend.set(agentId, next);
  }
}
