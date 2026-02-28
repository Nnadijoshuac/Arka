import { Keypair, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { describe, expect, it } from "vitest";
import { mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { TxPolicyEngine } from "../src/wallet/txPolicy.js";
import { SpendDb } from "../src/policy/spendDb.js";

function createSpendDb(): SpendDb {
  const dir = mkdtempSync(join(tmpdir(), "spend-db-"));
  return new SpendDb(join(dir, "spend.json"));
}

describe("tx policy", () => {
  it("blocks disallowed program", () => {
    const policy = new TxPolicyEngine(Keypair.generate().publicKey.toBase58(), {
      maxLamportsPerTransfer: 100,
      maxTokenAmountPerSwap: 100,
      maxDailyVolume: 1000
    }, createSpendDb());

    const ix = new TransactionInstruction({
      programId: new PublicKey("BPFLoader1111111111111111111111111111111111"),
      keys: [],
      data: Buffer.alloc(0)
    });

    expect(() => policy.assertProgramAllowlist([ix])).toThrow();
  });

  it("enforces daily cap", () => {
    const policy = new TxPolicyEngine(Keypair.generate().publicKey.toBase58(), {
      maxLamportsPerTransfer: 100,
      maxTokenAmountPerSwap: 100,
      maxDailyVolume: 150
    }, createSpendDb());

    policy.assertLamports("agent-1", 100);
    expect(() => policy.assertLamports("agent-1", 60)).toThrow();
  });
});
