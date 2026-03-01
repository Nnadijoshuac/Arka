import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="landing-v3-root">
      <div className="container">
        <section className="landing-v3-shell">
          <nav className="landing-v3-nav">
            <div className="landing-v3-brand">
              <span className="landing-v3-brand-mark" />
              <span>Autarch</span>
            </div>

            <div className="landing-v3-links">
              <a href="#rollups">Rollups</a>
              <a href="#metacontrol">Metacontrol</a>
              <a href="#blog">Blog</a>
              <a href="#docs">Docs</a>
            </div>

            <div className="landing-v3-actions">
              <span className="landing-v3-icon">D</span>
              <span className="landing-v3-icon">X</span>
              <span className="landing-v3-icon">T</span>
              <Link href="/app" className="landing-v3-cta">
                Get Started
              </Link>
            </div>
          </nav>

          <section className="landing-v3-hero">
            <article className="landing-v3-headline-card">
              <h1 className="landing-v3-headline">The Internet Of Agent Wallets</h1>
            </article>

            <div className="landing-v3-top-pattern" />
            <div className="landing-v3-base-pattern" />

            <article className="landing-v3-info-card">
              <p>
                Autarch is a control plane for autonomous wallets, enabling safe multi-agent orchestration,
                execution, and observability across Solana environments.
              </p>

              <div className="landing-v3-info-actions">
                <Link href="/app" className="landing-v3-pill landing-v3-pill-primary">
                  Explore App
                </Link>
                <a href="#docs" className="landing-v3-pill landing-v3-pill-ghost">
                  View Docs
                </a>
              </div>
            </article>
          </section>
        </section>
      </div>
    </main>
  );
}
