import { Connection, type SendOptions, type SignatureStatus, type Transaction } from "@solana/web3.js";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function confirmSignatureStrict(
  connection: Connection,
  signature: string,
  lastValidBlockHeight: number,
  maxPolls = 40
): Promise<SignatureStatus | null> {
  for (let i = 0; i < maxPolls; i += 1) {
    const current = await connection.getBlockHeight("confirmed");
    if (current > lastValidBlockHeight) {
      throw new Error("Blockhash expired before confirmation");
    }

    const statuses = await connection.getSignatureStatuses([signature]);
    const status = statuses.value[0];
    if (status && (status.confirmationStatus === "confirmed" || status.confirmationStatus === "finalized")) {
      if (status.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(status.err)}`);
      }
      return status;
    }

    await sleep(1000);
  }

  return null;
}

export async function sendWithRetry(
  connection: Connection,
  txBuilder: () => Promise<{ tx: Transaction; lastValidBlockHeight: number }>,
  options?: SendOptions,
  maxRetries = 2
): Promise<string> {
  let lastErr: unknown;
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const { tx, lastValidBlockHeight } = await txBuilder();
      const signature = await connection.sendRawTransaction(tx.serialize(), options);
      await confirmSignatureStrict(connection, signature, lastValidBlockHeight);
      return signature;
    } catch (err) {
      lastErr = err;
      const message = err instanceof Error ? err.message : String(err);
      const retryable =
        message.toLowerCase().includes("expired") ||
        message.toLowerCase().includes("blockhash") ||
        message.toLowerCase().includes("simulation failed") ||
        message.toLowerCase().includes("insufficient");
      if (!retryable || attempt === maxRetries) {
        throw err;
      }
    }
    attempt += 1;
  }

  throw new Error(`Transaction retries exhausted: ${String(lastErr)}`);
}
