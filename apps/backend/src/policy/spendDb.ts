import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

type SpendSnapshot = {
  version: 1;
  daily: Record<string, Record<string, number>>;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export class SpendDb {
  constructor(private readonly filePath: string) {
    this.ensureStore();
  }

  private ensureStore(): void {
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    if (!existsSync(this.filePath)) {
      const initial: SpendSnapshot = { version: 1, daily: {} };
      writeFileSync(this.filePath, JSON.stringify(initial, null, 2));
    }
  }

  private read(): SpendSnapshot {
    const parsed = JSON.parse(readFileSync(this.filePath, "utf8")) as SpendSnapshot;
    if (parsed.version !== 1) {
      throw new Error("Unsupported spend db version");
    }
    return parsed;
  }

  private write(data: SpendSnapshot): void {
    writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  getDailySpend(agentId: string, day = todayIso()): number {
    const data = this.read();
    return data.daily[day]?.[agentId] ?? 0;
  }

  addDailySpend(agentId: string, amount: number, day = todayIso()): number {
    const data = this.read();
    const current = data.daily[day]?.[agentId] ?? 0;
    const next = current + amount;

    if (!data.daily[day]) {
      data.daily[day] = {};
    }
    data.daily[day][agentId] = next;
    this.write(data);
    return next;
  }
}

