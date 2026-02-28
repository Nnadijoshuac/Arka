import type { AgentState, AgentStrategy } from "../types.js";

export class ConservativeSwapStrategy implements AgentStrategy {
  name = "conservativeSwap";
  private failures = new Map<string, number>();

  constructor(private readonly fixedAmount: number) {}

  nextAction(state: AgentState) {
    const count = this.failures.get(state.agentId) ?? 0;
    if (count >= 3) {
      return null;
    }
    if (state.lastStatus === "error") {
      this.failures.set(state.agentId, count + 1);
    }

    return {
      kind: "swap" as const,
      direction: "A_TO_B" as const,
      amount: this.fixedAmount
    };
  }
}
