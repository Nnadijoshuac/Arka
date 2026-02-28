import { PublicKey, TransactionInstruction } from "@solana/web3.js";

export class MockDefiClient {
  constructor(private readonly programId: PublicKey) {}

  buildInitializePoolInstruction(admin: PublicKey, mintA: PublicKey, mintB: PublicKey): TransactionInstruction {
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

  buildSwapInstruction(user: PublicKey, direction: "A_TO_B" | "B_TO_A", amountIn: number): TransactionInstruction {
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
}
