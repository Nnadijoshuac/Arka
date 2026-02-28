import type { Agent } from "../lib/api";

export function AgentDetail({ agent }: { agent?: Agent }) {
  if (!agent) {
    return <div>Select an agent from the table.</div>;
  }

  return (
    <div>
      <h3>Agent Detail</h3>
      <p>Agent ID: {agent.agentId}</p>
      <p>Public Key: {agent.publicKey}</p>
      <p>Last Status: {agent.lastStatus}</p>
      <p>Last Signature: {agent.lastSignature ?? "n/a"}</p>
      <p>Error: {agent.lastError ?? "none"}</p>
    </div>
  );
}
