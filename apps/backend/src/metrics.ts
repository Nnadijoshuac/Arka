import {
  Counter,
  Gauge,
  Histogram,
  Registry,
  collectDefaultMetrics,
  type Histogram as HistogramType
} from "prom-client";

export class AppMetrics {
  private readonly registry: Registry;
  private readonly txSuccessTotal: Counter<string>;
  private readonly txFailureTotal: Counter<string>;
  private readonly policyViolationTotal: Counter<string>;
  private readonly rpcLatencyMs: HistogramType<string>;
  private readonly activeAgents: Gauge<string>;

  constructor() {
    this.registry = new Registry();
    collectDefaultMetrics({ register: this.registry });

    this.txSuccessTotal = new Counter({
      name: "tx_success_total",
      help: "Total successful transactions",
      registers: [this.registry]
    });

    this.txFailureTotal = new Counter({
      name: "tx_failure_total",
      help: "Total failed transactions",
      registers: [this.registry]
    });

    this.policyViolationTotal = new Counter({
      name: "policy_violation_total",
      help: "Total policy violations",
      registers: [this.registry]
    });

    this.rpcLatencyMs = new Histogram({
      name: "rpc_latency_ms",
      help: "Observed RPC latency in milliseconds",
      buckets: [25, 50, 100, 250, 500, 1000, 2000, 5000],
      registers: [this.registry]
    });

    this.activeAgents = new Gauge({
      name: "active_agents",
      help: "Currently active agents",
      registers: [this.registry]
    });
  }

  incTxSuccess(): void {
    this.txSuccessTotal.inc();
  }

  incTxFailure(): void {
    this.txFailureTotal.inc();
  }

  incPolicyViolation(): void {
    this.policyViolationTotal.inc();
  }

  observeRpcLatency(ms: number): void {
    this.rpcLatencyMs.observe(ms);
  }

  setActiveAgents(count: number): void {
    this.activeAgents.set(count);
  }

  async expose(): Promise<string> {
    return this.registry.metrics();
  }

  contentType(): string {
    return this.registry.contentType;
  }
}
