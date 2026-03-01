import { PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { createHash } from "node:crypto";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";

type InitializePoolAccounts = {
  poolState: PublicKey;
  poolAuthority: PublicKey;
  vaultA: PublicKey;
  vaultB: PublicKey;
};

type SwapAccounts = {
  poolState: PublicKey;
  poolAuthority: PublicKey;
  userSource: PublicKey;
  userDestination: PublicKey;
  vaultSource: PublicKey;
  vaultDestination: PublicKey;
  sourceMint: PublicKey;
  destinationMint: PublicKey;
};

export class MockDefiClient {
  constructor(private readonly programId: PublicKey) {}

  private discriminator(name: string): Buffer {
    return createHash("sha256")
      .update(`global:${name}`)
      .digest()
      .subarray(0, 8);
  }

  buildInitializePoolInstruction(
    admin: PublicKey,
    mintA: PublicKey,
    mintB: PublicKey,
    accounts?: InitializePoolAccounts
  ): TransactionInstruction {
    if (!accounts) {
      return new TransactionInstruction({
        programId: this.programId,
        keys: [
          { pubkey: admin, isSigner: true, isWritable: true },
          { pubkey: mintA, isSigner: false, isWritable: false },
          { pubkey: mintB, isSigner: false, isWritable: false }
        ],
        data: Buffer.from([0])
      });
    }

    return new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: admin, isSigner: true, isWritable: true },
        { pubkey: mintA, isSigner: false, isWritable: false },
        { pubkey: mintB, isSigner: false, isWritable: false },
        { pubkey: accounts.poolState, isSigner: false, isWritable: true },
        { pubkey: accounts.poolAuthority, isSigner: false, isWritable: false },
        { pubkey: accounts.vaultA, isSigner: false, isWritable: true },
        { pubkey: accounts.vaultB, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
      ],
      data: this.discriminator("initialize_pool")
    });
  }

  buildSwapInstruction(
    user: PublicKey,
    direction: "A_TO_B" | "B_TO_A",
    amountIn: number,
    accounts?: SwapAccounts
  ): TransactionInstruction {
    if (!accounts) {
      const disc = direction === "A_TO_B" ? 1 : 2;
      const data = Buffer.alloc(9);
      data.writeUInt8(disc, 0);
      data.writeBigUInt64LE(BigInt(amountIn), 1);

      return new TransactionInstruction({
        programId: this.programId,
        keys: [{ pubkey: user, isSigner: true, isWritable: true }],
        data
      });
    }

    const disc = direction === "A_TO_B" ? 1 : 2;
    const methodName = disc === 1 ? "swap_a_for_b" : "swap_b_for_a";
    const data = Buffer.alloc(16);
    this.discriminator(methodName).copy(data, 0);
    data.writeBigUInt64LE(BigInt(amountIn), 8);

    return new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: user, isSigner: true, isWritable: true },
        { pubkey: accounts.poolState, isSigner: false, isWritable: true },
        { pubkey: accounts.poolAuthority, isSigner: false, isWritable: false },
        { pubkey: accounts.userSource, isSigner: false, isWritable: true },
        { pubkey: accounts.userDestination, isSigner: false, isWritable: true },
        { pubkey: accounts.vaultSource, isSigner: false, isWritable: true },
        { pubkey: accounts.vaultDestination, isSigner: false, isWritable: true },
        { pubkey: accounts.sourceMint, isSigner: false, isWritable: false },
        { pubkey: accounts.destinationMint, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }
      ],
      data
    });
  }
}
