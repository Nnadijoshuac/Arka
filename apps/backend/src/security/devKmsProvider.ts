import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import type { KMSProvider } from "./kms.js";

const AES_GCM_ALGO = "aes-256-gcm";
const IV_SIZE = 12;
const TAG_SIZE = 16;

function encryptAesGcm(plaintext: Buffer, key: Buffer): Buffer {
  const iv = randomBytes(IV_SIZE);
  const cipher = createCipheriv(AES_GCM_ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]);
}

function decryptAesGcm(payload: Buffer, key: Buffer): Buffer {
  if (payload.length <= IV_SIZE + TAG_SIZE) {
    throw new Error("Invalid ciphertext payload.");
  }

  const iv = payload.subarray(0, IV_SIZE);
  const tag = payload.subarray(IV_SIZE, IV_SIZE + TAG_SIZE);
  const ciphertext = payload.subarray(IV_SIZE + TAG_SIZE);

  const decipher = createDecipheriv(AES_GCM_ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

export class DevKmsProvider implements KMSProvider {
  private readonly masterKey: Buffer;
  private readonly stableKeyId = "dev-master";

  constructor(masterKeyBase64: string) {
    const masterKey = Buffer.from(masterKeyBase64, "base64");
    if (masterKey.length !== 32) {
      throw new Error("KMS_MASTER_KEY_BASE64 must decode to exactly 32 bytes.");
    }
    this.masterKey = masterKey;
  }

  async encrypt(data: Buffer): Promise<{ ciphertext: Buffer; keyId: string }> {
    const ciphertext = encryptAesGcm(data, this.masterKey);
    return { ciphertext, keyId: this.stableKeyId };
  }

  async decrypt(ciphertext: Buffer, _keyId: string): Promise<Buffer> {
    return decryptAesGcm(ciphertext, this.masterKey);
  }

  async rotateKey(): Promise<string> {
    return this.stableKeyId;
  }
}
