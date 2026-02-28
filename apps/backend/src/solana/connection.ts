import { Connection } from "@solana/web3.js";

export function createConnection(rpcUrl: string, wsUrl: string): Connection {
  return new Connection(rpcUrl, { commitment: "confirmed", wsEndpoint: wsUrl });
}
