 "use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function LandingPage() {
  const backImageRef = useRef<HTMLImageElement | null>(null);
  const frontImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const backImage = backImageRef.current;
    const image = frontImageRef.current;
    if (!image || !backImage) return;
    if (window.matchMedia("(max-width: 1000px)").matches) return;

    let raf = 0;
    let currentFrontX = 0;
    let currentFrontY = 0;
    let targetFrontX = 0;
    let targetFrontY = 0;
    let currentBackX = 0;
    let currentBackY = 0;
    let targetBackX = 0;
    let targetBackY = 0;

    const animate = () => {
      currentFrontX += (targetFrontX - currentFrontX) * 0.12;
      currentFrontY += (targetFrontY - currentFrontY) * 0.12;
      currentBackX += (targetBackX - currentBackX) * 0.1;
      currentBackY += (targetBackY - currentBackY) * 0.1;

      image.style.setProperty("--hero-parallax-x", `${currentFrontX.toFixed(2)}px`);
      image.style.setProperty("--hero-parallax-y", `${currentFrontY.toFixed(2)}px`);
      backImage.style.setProperty("--hero-parallax-back-x", `${currentBackX.toFixed(2)}px`);
      backImage.style.setProperty("--hero-parallax-back-y", `${currentBackY.toFixed(2)}px`);
      raf = window.requestAnimationFrame(animate);
    };

    const onMove = (event: MouseEvent) => {
      const nx = (event.clientX / window.innerWidth - 0.5) * 2;
      const ny = (event.clientY / window.innerHeight - 0.5) * 2;
      targetFrontX = -nx * 7;
      targetFrontY = -ny * 7;
      targetBackX = nx * 3;
      targetBackY = 0;
    };

    const onLeave = () => {
      targetFrontX = 0;
      targetFrontY = 0;
      targetBackX = 0;
      targetBackY = 0;
    };

    raf = window.requestAnimationFrame(animate);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const features = [
    {
      title: "Programmatic Wallets",
      description: "Create isolated agent accounts on demand.",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2H3V7Zm0 4h18v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6Zm13 3a1.5 1.5 0 1 0 0 3h2v-3h-2Z" />
        </svg>
      )
    },
    {
      title: "Automated Signing",
      description: "Execute policy-checked transactions without manual signing.",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2a6 6 0 0 0-6 6v3H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1V8a6 6 0 0 0-6-6Zm-4 9V8a4 4 0 1 1 8 0v3H8Z" />
        </svg>
      )
    },
    {
      title: "SOL + SPL Assets",
      description: "Fund wallets and manage balances across token standards.",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2 3 6v6c0 5.25 3.45 8.95 9 10 5.55-1.05 9-4.75 9-10V6l-9-4Zm1 5h4v2h-4V7Zm-6 0h4v2H7V7Zm0 4h10v2H7v-2Zm0 4h10v2H7v-2Z" />
        </svg>
      )
    },
    {
      title: "Transaction Monitor",
      description: "Track every execution path with live operational telemetry.",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 3h18v2H3V3Zm2 4h14v14H5V7Zm2 2v10h10V9H7Zm2 2h2v6H9v-6Zm4 2h2v4h-2v-4Z" />
        </svg>
      )
    }
  ];

  return (
    <main className="minimal-landing">
      <header className="minimal-nav container">
        <div className="minimal-brand">
          <Image
            src="/autarchlogo.png"
            alt="Autarch District"
            width={192}
            height={108}
            quality={100}
            priority
            className="minimal-brand-logo"
            style={{ imageRendering: "auto" }}
          />
          <span className="minimal-brand-text">Autarch District</span>
        </div>
        <nav className="minimal-nav-links" aria-label="Primary navigation">
          <Link href="#" className="minimal-nav-link">
            Docs
          </Link>
          <Link href="https://github.com/Nnadijoshuac/AutarchDistrict" className="minimal-nav-link" target="_blank" rel="noreferrer">
            GitHub
          </Link>
          <Link href="/app" className="minimal-btn minimal-btn-primary">
            Launch App
          </Link>
        </nav>
      </header>

      <section className="minimal-hero-shell">
        <div className="minimal-hero container">
          <div className="minimal-copy">
            <p className="minimal-kicker">AGENT WALLET INFRASTRUCTURE</p>
            <h1>
              <span className="hero-line">Financial Infrastructure</span>
              <span className="hero-line">for Autonomous Agents</span>
            </h1>
            <p className="minimal-subtext">
              Create and fund agent wallets,{"\u00A0"}execute policy-safe transactions, and monitor on-chain activity
              from one dashboard.
            </p>
            <div className="minimal-actions">
              <Link href="/app" className="minimal-btn minimal-btn-primary">
                Launch App
              </Link>
              <Link href="#" className="minimal-btn minimal-btn-secondary">
                Read Docs
              </Link>
            </div>
            <a href="#overview" className="minimal-text-link">
              Explore capabilities
            </a>
          </div>
        </div>
      </section>

      <div className="minimal-floating-media" aria-hidden="true">
        <div className="image-stack">
          <Image ref={backImageRef} src="/5.png" alt="" width={520} height={680} className="stack-back" priority />
          <Image ref={frontImageRef} src="/6.png" alt="" width={520} height={680} className="stack-front" priority />
        </div>
      </div>

      <section id="overview" className="minimal-strip container" aria-label="Platform capabilities">
        {features.map((feature) => (
          <article key={feature.title} className="minimal-pill">
            <div className="minimal-pill-icon">{feature.icon}</div>
            <div>
              <h2>{feature.title}</h2>
              <p>{feature.description}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
