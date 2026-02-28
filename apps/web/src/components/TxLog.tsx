export type TxEvent = {
  timestamp: string;
  agentId: string;
  action: string;
  status: string;
  signature?: string;
  err?: string;
};

export function TxLog({ events }: { events: TxEvent[] }) {
  return (
    <div>
      <h3>Transaction Log</h3>
      <ul>
        {events.slice(-20).map((evt, idx) => (
          <li key={`${evt.timestamp}-${idx}`}>
            [{evt.timestamp}] {evt.agentId} {evt.action} {evt.status} {evt.signature ?? evt.err}
          </li>
        ))}
      </ul>
    </div>
  );
}
