import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="landing-v2-root">
      <div className="container">
        <section className="landing-v2-surface">
          <nav className="landing-v2-nav">
            <div className="landing-v2-brand">
              <span className="landing-v2-brand-mark" />
              <span>Autarch</span>
            </div>

            <div className="landing-v2-links">
              <a href="#rollups">Rollups</a>
              <a href="#metacontrol">Metacontrol</a>
              <a href="#blog">Blog</a>
              <a href="#docs">Docs</a>
            </div>

            <div className="landing-v2-nav-actions">
              <span className="landing-v2-icon">D</span>
              <span className="landing-v2-icon">X</span>
              <span className="landing-v2-icon">T</span>
              <Link href="/app" className="landing-v2-cta">
                Get Started
              </Link>
            </div>
          </nav>

          <section className="landing-v2-hero">
            <div className="landing-v2-headline-card">
              <h1 className="landing-v2-headline display">The Internet Of Agent Wallets</h1>
            </div>

            <div className="landing-v2-pattern landing-v2-pattern-top" />
            <div className="landing-v2-pattern landing-v2-pattern-bottom" />

            <div className="landing-v2-info-card">
              <p>
                Autarch is a control plane for autonomous wallets, enabling safe multi-agent orchestration, execution,
                and observability across Solana environments.
              </p>
              <div className="landing-v2-info-actions">
                <Link href="/app" className="landing-v2-pill-btn landing-v2-pill-btn-primary">
                  Explore App
                </Link>
                <a href="#docs" className="landing-v2-pill-btn landing-v2-pill-btn-ghost">
                  View Docs
                </a>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
