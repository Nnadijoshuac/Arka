import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { Keypair } from "@solana/web3.js";
import { decryptSecretKey, encryptSecretKey } from "./crypto.js";
import type { KeystoreFile, StoredSigner } from "./types.js";

export class FileKeystore {
  constructor(
    private readonly filePath: string,
    private readonly masterKey: string
  ) {
    this.ensureStore();
  }

  private ensureStore(): void {
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    if (!existsSync(this.filePath)) {
      const empty: KeystoreFile = { version: 1, signers: [] };
      writeFileSync(this.filePath, JSON.stringify(empty, null, 2));
    }
  }

  private readStore(): KeystoreFile {
    const parsed = JSON.parse(readFileSync(this.filePath, "utf8")) as KeystoreFile;
    if (parsed.version !== 1) {
      throw new Error("Unsupported keystore version");
    }
    return parsed;
  }

  private writeStore(store: KeystoreFile): void {
    writeFileSync(this.filePath, JSON.stringify(store, null, 2));
  }

  createSigner(): { agentId: string; publicKey: string } {
    const kp = Keypair.generate();
    const agentId = `agent-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const encrypted = encryptSecretKey(kp.secretKey, this.masterKey);

    const store = this.readStore();
    const record: StoredSigner = {
      agentId,
      publicKey: kp.publicKey.toBase58(),
      encryptedSecretKey: encrypted,
      createdAt: new Date().toISOString()
    };
    store.signers.push(record);
    this.writeStore(store);

    return { agentId, publicKey: record.publicKey };
  }

  getSigner(agentId: string): Keypair {
    const store = this.readStore();
    const found = store.signers.find((s) => s.agentId === agentId);
    if (!found) {
      throw new Error(`Signer not found for agentId=${agentId}`);
    }

    const secretBytes = decryptSecretKey(found.encryptedSecretKey, this.masterKey);
    return Keypair.fromSecretKey(secretBytes);
  }

  listSigners(): Array<{ agentId: string; publicKey: string; createdAt: string }> {
    return this.readStore().signers.map((s) => ({
      agentId: s.agentId,
      publicKey: s.publicKey,
      createdAt: s.createdAt
    }));
  }
}
