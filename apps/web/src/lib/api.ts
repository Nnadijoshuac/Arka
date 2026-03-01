export type Agent = {
  agentId: string;
  publicKey: string;
  strategy: string;
  lastStatus: string;
  lastError?: string;
  lastSignature?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001";

export type WalletAccount = {
  walletId: string;
  name: string;
  agentId: string;
  publicKey: string;
  strategy: "heuristic_ai" | "random";
  status: "idle" | "active" | "error";
  createdAt: string;
};

export type WalletTransaction = {
  walletId: string;
  agentId: string;
  timestamp: string;
  action: string;
  amount: number;
  status: "ok" | "error" | "hold";
  signature?: string;
  reason?: string;
  error?: string;
};

export type WalletMonitor = {
  wallet: WalletAccount;
  balances: {
    solLamports: number;
    tokenA: string;
    tokenB: string;
  };
  activity: {
    totalTransactions: number;
    okCount: number;
    errorCount: number;
    holdCount: number;
  };
};

export type DemoSetupPayload = {
  numAgents?: number;
  seedAmount?: number;
  adminFundLamports?: number;
  agentFundLamports?: number;
  reserveLamports?: number;
};

export type DemoSetupResponse = {
  ok: boolean;
  mintA: string;
  mintB: string;
  poolAuthority: string;
  agents: number;
};

export type DemoRunResponse = {
  ok: boolean;
  rounds: number;
  amount: number;
  signatures: string[];
  errors: Array<{ agentId: string; err: string }>;
};

export type DemoStopResponse = {
  ok: boolean;
  signatures: string[];
};

async function parseApiError(res: Response): Promise<Error> {
  const text = await res.text();
  try {
    const parsed = JSON.parse(text) as { message?: string };
    return new Error(parsed.message ?? text);
  } catch {
    return new Error(text);
  }
}

export async function listAgents(): Promise<Agent[]> {
  const res = await fetch(`${API_BASE}/agents`, { cache: "no-store" });
  const body = (await res.json()) as { agents: Agent[] };
  return body.agents;
}

export async function createAgents(count: number): Promise<Agent[]> {
  const res = await fetch(`${API_BASE}/agents`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ count })
  });
  const body = (await res.json()) as { agents: Agent[] };
  return body.agents;
}

export async function setupDemo(payload: DemoSetupPayload = {}): Promise<DemoSetupResponse> {
  const res = await fetch(`${API_BASE}/demo/setup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw await parseApiError(res);
  }
  return (await res.json()) as DemoSetupResponse;
}

export async function runDemo(rounds = 3, amount = 1000): Promise<DemoRunResponse> {
  const res = await fetch(`${API_BASE}/demo/run`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ rounds, amount })
  });
  if (!res.ok) {
    throw await parseApiError(res);
  }
  return (await res.json()) as DemoRunResponse;
}

export async function stopDemo(): Promise<DemoStopResponse> {
  const res = await fetch(`${API_BASE}/demo/stop`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({})
  });
  if (!res.ok) {
    throw await parseApiError(res);
  }
  return (await res.json()) as DemoStopResponse;
}

export async function createWallet(name: string, strategy: "heuristic_ai" | "random" = "heuristic_ai") {
  const res = await fetch(`${API_BASE}/wallets`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, strategy })
  });
  if (!res.ok) {
    throw await parseApiError(res);
  }
  return (await res.json()) as { wallet: WalletAccount };
}

export async function listWallets() {
  const res = await fetch(`${API_BASE}/wallets`, { cache: "no-store" });
  if (!res.ok) {
    throw await parseApiError(res);
  }
  return (await res.json()) as { wallets: WalletAccount[] };
}

export async function fundWallet(walletId: string, lamports: number) {
  const res = await fetch(`${API_BASE}/wallets/${walletId}/fund`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ lamports })
  });
  if (!res.ok) {
    throw await parseApiError(res);
  }
  return (await res.json()) as { ok: boolean; signature: string };
}

export async function executeWallet(walletId: string, rounds: number, amount: number) {
  const res = await fetch(`${API_BASE}/wallets/${walletId}/execute`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ rounds, amount })
  });
  if (!res.ok) {
    throw await parseApiError(res);
  }
  return (await res.json()) as { ok: boolean; rounds: number; signatures: string[]; errors: string[]; holds: number };
}

export async function getWalletTransactions(walletId: string) {
  const res = await fetch(`${API_BASE}/wallets/${walletId}/transactions`, { cache: "no-store" });
  if (!res.ok) {
    throw await parseApiError(res);
  }
  return (await res.json()) as { walletId: string; transactions: WalletTransaction[] };
}

export async function getWalletMonitor(walletId: string) {
  const res = await fetch(`${API_BASE}/wallets/${walletId}/monitor`, { cache: "no-store" });
  if (!res.ok) {
    throw await parseApiError(res);
  }
  return (await res.json()) as WalletMonitor;
}
