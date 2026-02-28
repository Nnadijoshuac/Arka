export type EncryptedBlob = {
  kdf: "scrypt";
  salt_b64: string;
  iv_b64: string;
  tag_b64: string;
  ciphertext_b64: string;
};

export type StoredSigner = {
  agentId: string;
  publicKey: string;
  encryptedSecretKey: EncryptedBlob;
  createdAt: string;
};

export type KeystoreFile = {
  version: 1;
  signers: StoredSigner[];
};
