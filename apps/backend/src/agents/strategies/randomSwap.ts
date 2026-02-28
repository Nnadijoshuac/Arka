import type { AgentState, AgentStrategy } from "../types.js";

export class RandomSwapStrategy implements AgentStrategy {
  name = "randomSwap";

  constructor(private readonly maxAmount: number) {}

  nextAction(_state: AgentState) {
    const direction = Math.random() > 0.5 ? ("A_TO_B" as const) : ("B_TO_A" as const);
    return {
      kind: "swap" as const,
      direction,
      amount: Math.max(1, Math.floor(Math.random() * this.maxAmount))
    };
  }
}
