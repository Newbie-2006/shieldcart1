"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function LandingPage() {
  const tlRef = useRef(null);

  useEffect(() => {
    const rows = document.querySelectorAll(".tl-row");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const siblings = [...entry.target.parentElement.children];
            const i = siblings.indexOf(entry.target);
            setTimeout(() => entry.target.classList.add("visible"), i * 100);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    rows.forEach((r) => obs.observe(r));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style jsx global>{`
        /* ── NAV (landing) ── */
        .landing-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 52px;
          background: rgba(250,247,242,0.92);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--sand3);
        }

        .logo {
          font-family: 'Manrope', sans-serif;
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--bark);
          letter-spacing: -0.02em;
          text-decoration: none;
        }
        .logo span { color: var(--olive); }
        .logo sup {
          font-size: 0.5rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--burnt);
          font-weight: 700;
          vertical-align: super;
          margin-left: 3px;
        }

        .nav-links { display: flex; align-items: center; gap: 32px; }
        .nav-link {
          font-size: 0.82rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          color: var(--stone);
          text-decoration: none;
          transition: color 0.2s;
        }
        .nav-link:hover { color: var(--olive); }

        .nav-pill {
          background: var(--olive2);
          color: var(--white);
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 10px 20px;
          border-radius: 100px;
          text-decoration: none;
        }

        /* ── HERO ── */
        .hero {
          min-height: 100vh;
          padding: 140px 52px 80px;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 60px;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
        }

        .hero::before {
          content: '';
          position: fixed;
          top: -200px; right: -200px;
          width: 700px; height: 700px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(196,82,26,0.07) 0%, transparent 65%);
          pointer-events: none;
          z-index: 0;
        }

        .hero-left { position: relative; z-index: 1; }

        .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--olive-pale);
          border: 1px solid var(--olive-mid);
          color: var(--olive2);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 6px 16px;
          border-radius: 100px;
          margin-bottom: 32px;
          animation: riseUp 0.8s ease both;
        }

        .hero-tag::before {
          content: '';
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--olive);
        }

        .hero h1 {
          font-family: 'Lora', serif;
          font-size: clamp(2.8rem, 5vw, 4.4rem);
          font-weight: 500;
          line-height: 1.12;
          color: var(--bark);
          letter-spacing: -0.01em;
          animation: riseUp 0.8s 0.08s ease both;
        }

        .hero h1 em {
          font-style: italic;
          color: var(--olive);
        }

        .hero h1 .accent {
          font-style: italic;
          color: var(--burnt);
          font-family: 'Lora', serif;
        }

        .hero-body {
          margin-top: 24px;
          font-size: 1.05rem;
          color: var(--stone);
          font-weight: 300;
          max-width: 460px;
          line-height: 1.85;
          animation: riseUp 0.8s 0.16s ease both;
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          margin-top: 40px;
          animation: riseUp 0.8s 0.24s ease both;
        }

        /* Hero right — stat cards */
        .hero-right {
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: riseUp 0.8s 0.2s ease both;
          position: relative; z-index: 1;
        }

        .hero-stat-card {
          background: var(--white);
          border: 1px solid var(--sand3);
          border-radius: 20px;
          padding: 28px 30px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 2px 16px rgba(59,47,30,0.05);
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .hero-stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(59,47,30,0.1); }

        .sc-icon {
          width: 56px; height: 56px;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .icon-olive { background: var(--olive-pale); }
        .icon-burnt { background: var(--burnt-pale); }
        .icon-sand  { background: var(--sand2); }

        .sc-num {
          font-family: 'Lora', serif;
          font-size: 2rem;
          font-weight: 500;
          color: var(--bark);
          line-height: 1;
        }
        .sc-num span { color: var(--olive); }
        .sc-num .red { color: var(--burnt); }

        .sc-label {
          font-size: 0.82rem;
          color: var(--stone);
          margin-top: 4px;
          font-weight: 400;
        }

        /* ── SHARED SECTION ── */
        .sec {
          padding: 96px 52px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .sec-full {
          padding: 96px 52px;
        }

        .sec-full .sec-inner {
          max-width: 1200px;
          margin: 0 auto;
        }

        .tag-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 5px 14px;
          border-radius: 100px;
          margin-bottom: 20px;
        }

        .chip-olive { background: var(--olive-pale); color: var(--olive2); border: 1px solid var(--olive-mid); }
        .chip-burnt { background: var(--burnt-pale); color: var(--burnt2); border: 1px solid rgba(196,82,26,0.25); }
        .chip-sand  { background: var(--sand2); color: var(--bark); border: 1px solid var(--sand3); }

        .sec-h {
          font-family: 'Lora', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 500;
          line-height: 1.2;
          color: var(--bark);
          margin-bottom: 14px;
          letter-spacing: -0.01em;
        }

        .sec-h em { font-style: italic; color: var(--olive); }
        .sec-h .red-em { font-style: italic; color: var(--burnt); }

        .sec-p {
          font-size: 0.98rem;
          color: var(--stone);
          font-weight: 300;
          max-width: 520px;
          line-height: 1.85;
        }

        /* ── DIVIDER ── */
        .ruled {
          height: 1px;
          background: var(--sand3);
          max-width: 1200px;
          margin: 0 auto;
        }

        /* ── PROBLEM ── */
        .problem-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          margin-top: 52px;
        }

        .problem-card {
          background: var(--white);
          border: 1px solid var(--sand3);
          border-radius: 20px;
          padding: 32px 26px;
          position: relative;
          overflow: hidden;
          transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
        }
        .problem-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(59,47,30,0.09); border-color: rgba(196,82,26,0.3); }

        .problem-card::after {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: var(--burnt);
          border-radius: 3px 0 0 3px;
          transform: scaleY(0);
          transform-origin: bottom;
          transition: transform 0.3s ease;
        }
        .problem-card:hover::after { transform: scaleY(1); }

        .prob-icon { font-size: 2rem; margin-bottom: 16px; }
        .problem-card h3 { font-size: 0.97rem; font-weight: 700; color: var(--bark); margin-bottom: 8px; }
        .problem-card p  { font-size: 0.87rem; color: var(--stone); line-height: 1.7; }

        /* ── TWO SIDED ── */
        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 52px;
        }

        .ts-box {
          border-radius: 24px;
          padding: 40px 36px;
          transition: transform 0.25s;
        }
        .ts-box:hover { transform: translateY(-4px); }

        .ts-box.consumer {
          background: var(--olive-pale);
          border: 1px solid var(--olive-mid);
        }
        .ts-box.seller {
          background: var(--burnt-pale);
          border: 1px solid rgba(196,82,26,0.22);
        }

        .ts-box h3 {
          font-family: 'Lora', serif;
          font-size: 1.5rem;
          font-weight: 500;
          margin-bottom: 6px;
        }
        .consumer h3 { color: var(--olive2); }
        .seller h3   { color: var(--burnt2); }

        .ts-box small {
          font-size: 0.82rem;
          display: block;
          margin-bottom: 26px;
          font-weight: 400;
        }
        .consumer small { color: var(--olive); }
        .seller small   { color: var(--burnt); }

        .ts-items { display: flex; flex-direction: column; gap: 12px; }

        .ts-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          font-size: 0.9rem;
          line-height: 1.65;
        }
        .consumer .ts-item { color: #3d4a26; }
        .seller .ts-item   { color: #5a4820; }

        .ts-dot {
          width: 20px; height: 20px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.72rem;
          font-weight: 800;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .consumer .ts-dot { background: var(--olive-mid); color: var(--olive2); }
        .seller .ts-dot   { background: rgba(196,82,26,0.2); color: var(--burnt2); }

        /* ── TIMELINE ── */
        .tl { display: flex; flex-direction: column; margin-top: 52px; }

        .tl-row {
          display: grid;
          grid-template-columns: 52px 1fr;
          gap: 24px;
          padding: 28px 0;
          border-bottom: 1px solid var(--sand3);
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .tl-row:last-child { border-bottom: none; }
        .tl-row.visible { opacity: 1; transform: translateY(0); }

        .tl-dot {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          padding-top: 4px;
        }

        .dot-circle {
          width: 36px; height: 36px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.82rem;
          font-weight: 800;
          flex-shrink: 0;
          font-family: 'Manrope', sans-serif;
        }

        .dot-olive  { background: var(--olive-pale); color: var(--olive); border: 1.5px solid var(--olive-mid); }
        .dot-burnt  { background: var(--burnt-pale); color: var(--burnt); border: 1.5px solid rgba(196,82,26,0.3); }

        .tl-content h3 {
          font-size: 1rem;
          font-weight: 700;
          color: var(--bark);
          margin-bottom: 6px;
        }
        .tl-content p { font-size: 0.88rem; color: var(--stone); line-height: 1.75; max-width: 620px; }

        .phase-label {
          font-size: 0.68rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .ph-olive { color: var(--olive); }
        .ph-burnt { color: var(--burnt); }

        /* ── COMPARISON ── */
        .compare-outer {
          margin-top: 52px;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid var(--sand3);
          overflow-x: auto;
        }

        table.cmp {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
        }

        .cmp th {
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 700;
          padding: 16px 22px;
          text-align: left;
          background: var(--sand2);
          color: var(--stone);
          border-bottom: 1px solid var(--sand3);
        }
        .cmp th.sc { background: var(--olive); color: var(--white); }

        .cmp td {
          padding: 14px 22px;
          border-bottom: 1px solid var(--sand2);
          color: var(--stone);
          background: var(--white);
          font-weight: 300;
        }
        .cmp td:first-child { font-weight: 600; color: var(--bark); }
        .cmp td.sc { background: var(--olive-pale); color: var(--bark); font-weight: 600; }
        .cmp tr:last-child td { border-bottom: none; }

        .yes { color: var(--olive); font-weight: 700; }
        .no  { color: #b08060; }

        /* ── REVENUE ── */
        .rev-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 16px;
          margin-top: 52px;
        }

        .rev-card {
          background: var(--white);
          border: 1px solid var(--sand3);
          border-radius: 20px;
          padding: 32px 26px;
          transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
          position: relative;
          overflow: hidden;
        }
        .rev-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--olive);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s;
        }
        .rev-card:hover::before { transform: scaleX(1); }
        .rev-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(59,47,30,0.08); }

        .rev-num {
          font-family: 'Lora', serif;
          font-size: 2.6rem;
          font-weight: 500;
          color: var(--olive2);
          line-height: 1;
          margin-bottom: 12px;
        }
        .rev-card h4 { font-size: 0.92rem; font-weight: 700; color: var(--bark); margin-bottom: 6px; }
        .rev-card p  { font-size: 0.83rem; color: var(--stone); line-height: 1.65; }

        /* ── IMPACT ── */
        .impact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px;
          margin-top: 52px;
        }

        .impact-card {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          background: var(--white);
          border: 1px solid var(--sand3);
          border-radius: 16px;
          padding: 24px 22px;
          transition: transform 0.25s, border-color 0.25s;
        }
        .impact-card:hover { transform: translateY(-3px); border-color: var(--olive-mid); }

        .imp-ic { font-size: 1.5rem; flex-shrink: 0; margin-top: 2px; }
        .impact-card h4 { font-size: 0.9rem; font-weight: 700; color: var(--bark); margin-bottom: 4px; }
        .impact-card p  { font-size: 0.83rem; color: var(--stone); line-height: 1.6; }

        /* ── CTA BAND ── */
        .cta-band {
          background: var(--olive);
          padding: 80px 52px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .cta-band::before {
          content: '🛡';
          position: absolute;
          font-size: 24rem;
          opacity: 0.05;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .cta-band h2 {
          font-family: 'Lora', serif;
          font-size: clamp(2rem, 4.5vw, 3.4rem);
          font-weight: 500;
          color: var(--white);
          line-height: 1.2;
          max-width: 620px;
          margin: 0 auto 16px;
          position: relative;
        }
        .cta-band h2 em { font-style: italic; color: var(--olive-mid); }

        .cta-band p {
          color: rgba(254,252,249,0.7);
          font-size: 1rem;
          font-weight: 300;
          max-width: 440px;
          margin: 0 auto 40px;
          position: relative;
        }

        /* ── FOOTER ── */
        .landing-footer {
          background: var(--bark);
          padding: 44px 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }

        .footer-logo {
          font-family: 'Manrope', sans-serif;
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--sand);
          letter-spacing: -0.02em;
        }
        .footer-logo span { color: var(--olive-mid); }

        .footer-r {
          font-size: 0.78rem;
          color: var(--stone2);
          text-align: right;
          line-height: 1.8;
        }

        /* ── PLATFORMS STRIP ── */
        .platforms-strip {
          margin-top: 40px;
          background: var(--white);
          border: 1px solid var(--sand3);
          border-radius: 20px;
          padding: 22px 24px;
          box-shadow: 0 4px 20px rgba(59,47,30,0.07);
          animation: riseUp 0.8s 0.32s ease both;
        }

        .platforms-label {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--stone);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .platforms-label::before {
          content: '';
          display: inline-block;
          width: 20px; height: 2px;
          background: var(--olive);
          border-radius: 2px;
        }

        .platforms-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .platform-chip {
          background: var(--canvas);
          border: 1.5px solid var(--sand3);
          border-radius: 14px;
          padding: 12px 20px;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s, background 0.2s;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          min-width: 88px;
        }
        .platform-chip:hover {
          border-color: var(--olive-mid);
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(59,47,30,0.1);
          background: var(--white);
        }

        .p-icon {
          font-size: 1.4rem;
          line-height: 1;
        }

        .p-logo {
          font-weight: 800;
          font-size: 0.82rem;
          letter-spacing: -0.01em;
          line-height: 1;
        }

        .p-logo.amazon   { color: #e47911; font-family: 'Georgia', serif; }
        .p-logo.flipkart { color: #2874f0; font-family: 'Manrope', sans-serif; }
        .p-logo.meesho   { color: #9b2de8; font-family: 'Manrope', sans-serif; font-style: italic; }
        .p-logo.myntra   { color: #ff3e6c; font-family: 'Manrope', sans-serif; font-weight: 700; }
        .p-logo.nykaa    { color: #fc2779; font-family: 'Manrope', sans-serif; }

        .platform-chip.see-more {
          background: var(--olive-pale);
          border-color: var(--olive-mid);
          border-style: dashed;
        }
        .platform-chip.see-more:hover { background: var(--olive-pale); border-color: var(--olive); border-style: dashed; }

        .see-more-text {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--olive2);
          letter-spacing: 0.02em;
        }
        .see-more-sub {
          font-size: 0.7rem;
          color: var(--olive);
          font-weight: 500;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .hero { grid-template-columns: 1fr; padding: 120px 24px 60px; }
          .landing-nav { padding: 16px 24px; }
          .nav-links .nav-link { display: none; }
          .sec, .sec-full { padding: 72px 24px; }
          .cta-band { padding: 64px 24px; }
          .landing-footer { padding: 36px 24px; }
          .two-col { grid-template-columns: 1fr; }
        }

        .red-em { font-style: italic; color: var(--burnt); }
      `}</style>

      {/* NAV */}
      <nav className="landing-nav">
        <Link href="/" className="logo">
          Shield<span>Cart</span><sup>®</sup>
        </Link>
        <div className="nav-links">
          <Link href="/login" className="nav-link">Log in</Link>
          <Link href="/signup" className="nav-pill">Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <div className="hero-tag">Consumer Protection Platform</div>
          <h1>
            Every Product.<br />
            <em>Inspected.</em><br />
            Before It<br />
            <span className="accent">Reaches You.</span>
          </h1>
          <p className="hero-body">
            ShieldCart sits between online marketplaces and you — physically inspecting every product before delivery so you never receive defective, counterfeit, or wrong items. Your safety, guaranteed.
          </p>
          <div className="hero-actions">
            <Link href="/signup" className="btn-olive" style={{ textDecoration: 'none' }}>
              See How It Works
            </Link>
            <a href="#problem" className="btn-soft" style={{ textDecoration: 'none' }}>
              Our Story ↓
            </a>
          </div>

          {/* PLATFORMS STRIP */}
          <div className="platforms-strip">
            <div className="platforms-label">Shop through your favourite platforms</div>
            <div className="platforms-row">
              <Link href="/order/new?platform=Amazon" className="platform-chip" style={{ textDecoration: 'none' }}>
                <div className="p-icon">🛒</div>
                <span className="p-logo amazon">amazon</span>
              </Link>
              <Link href="/order/new?platform=Flipkart" className="platform-chip" style={{ textDecoration: 'none' }}>
                <div className="p-icon">🏷️</div>
                <span className="p-logo flipkart">Flipkart</span>
              </Link>
              <Link href="/order/new?platform=Meesho" className="platform-chip" style={{ textDecoration: 'none' }}>
                <div className="p-icon">🛍️</div>
                <span className="p-logo meesho">meesho</span>
              </Link>
              <Link href="/order/new?platform=Myntra" className="platform-chip" style={{ textDecoration: 'none' }}>
                <div className="p-icon">👗</div>
                <span className="p-logo myntra">myntra</span>
              </Link>
              <Link href="/order/new?platform=Nykaa" className="platform-chip" style={{ textDecoration: 'none' }}>
                <div className="p-icon">💄</div>
                <span className="p-logo nykaa">nykaa</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-stat-card">
            <div className="sc-icon icon-olive">🔍</div>
            <div>
              <div className="sc-num">100<span>%</span></div>
              <div className="sc-label">Products physically inspected before delivery</div>
            </div>
          </div>
          <div className="hero-stat-card">
            <div className="sc-icon icon-burnt">🔄</div>
            <div>
              <div className="sc-num"><span className="red">2×</span></div>
              <div className="sc-label">Protection — consumers and sellers both covered</div>
            </div>
          </div>
          <div className="hero-stat-card">
            <div className="sc-icon icon-sand">🛒</div>
            <div>
              <div className="sc-num">All</div>
              <div className="sc-label">Major platforms — Amazon, Flipkart, Meesho & more</div>
            </div>
          </div>
        </div>
      </section>

      <div className="ruled"></div>

      {/* PROBLEM */}
      <section id="problem" className="sec">
        <div className="tag-chip chip-burnt">The Problem</div>
        <h2 className="sec-h">Online Shopping Has a<br /><span className="red-em">Trust Problem</span></h2>
        <p className="sec-p">Buyers receive fakes. Sellers face fraudulent returns. Platforms stay neutral. No one is protecting either side.</p>

        <div className="problem-grid">
          <div className="problem-card">
            <div className="prob-icon">🎭</div>
            <h3>Counterfeit Products</h3>
            <p>Fake goods listed under genuine brand names reach buyers every day. Platforms use algorithms — not physical checks.</p>
          </div>
          <div className="problem-card">
            <div className="prob-icon">📦</div>
            <h3>Defective Deliveries</h3>
            <p>Damaged, wrong, or substandard items are delivered with no independent verification before handover.</p>
          </div>
          <div className="problem-card">
            <div className="prob-icon">🔄</div>
            <h3>Return Fraud</h3>
            <p>Customers swap genuine items with fakes before returning, or falsely claim non-delivery — sellers are left with no recourse.</p>
          </div>
          <div className="problem-card">
            <div className="prob-icon">⚖️</div>
            <h3>No Neutral Referee</h3>
            <p>When buyer and seller dispute a transaction, there&#39;s no evidence-backed system to settle it fairly.</p>
          </div>
        </div>
      </section>

      <div className="ruled"></div>

      {/* COMPLETE PROTECTION */}
      <section id="solution" className="sec">
        <div className="tag-chip chip-olive">Our Core Strength</div>
        <h2 className="sec-h">Complete Protection<br /><em>At Every Step</em></h2>
        <p className="sec-p">From the moment you place an order to the moment it reaches your door — ShieldCart ensures you only receive genuine, quality-checked products.</p>

        <div className="two-col">
          <div className="ts-box consumer">
            <div className="tag-chip chip-olive" style={{ marginBottom: '14px' }}>Before Delivery</div>
            <h3>Every Product Inspected</h3>
            <small>What happens before your order reaches you</small>
            <div className="ts-items">
              <div className="ts-item"><span className="ts-dot">✓</span>Physical inspection before every delivery — no defective products reach you</div>
              <div className="ts-item"><span className="ts-dot">✓</span>Authenticity verified against serial numbers and brand markers</div>
              <div className="ts-item"><span className="ts-dot">✓</span>Every product photographed and documented for your records</div>
              <div className="ts-item"><span className="ts-dot">✓</span>Timestamped inspection certificate delivered with every order</div>
              <div className="ts-item"><span className="ts-dot">✓</span>If anything slips through our check — we take full accountability</div>
            </div>
          </div>

          <div className="ts-box seller">
            <div className="tag-chip chip-burnt" style={{ marginBottom: '14px' }}>Hassle-Free Returns</div>
            <h3>Easy & Verified Returns</h3>
            <small>How we make returns effortless for you</small>
            <div className="ts-items">
              <div className="ts-item"><span className="ts-dot">✓</span>Request returns instantly from your dashboard — no marketplace runaround</div>
              <div className="ts-item"><span className="ts-dot">✓</span>Our inspection archive proves the product condition at delivery</div>
              <div className="ts-item"><span className="ts-dot">✓</span>Faster refund processing with verified evidence on your side</div>
              <div className="ts-item"><span className="ts-dot">✓</span>Full photographic proof available for any dispute resolution</div>
              <div className="ts-item"><span className="ts-dot">✓</span>ShieldCart handles the entire return process — you just sit back</div>
            </div>
          </div>
        </div>
      </section>

      <div className="ruled"></div>

      {/* PROCESS */}
      <section id="process" className="sec" style={{ background: 'var(--sand)', maxWidth: '100%', padding: '96px 52px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="tag-chip chip-olive">How It Works</div>
          <h2 className="sec-h">A Complete Chain<br /><em>of Custody</em></h2>
          <p className="sec-p">Every product has a documented, unbroken record from marketplace to customer door and back. Nothing goes unaccounted for.</p>

          <div className="tl" id="tl" ref={tlRef}>
            <div className="tl-row">
              <div className="tl-dot"><div className="dot-circle dot-olive">1</div></div>
              <div className="tl-content">
                <div className="phase-label ph-olive">Order Phase</div>
                <h3>Customer Orders Through ShieldCart</h3>
                <p>Tell us what you want from Amazon, Flipkart, Meesho — any marketplace. We place the order with delivery to our inspection hub, not your home.</p>
              </div>
            </div>
            <div className="tl-row">
              <div className="tl-dot"><div className="dot-circle dot-olive">2</div></div>
              <div className="tl-content">
                <div className="phase-label ph-olive">Evidence Phase</div>
                <h3>Package Arrives — Proof Created Immediately</h3>
                <p>The sealed package is photographed in full — outer box, seal condition, inner packaging, and product from every angle. Timestamped and archived. This is your legal proof-of-original-condition record.</p>
              </div>
            </div>
            <div className="tl-row">
              <div className="tl-dot"><div className="dot-circle dot-olive">3</div></div>
              <div className="tl-content">
                <div className="phase-label ph-olive">Inspection Phase</div>
                <h3>Physical Quality & Authenticity Check</h3>
                <p>Our trained inspectors check the product against the listing — defects, counterfeit markers, wrong items, missing accessories. Every check logged digitally with photos.</p>
              </div>
            </div>
            <div className="tl-row">
              <div className="tl-dot"><div className="dot-circle dot-olive">4</div></div>
              <div className="tl-content">
                <div className="phase-label ph-olive">Delivery Phase</div>
                <h3>Verified → Dispatched with Certificate</h3>
                <p>Products that pass are repackaged with our ShieldCart Verified seal and sent to you with a full digital inspection certificate — every check documented with timestamps.</p>
              </div>
            </div>
            <div className="tl-row">
              <div className="tl-dot"><div className="dot-circle dot-burnt">5</div></div>
              <div className="tl-content">
                <div className="phase-label ph-burnt">Return Phase</div>
                <h3>Returns Come to Us First — Always</h3>
                <p>Any return is routed back to our hub. We verify: same product? Same serial number? Damage genuine or customer-caused? We cross-check our pre-delivery archive before approving anything.</p>
              </div>
            </div>
            <div className="tl-row">
              <div className="tl-dot"><div className="dot-circle dot-burnt">6</div></div>
              <div className="tl-content">
                <div className="phase-label ph-burnt">Resolution Phase</div>
                <h3>Evidence-Based Arbitration — Always Fair</h3>
                <p>Legitimate returns processed instantly. Fraudulent claims blocked and documented. Repeat offenders blacklisted on both sides. Every resolution backed by photographic evidence — no guesswork, no bias.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="sec">
        <div className="tag-chip chip-sand">Vs. The Market</div>
        <h2 className="sec-h">Nothing Else<br /><em>Covers All of This</em></h2>
        <p className="sec-p">ShieldCart fills a gap no marketplace, logistics firm, or consumer forum has addressed.</p>

        <div className="compare-outer">
          <table className="cmp">
            <thead>
              <tr>
                <th>Capability</th>
                <th>Amazon / Flipkart</th>
                <th className="sc">ShieldCart ✦</th>
                <th>Consumer Courts</th>
                <th>3PL Logistics</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Physical Inspection Before Delivery</td>
                <td><span className="no">✗</span> None</td>
                <td className="sc"><span className="yes">✓</span> Every order</td>
                <td><span className="no">✗</span> None</td>
                <td><span className="no">✗</span> None</td>
              </tr>
              <tr>
                <td>Return Authentication</td>
                <td><span className="no">✗</span> Not verified</td>
                <td className="sc"><span className="yes">✓</span> Photo-matched</td>
                <td><span className="no">✗</span> None</td>
                <td><span className="no">✗</span> None</td>
              </tr>
              <tr>
                <td>Seller Fraud Protection</td>
                <td><span className="no">✗</span> Weak</td>
                <td className="sc"><span className="yes">✓</span> Full evidence</td>
                <td>Partial</td>
                <td><span className="no">✗</span> None</td>
              </tr>
              <tr>
                <td>Handles Returns for Consumer</td>
                <td><span className="no">✗</span> Self-service</td>
                <td className="sc"><span className="yes">✓</span> We manage it</td>
                <td><span className="no">✗</span> No</td>
                <td><span className="no">✗</span> No</td>
              </tr>
              <tr>
                <td>Chain of Custody Documentation</td>
                <td><span className="no">✗</span> None</td>
                <td className="sc"><span className="yes">✓</span> Full record</td>
                <td><span className="no">✗</span> None</td>
                <td><span className="no">✗</span> None</td>
              </tr>
              <tr>
                <td>Works Across All Platforms</td>
                <td><span className="no">✗</span> One only</td>
                <td className="sc"><span className="yes">✓</span> All platforms</td>
                <td>Case by case</td>
                <td><span className="no">✗</span> No</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="ruled"></div>

      {/* REVENUE */}
      <section id="model" className="sec" style={{ background: 'var(--sand)', maxWidth: '100%', padding: '96px 52px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="tag-chip chip-olive">Business Model</div>
          <h2 className="sec-h">Built to Scale,<br /><em>Multiple Streams</em></h2>

          <div className="rev-row">
            <div className="rev-card">
              <div className="rev-num">₹99</div>
              <h4>Per-Order Fee</h4>
              <p>Flat inspection and verification charge per order. Transparent and predictable.</p>
            </div>
            <div className="rev-card">
              <div className="rev-num">₹499</div>
              <h4>Monthly Plan</h4>
              <p>Unlimited inspections for frequent shoppers across all platforms.</p>
            </div>
            <div className="rev-card">
              <div className="rev-num">B2B</div>
              <h4>Seller Partner Plans</h4>
              <p>Sellers pay ShieldCart to serve as their certified return-authentication partner.</p>
            </div>
            <div className="rev-card">
              <div className="rev-num">API</div>
              <h4>Platform Licensing</h4>
              <p>License our inspection and dispute infrastructure to smaller marketplaces and D2C brands.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="ruled"></div>

      {/* IMPACT */}
      <section className="sec">
        <div className="tag-chip chip-olive">Social Impact</div>
        <h2 className="sec-h">Making Commerce<br /><em>Truly Fair</em></h2>
        <p className="sec-p">Every inspection, every verified return, every resolved dispute builds a more honest digital marketplace for everyone in India.</p>

        <div className="impact-grid">
          <div className="impact-card"><div className="imp-ic">📉</div><div><h4>90% Fewer Counterfeit Deliveries</h4><p>Physical checks catch what algorithms never can.</p></div></div>
          <div className="impact-card"><div className="imp-ic">🔒</div><div><h4>Eliminate Return Fraud</h4><p>Photo evidence makes fraudulent return claims impossible.</p></div></div>
          <div className="impact-card"><div className="imp-ic">📊</div><div><h4>Seller & Buyer Accountability Data</h4><p>Track quality and fraud patterns to drive ecosystem improvement.</p></div></div>
          <div className="impact-card"><div className="imp-ic">👷</div><div><h4>Local Job Creation</h4><p>Inspection hubs require trained staff — direct employment at scale.</p></div></div>
          <div className="impact-card"><div className="imp-ic">🌱</div><div><h4>Fewer Unnecessary Returns</h4><p>Catching defects early reduces shipping waste and emissions.</p></div></div>
          <div className="impact-card"><div className="imp-ic">⚖️</div><div><h4>Evidence-Based, Bias-Free Commerce</h4><p>Every dispute resolved with documented proof — not platform politics.</p></div></div>
        </div>
      </section>

      {/* CTA BAND */}
      <div className="cta-band">
        <h2>Shop Online With <em>Complete Confidence</em></h2>
        <p>ShieldCart is not just a service — it&#39;s your personal product quality guarantee for every online purchase.</p>
        <Link href="/signup" className="btn-white" style={{ textDecoration: 'none' }}>
          🛡 Start Shopping Safely
        </Link>
      </div>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-logo">Shield<span>Cart</span></div>
        <div className="footer-r">S3 Consumer Safety Track<br />Product Inspection & Consumer Protection Platform</div>
      </footer>
    </>
  );
}
