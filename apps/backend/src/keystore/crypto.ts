import { createCipheriv, createDecipheriv, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { EncryptedBlob } from "./types.js";

const ALGO = "aes-256-gcm";

function deriveKey(masterKey: string, salt: Buffer): Buffer {
  return scryptSync(masterKey, salt, 32);
}

export function encryptSecretKey(secretKey: Uint8Array, masterKey: string): EncryptedBlob {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = deriveKey(masterKey, salt);
  const cipher = createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(Buffer.from(secretKey)), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    kdf: "scrypt",
    salt_b64: salt.toString("base64"),
    iv_b64: iv.toString("base64"),
    tag_b64: tag.toString("base64"),
    ciphertext_b64: ciphertext.toString("base64")
  };
}

export function decryptSecretKey(blob: EncryptedBlob, masterKey: string): Uint8Array {
  if (blob.kdf !== "scrypt") {
    throw new Error("Unsupported KDF");
  }

  const salt = Buffer.from(blob.salt_b64, "base64");
  const iv = Buffer.from(blob.iv_b64, "base64");
  const tag = Buffer.from(blob.tag_b64, "base64");
  const ciphertext = Buffer.from(blob.ciphertext_b64, "base64");

  const key = deriveKey(masterKey, salt);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return new Uint8Array(plain);
}

export function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}
