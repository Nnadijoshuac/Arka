import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SpendDb } from "../src/policy/spendDb.js";

describe("spend db", () => {
  it("stores and retrieves daily spend", () => {
    const dir = mkdtempSync(join(tmpdir(), "spenddb-"));
    const db = new SpendDb(join(dir, "spend.json"));
    expect(db.getDailySpend("agent-1")).toBe(0);
    db.addDailySpend("agent-1", 42);
    expect(db.getDailySpend("agent-1")).toBe(42);
  });
});

