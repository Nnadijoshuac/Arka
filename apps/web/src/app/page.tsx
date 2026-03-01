import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="landing-root">
      <div className="container">
        <nav className="landing-nav">
          <div className="logo-mark">Arka Protocol</div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/app" className="btn btn-primary">
              Launch App
            </Link>
          </div>
        </nav>

        <section className="hero">
          <div>
            <div className="pill">Solana Devnet Agent Infrastructure</div>
            <h1 className="display">Autonomous Wallet Operations, Controlled by Policy.</h1>
            <p>
              Arka orchestrates agent wallets for repeatable onchain execution across setup, simulation, execution,
              and monitoring. Built for deterministic devnet testing with strict transaction policy controls.
            </p>
            <div className="hero-actions">
              <Link href="/app" className="btn btn-primary">
                Open Dashboard
              </Link>
              <a href="#capabilities" className="btn btn-ghost">
                View Capabilities
              </a>
            </div>
          </div>

          <aside className="card hero-side">
            <div className="subtle" style={{ fontWeight: 600 }}>
              Live Model
            </div>
            <div className="hero-metrics">
              <div className="metric">
                <h3>5x</h3>
                <p>Default parallel agents per setup cycle.</p>
              </div>
              <div className="metric">
                <h3>3 rounds</h3>
                <p>Default deterministic batch run for repeatable swap simulations.</p>
              </div>
              <div className="metric">
                <h3>Policy first</h3>
                <p>Program allowlist + spend caps + daily volume controls before send.</p>
              </div>
            </div>
          </aside>
        </section>

        <section id="capabilities" className="feature-grid">
          <article className="card feature">
            <div className="pill">Provisioning</div>
            <h4>Agent and Mint Bootstrap</h4>
            <p>Create agents, issue token mints, initialize a mock pool, and seed balances with one controlled flow.</p>
          </article>

          <article className="card feature">
            <div className="pill">Execution</div>
            <h4>Batch Swap Simulation</h4>
            <p>Run multi-round swaps through deployed Anchor instructions and capture signatures per execution step.</p>
          </article>

          <article className="card feature">
            <div className="pill">Observability</div>
            <h4>Streamed Operational Log</h4>
            <p>Inspect status, errors, and signatures in a live event feed connected through WebSocket telemetry.</p>
          </article>
        </section>
      </div>
    </main>
  );
}
