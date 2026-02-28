import type { Agent } from "../lib/api";

export function AgentTable({ agents }: { agents: Agent[] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>Agent</th>
          <th>Pubkey</th>
          <th>Status</th>
          <th>Strategy</th>
        </tr>
      </thead>
      <tbody>
        {agents.map((agent) => (
          <tr key={agent.agentId}>
            <td>{agent.agentId}</td>
            <td>{agent.publicKey.slice(0, 8)}...</td>
            <td>{agent.lastStatus}</td>
            <td>{agent.strategy}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
