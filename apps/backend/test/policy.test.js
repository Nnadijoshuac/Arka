import { Keypair, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { describe, expect, it } from "vitest";
import { TxPolicyEngine } from "../src/wallet/txPolicy.js";
describe("tx policy", () => {
    it("blocks disallowed program", () => {
        const policy = new TxPolicyEngine(Keypair.generate().publicKey.toBase58(), {
            maxLamportsPerTransfer: 100,
            maxTokenAmountPerSwap: 100,
            maxDailyVolume: 1000
        });
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
        });
        policy.assertLamports("agent-1", 100);
        expect(() => policy.assertLamports("agent-1", 60)).toThrow();
    });
});
