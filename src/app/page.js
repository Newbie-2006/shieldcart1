"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function LandingPage() {
  const processRef = useRef(null);

  useEffect(() => {
    const cards = document.querySelectorAll(".fade-up");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    cards.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        :root {
          --primary: #2563EB;
          --primary-dark: #1D4ED8;
          --primary-light: #3B82F6;
          --primary-pale: #EFF6FF;
          --primary-glow: rgba(37, 99, 235, 0.15);
          --accent: #10B981;
          --accent-dark: #059669;
          --accent-pale: #ECFDF5;
          --dark: #0F172A;
          --dark2: #1E293B;
          --gray-900: #111827;
          --gray-800: #1F2937;
          --gray-700: #374151;
          --gray-600: #4B5563;
          --gray-500: #6B7280;
          --gray-400: #9CA3AF;
          --gray-300: #D1D5DB;
          --gray-200: #E5E7EB;
          --gray-100: #F3F4F6;
          --gray-50: #F9FAFB;
          --white: #FFFFFF;
          --gradient-primary: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          --gradient-hero: linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 50%, #F9FAFB 100%);
          --gradient-dark: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
          --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
          --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05);
          --shadow-lg: 0 10px 25px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05);
          --shadow-xl: 0 20px 50px -12px rgba(0,0,0,0.15);
          --shadow-glow: 0 0 40px rgba(37,99,235,0.15);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .lp-body {
          font-family: 'Inter', sans-serif;
          color: var(--gray-900);
          background: var(--white);
          overflow-x: hidden;
        }

        /* ── ANIMATIONS ── */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .fade-up {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .fade-up.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── NAV ── */
        .sc-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 48px;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(0,0,0,0.06);
          transition: all 0.3s;
        }

        .sc-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .sc-logo-icon {
          width: 36px;
          height: 36px;
          background: var(--gradient-primary);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          box-shadow: 0 2px 8px rgba(37,99,235,0.25);
        }
        .sc-logo-text {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--gray-900);
          letter-spacing: -0.02em;
        }
        .sc-logo-text span { color: var(--primary); }

        .nav-links { display: flex; align-items: center; gap: 28px; }
        .nav-link {
          font-size: 0.88rem;
          font-weight: 500;
          color: var(--gray-600);
          text-decoration: none;
          transition: color 0.2s;
          position: relative;
        }
        .nav-link:hover { color: var(--primary); }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--primary);
          transition: width 0.3s;
          border-radius: 2px;
        }
        .nav-link:hover::after { width: 100%; }

        .nav-cta {
          background: var(--gradient-primary);
          color: var(--white);
          font-size: 0.85rem;
          font-weight: 600;
          padding: 10px 24px;
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(37,99,235,0.3);
        }
        .nav-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(37,99,235,0.4);
        }

        /* ── HERO ── */
        .hero-section {
          min-height: 100vh;
          background: var(--gradient-hero);
          padding: 140px 48px 100px;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          overflow: hidden;
        }
        .hero-section::before {
          content: '';
          position: absolute;
          top: -200px;
          right: -200px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%);
          border-radius: 50%;
        }
        .hero-section::after {
          content: '';
          position: absolute;
          bottom: -100px;
          left: -100px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%);
          border-radius: 50%;
        }

        .hero-inner {
          max-width: 1200px;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--primary-pale);
          border: 1px solid rgba(37,99,235,0.15);
          padding: 8px 18px;
          border-radius: 100px;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--primary);
          margin-bottom: 24px;
          animation: fadeInUp 0.6s ease both;
        }
        .hero-badge-dot {
          width: 8px;
          height: 8px;
          background: var(--accent);
          border-radius: 50%;
          position: relative;
        }
        .hero-badge-dot::after {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 2px solid var(--accent);
          animation: pulse-ring 2s infinite;
        }

        .hero-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          color: var(--gray-900);
          margin-bottom: 20px;
          letter-spacing: -0.03em;
          animation: fadeInUp 0.6s ease 0.15s both;
        }
        .hero-title .blue { color: var(--primary); }
        .hero-title .green { color: var(--accent); }

        .hero-desc {
          font-size: 1.1rem;
          line-height: 1.7;
          color: var(--gray-500);
          margin-bottom: 36px;
          max-width: 520px;
          animation: fadeInUp 0.6s ease 0.3s both;
        }

        .hero-btns {
          display: flex;
          gap: 16px;
          animation: fadeInUp 0.6s ease 0.45s both;
        }
        .btn-primary {
          background: var(--gradient-primary);
          color: var(--white);
          font-size: 0.95rem;
          font-weight: 600;
          padding: 14px 32px;
          border-radius: 12px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
          box-shadow: 0 4px 14px rgba(37,99,235,0.35);
          border: none;
          cursor: pointer;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(37,99,235,0.45);
        }
        .btn-outline {
          background: var(--white);
          color: var(--gray-700);
          font-size: 0.95rem;
          font-weight: 600;
          padding: 14px 32px;
          border-radius: 12px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1.5px solid var(--gray-200);
          transition: all 0.3s;
          cursor: pointer;
        }
        .btn-outline:hover {
          border-color: var(--primary);
          color: var(--primary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        /* Hero Card */
        .hero-card {
          background: var(--white);
          border-radius: 20px;
          padding: 32px;
          box-shadow: var(--shadow-xl);
          border: 1px solid rgba(0,0,0,0.06);
          animation: slideInRight 0.8s ease 0.3s both;
          position: relative;
          overflow: hidden;
        }
        .hero-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--primary), var(--accent));
        }
        .hero-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .hero-card-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--gray-900);
        }
        .hero-card-badge {
          background: var(--accent-pale);
          color: var(--accent-dark);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .verification-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          background: var(--gray-50);
          border-radius: 12px;
          margin-bottom: 10px;
          transition: all 0.3s;
        }
        .verification-item:hover {
          background: var(--primary-pale);
          transform: translateX(4px);
        }
        .v-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
        }
        .v-icon-blue { background: var(--primary-pale); }
        .v-icon-green { background: var(--accent-pale); }
        .v-icon-amber { background: #FEF3C7; }
        .v-label { font-size: 0.88rem; font-weight: 600; color: var(--gray-700); }
        .v-sub { font-size: 0.78rem; color: var(--gray-400); margin-top: 2px; }

        .hero-progress {
          margin-top: 20px;
          background: var(--gray-100);
          border-radius: 100px;
          height: 8px;
          overflow: hidden;
        }
        .hero-progress-fill {
          height: 100%;
          width: 85%;
          background: linear-gradient(90deg, var(--primary), var(--accent));
          border-radius: 100px;
          animation: shimmer 2s infinite;
          background-size: 200% 100%;
        }
        .hero-progress-label {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          font-size: 0.78rem;
          color: var(--gray-400);
          font-weight: 500;
        }

        /* ── STATS ── */
        .stats-bar {
          background: var(--white);
          padding: 48px;
          border-bottom: 1px solid var(--gray-100);
        }
        .stats-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }
        .stat-item {
          text-align: center;
          padding: 20px;
        }
        .stat-num {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--primary);
          letter-spacing: -0.03em;
        }
        .stat-label {
          font-size: 0.88rem;
          color: var(--gray-500);
          margin-top: 6px;
          font-weight: 500;
        }

        /* ── HOW IT WORKS ── */
        .how-section {
          padding: 100px 48px;
          background: var(--gray-50);
        }
        .section-inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        .section-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--primary-pale);
          color: var(--primary);
          font-size: 0.78rem;
          font-weight: 700;
          padding: 6px 16px;
          border-radius: 100px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 16px;
        }
        .section-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--gray-900);
          letter-spacing: -0.03em;
          margin-bottom: 14px;
        }
        .section-desc {
          font-size: 1.05rem;
          color: var(--gray-500);
          line-height: 1.7;
          max-width: 600px;
          margin-bottom: 56px;
        }

        .process-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }
        .process-card {
          background: var(--white);
          border-radius: 20px;
          padding: 36px 28px;
          border: 1px solid var(--gray-200);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }
        .process-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--gradient-primary);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .process-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-xl);
          border-color: transparent;
        }
        .process-card:hover::before { opacity: 1; }

        .process-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-bottom: 20px;
        }
        .p-icon-blue { background: var(--primary-pale); }
        .p-icon-green { background: var(--accent-pale); }
        .p-icon-purple { background: #F3E8FF; }

        .process-step {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 10px;
        }
        .process-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: 10px;
        }
        .process-desc {
          font-size: 0.9rem;
          color: var(--gray-500);
          line-height: 1.65;
        }

        /* ── FEATURE (Dark Section) ── */
        .feature-section {
          background: var(--gradient-dark);
          padding: 100px 48px;
          position: relative;
          overflow: hidden;
        }
        .feature-section::before {
          content: '';
          position: absolute;
          top: -100px;
          right: -100px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%);
        }
        .feature-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        .feature-badge {
          display: inline-flex;
          background: rgba(37,99,235,0.15);
          color: var(--primary-light);
          font-size: 0.78rem;
          font-weight: 700;
          padding: 6px 16px;
          border-radius: 100px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 16px;
        }
        .feature-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--white);
          letter-spacing: -0.03em;
          margin-bottom: 16px;
          line-height: 1.15;
        }
        .feature-desc {
          font-size: 1.05rem;
          color: var(--gray-400);
          line-height: 1.7;
          margin-bottom: 36px;
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .feature-check {
          width: 28px;
          height: 28px;
          background: rgba(16,185,129,0.15);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          font-size: 0.85rem;
          font-weight: 800;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .feature-item-text {
          font-size: 0.95rem;
          color: var(--gray-300);
          line-height: 1.6;
        }
        .feature-item-text strong { color: var(--white); }

        /* Feature right card */
        .feature-card {
          background: var(--dark2);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 32px;
          position: relative;
        }
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--primary), var(--accent));
          border-radius: 20px 20px 0 0;
        }
        .fc-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        .fc-icon {
          width: 48px;
          height: 48px;
          background: rgba(37,99,235,0.12);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
        }
        .fc-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--white);
        }
        .fc-sub {
          font-size: 0.8rem;
          color: var(--gray-400);
        }

        .fc-status {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.2);
          border-radius: 12px;
          padding: 14px 18px;
          margin-bottom: 20px;
        }
        .fc-status-dot {
          width: 10px;
          height: 10px;
          background: var(--accent);
          border-radius: 50%;
          position: relative;
        }
        .fc-status-dot::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid var(--accent);
          animation: pulse-ring 2s infinite;
        }
        .fc-status-text { color: var(--accent); font-size: 0.88rem; font-weight: 600; }

        .fc-checklist { display: flex; flex-direction: column; gap: 10px; }
        .fc-check-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: rgba(255,255,255,0.04);
          border-radius: 10px;
          font-size: 0.88rem;
          color: var(--gray-300);
        }
        .fc-check-icon { color: var(--accent); font-weight: 700; }

        /* ── PLATFORMS ── */
        .platforms-section {
          padding: 80px 48px;
          background: var(--white);
        }
        .platforms-inner {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }
        .platforms-label {
          font-size: 0.85rem;
          color: var(--gray-400);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-bottom: 32px;
        }
        .platforms-row {
          display: flex;
          justify-content: center;
          gap: 40px;
          flex-wrap: wrap;
        }
        .platform-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: var(--gray-50);
          border: 1px solid var(--gray-200);
          border-radius: 14px;
          font-size: 1rem;
          font-weight: 600;
          color: var(--gray-700);
          transition: all 0.3s;
        }
        .platform-chip:hover {
          background: var(--primary-pale);
          border-color: var(--primary);
          color: var(--primary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        /* ── CTA ── */
        .cta-section {
          padding: 100px 48px;
          background: var(--gradient-primary);
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .cta-section::before {
          content: '';
          position: absolute;
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%);
        }
        .cta-inner {
          max-width: 700px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        .cta-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 2.8rem;
          font-weight: 800;
          color: var(--white);
          letter-spacing: -0.03em;
          margin-bottom: 16px;
          line-height: 1.15;
        }
        .cta-desc {
          font-size: 1.15rem;
          color: rgba(255,255,255,0.75);
          margin-bottom: 40px;
          line-height: 1.7;
        }
        .btn-white {
          background: var(--white);
          color: var(--primary);
          font-size: 1rem;
          font-weight: 700;
          padding: 16px 40px;
          border-radius: 14px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s;
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
          border: none;
          cursor: pointer;
        }
        .btn-white:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.2);
        }

        /* ── FOOTER ── */
        .sc-footer {
          padding: 40px 48px;
          background: var(--gray-900);
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .footer-copy {
          font-size: 0.82rem;
          color: var(--gray-500);
        }
        .footer-links {
          display: flex;
          gap: 24px;
        }
        .footer-link {
          font-size: 0.82rem;
          color: var(--gray-400);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-link:hover { color: var(--white); }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .sc-nav { padding: 14px 20px; }
          .nav-links .nav-link { display: none; }
          .hero-inner { grid-template-columns: 1fr; gap: 40px; }
          .hero-title { font-size: 2.4rem; }
          .hero-section { padding: 120px 20px 60px; }
          .hero-btns { flex-direction: column; }
          .stats-inner { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .stat-num { font-size: 1.8rem; }
          .process-grid { grid-template-columns: 1fr; }
          .how-section, .feature-section, .platforms-section, .cta-section { padding: 60px 20px; }
          .feature-inner { grid-template-columns: 1fr; }
          .section-title, .feature-title, .cta-title { font-size: 1.8rem; }
          .sc-footer { flex-direction: column; gap: 16px; text-align: center; }
        }
      `}</style>

      <div className="lp-body">
        {/* NAV */}
        <nav className="sc-nav">
          <Link href="/" className="sc-logo">
            <div className="sc-logo-icon">🛡️</div>
            <div className="sc-logo-text">Shield<span>Cart</span></div>
          </Link>
          <div className="nav-links">
            <a href="#process" className="nav-link">How It Works</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#platforms" className="nav-link">Platforms</a>
            <Link href="/login" className="nav-link">Log In</Link>
            <Link href="/signup" className="nav-cta">Shop Securely</Link>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero-section">
          <div className="hero-inner">
            <div>
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                100% Buyer Protection Guaranteed
              </div>
              <h1 className="hero-title">
                Secure Online Shopping with{" "}
                <span className="blue">Product</span>{" "}
                <span className="green">Verification</span>
              </h1>
              <p className="hero-desc">
                ShieldCart is your trusted intermediary that physically inspects every product before it reaches you — ensuring authenticity, quality, and your complete peace of mind.
              </p>
              <div className="hero-btns">
                <Link href="/signup" className="btn-primary">
                  Start Shopping Securely →
                </Link>
                <Link href="/dashboard" className="btn-outline">
                  Track Verification
                </Link>
              </div>
            </div>

            {/* Hero Card */}
            <div className="hero-card">
              <div className="hero-card-header">
                <div className="hero-card-title">Order Verification</div>
                <div className="hero-card-badge">
                  <span>✓</span> Verified Authentic
                </div>
              </div>

              <div className="verification-item">
                <div className="v-icon v-icon-blue">📦</div>
                <div>
                  <div className="v-label">Package Received at Hub</div>
                  <div className="v-sub">Sealed condition documented</div>
                </div>
              </div>
              <div className="verification-item">
                <div className="v-icon v-icon-green">🔍</div>
                <div>
                  <div className="v-label">Physical Inspection Complete</div>
                  <div className="v-sub">Serial & authenticity verified</div>
                </div>
              </div>
              <div className="verification-item">
                <div className="v-icon v-icon-amber">📋</div>
                <div>
                  <div className="v-label">Certificate Generated</div>
                  <div className="v-sub">Inspection report attached</div>
                </div>
              </div>

              <div className="hero-progress">
                <div className="hero-progress-fill" />
              </div>
              <div className="hero-progress-label">
                <span>Verification Progress</span>
                <span>85%</span>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="stats-bar fade-up">
          <div className="stats-inner">
            {[
              { num: "50K+", label: "Products Inspected" },
              { num: "99.7%", label: "Accuracy Rate" },
              { num: "200+", label: "Certified Inspectors" },
              { num: "4.9★", label: "Customer Rating" },
            ].map((s) => (
              <div key={s.label} className="stat-item">
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="process" className="how-section" ref={processRef}>
          <div className="section-inner">
            <div className="section-badge">✦ Our Process</div>
            <h2 className="section-title">How ShieldCart Works</h2>
            <p className="section-desc">
              A simple three-step process that ensures every product you buy online is genuine, undamaged, and exactly what you ordered.
            </p>

            <div className="process-grid">
              {[
                {
                  icon: "🚚",
                  iconClass: "p-icon-blue",
                  step: "Step 01",
                  title: "Interception at Hub",
                  desc: "Your order is delivered to our secure inspection hub instead of directly to you. Every package is sorted, logged, and prepared for inspection.",
                },
                {
                  icon: "🔬",
                  iconClass: "p-icon-green",
                  step: "Step 02",
                  title: "Rigorous Inspection",
                  desc: "Our certified inspectors verify serial numbers, check seals, test functionality, compare against listings, and document everything with timestamped photos.",
                },
                {
                  icon: "✅",
                  iconClass: "p-icon-purple",
                  step: "Step 03",
                  title: "Guaranteed Safe Delivery",
                  desc: "Verified products are repackaged with our ShieldCart Verified seal and dispatched to you with a full digital inspection certificate.",
                },
              ].map((card) => (
                <div key={card.step} className="process-card fade-up">
                  <div className={`process-icon ${card.iconClass}`}>{card.icon}</div>
                  <div className="process-step">{card.step}</div>
                  <div className="process-title">{card.title}</div>
                  <div className="process-desc">{card.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURE SECTION */}
        <section id="features" className="feature-section">
          <div className="feature-inner">
            <div className="fade-up">
              <div className="feature-badge">✦ Why ShieldCart</div>
              <h2 className="feature-title">
                Never Receive a Fake Product Again
              </h2>
              <p className="feature-desc">
                Every order goes through our rigorous verification process. If a product fails inspection, we handle the return and refund — you never have to.
              </p>

              <div className="feature-list">
                {[
                  { title: "Payment Escrow Protection", desc: "Your money is secured until the product passes our inspection. No risk." },
                  { title: "Instant Return Handling", desc: "Failed inspections trigger automatic returns. You never receive a defective product." },
                  { title: "Digital Inspection Reports", desc: "Every product comes with timestamped photo evidence and a downloadable certificate." },
                  { title: "AI-Powered Shopping Assistant", desc: "ShieldBot helps you compare products, analyse reviews, and make confident purchases." },
                ].map((item) => (
                  <div key={item.title} className="feature-item">
                    <div className="feature-check">✓</div>
                    <div className="feature-item-text">
                      <strong>{item.title}</strong><br />
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="feature-card fade-up">
              <div className="fc-header">
                <div className="fc-icon">🛡️</div>
                <div>
                  <div className="fc-title">MacBook Pro 16&quot;</div>
                  <div className="fc-sub">Ordered from Amazon • ₹2,49,900</div>
                </div>
              </div>

              <div className="fc-status">
                <div className="fc-status-dot" />
                <span className="fc-status-text">✓ Verified Authentic</span>
              </div>

              <div className="fc-checklist">
                {[
                  "Packaging sealed & undamaged",
                  "Serial number matches listing",
                  "All accessories present",
                  "No cosmetic defects found",
                  "Certificate generated",
                ].map((item) => (
                  <div key={item} className="fc-check-item">
                    <span className="fc-check-icon">✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PLATFORMS */}
        <section id="platforms" className="platforms-section fade-up">
          <div className="platforms-inner">
            <div className="platforms-label">Works with all major marketplaces</div>
            <div className="platforms-row">
              {[
                { name: "Amazon", emoji: "🛒" },
                { name: "Flipkart", emoji: "📱" },
                { name: "Meesho", emoji: "🛍️" },
                { name: "Myntra", emoji: "👗" },
                { name: "Nykaa", emoji: "💄" },
              ].map((p) => (
                <div key={p.name} className="platform-chip">
                  <span>{p.emoji}</span>
                  {p.name}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section fade-up">
          <div className="cta-inner">
            <h2 className="cta-title">
              Shop Online With Complete Confidence
            </h2>
            <p className="cta-desc">
              Join thousands of smart shoppers who trust ShieldCart to verify every purchase. Your product quality guarantee starts here.
            </p>
            <Link href="/signup" className="btn-white">
              🛡️ Start Shopping Securely
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="sc-footer">
          <div className="footer-copy">
            © 2026 ShieldCart. Product Inspection & Consumer Protection Platform.
          </div>
          <div className="footer-links">
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Contact</a>
          </div>
        </footer>
      </div>
    </>
  );
}
