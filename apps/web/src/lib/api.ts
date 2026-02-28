export type Agent = {
  agentId: string;
  publicKey: string;
  strategy: string;
  lastStatus: string;
  lastError?: string;
  lastSignature?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001";

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

export async function setupDemo(): Promise<void> {
  await fetch(`${API_BASE}/demo/setup`, { method: "POST" });
}

export async function runDemo(): Promise<void> {
  await fetch(`${API_BASE}/demo/run`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ intervalMs: 3000 })
  });
}

export async function stopDemo(): Promise<void> {
  await fetch(`${API_BASE}/demo/stop`, { method: "POST" });
}
