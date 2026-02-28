import { describe, expect, it } from "vitest";
import { decryptSecretKey, encryptSecretKey } from "../src/keystore/crypto.js";
describe("keystore crypto", () => {
    it("roundtrips encrypted secret key", () => {
        const original = new Uint8Array(Array.from({ length: 64 }, (_, i) => i));
        const master = "12345678901234567890123456789012";
        const blob = encryptSecretKey(original, master);
        const plain = decryptSecretKey(blob, master);
        expect(Array.from(plain)).toEqual(Array.from(original));
    });
    it("fails with wrong master key", () => {
        const original = new Uint8Array(Array.from({ length: 64 }, (_, i) => i));
        const blob = encryptSecretKey(original, "12345678901234567890123456789012");
        expect(() => decryptSecretKey(blob, "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")).toThrow();
    });
});
