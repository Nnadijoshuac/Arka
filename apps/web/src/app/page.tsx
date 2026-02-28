"use client";

import { useEffect, useMemo, useState } from "react";
import { AgentDetail } from "../components/AgentDetail";
import { AgentTable } from "../components/AgentTable";
import { TxLog, type TxEvent } from "../components/TxLog";
import { createAgents, listAgents, runDemo, setupDemo, stopDemo, type Agent } from "../lib/api";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001/ws";

export default function HomePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [events, setEvents] = useState<TxEvent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(undefined);

  useEffect(() => {
    void refreshAgents();
  }, []);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    ws.onmessage = (message) => {
      const evt = JSON.parse(message.data as string) as TxEvent;
      setEvents((prev) => [...prev, evt]);
      void refreshAgents();
    };
    return () => ws.close();
  }, []);

  const selected = useMemo(
    () => agents.find((a) => a.agentId === selectedAgentId) ?? agents[0],
    [agents, selectedAgentId]
  );

  async function refreshAgents() {
    const next = await listAgents();
    setAgents(next);
  }

  return (
    <main style={{ fontFamily: "Georgia, serif", padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1>Agentic Wallet Dashboard</h1>
      <p>Solana devnet-only autonomous wallet prototype.</p>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <button
          onClick={async () => {
            await createAgents(3);
            await refreshAgents();
          }}
        >
          Create Agents
        </button>
        <button onClick={setupDemo}>Fund/Setup Demo</button>
        <button onClick={runDemo}>Run Demo</button>
        <button onClick={stopDemo}>Stop Demo</button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: 16,
          alignItems: "start"
        }}
      >
        <div
          onClick={() => {
            if (agents[0]) setSelectedAgentId(agents[0].agentId);
          }}
          style={{ border: "1px solid #ccc", padding: 12, borderRadius: 8 }}
        >
          <AgentTable agents={agents} />
        </div>

        <div style={{ border: "1px solid #ccc", padding: 12, borderRadius: 8 }}>
          <AgentDetail agent={selected} />
        </div>
      </div>

      <div style={{ marginTop: 16, border: "1px solid #ccc", padding: 12, borderRadius: 8 }}>
        <TxLog events={events} />
      </div>
    </main>
  );
}
