import { PublicKey } from "@solana/web3.js";
import { loadConfig } from "./config.js";
import { createLogger } from "./observability/logger.js";
import { createConnection } from "./solana/connection.js";
import { FileKeystore } from "./keystore/keystore.js";
import { LocalEncryptedKeystoreSignerProvider } from "./wallet/signerImpl.js";
import { TxPolicyEngine } from "./wallet/txPolicy.js";
import { WalletExecutor } from "./wallet/txBuilder.js";
import { MockDefiClient } from "./protocol/mockDefiClient.js";
import { AgentRunner } from "./agents/agentRunner.js";
import { RandomSwapStrategy } from "./agents/strategies/randomSwap.js";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const config = loadConfig();
  const logger = createLogger(config.LOG_LEVEL);
  const connection = createConnection(config.SOLANA_RPC_URL, config.SOLANA_WS_URL);

  const keystore = new FileKeystore("apps/backend/data/keystore.json", config.KEYSTORE_MASTER_KEY);
  const signerProvider = new LocalEncryptedKeystoreSignerProvider(keystore);
  const policy = new TxPolicyEngine(config.PROGRAM_ID, {
    maxLamportsPerTransfer: 2_000_000_000,
    maxTokenAmountPerSwap: config.DEMO_SWAP_AMOUNT,
    maxDailyVolume: config.DEMO_SWAP_AMOUNT * 100
  });
  const wallet = new WalletExecutor(connection, signerProvider, policy);
  const protocol = new MockDefiClient(new PublicKey(config.PROGRAM_ID));
  const runner = new AgentRunner(wallet, protocol, () => new RandomSwapStrategy(config.DEMO_SWAP_AMOUNT));

  logger.info("Step 1: creating agents");
  const created = await runner.createAgents(config.DEMO_NUM_AGENTS);

  logger.info("Step 2: requesting SOL airdrops");
  for (const agent of created) {
    const airdropSig = await connection.requestAirdrop(new PublicKey(agent.publicKey), 1_000_000_000);
    logger.info({ agentId: agent.agentId, airdropSig }, "airdrop requested");
  }

  logger.info("Step 3: running loops");
  runner.on("event", (evt) => logger.info(evt, "agent-event"));
  runner.start(3000);
  await sleep(30_000);
  runner.stop();

  logger.info({ agents: runner.listAgents() }, "demo complete");
}

void main();
