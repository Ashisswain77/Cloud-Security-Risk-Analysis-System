import React from 'react';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero" id="hero">
      <div className="hero__bg">
        <div className="hero__grid-lines"></div>
        <div className="hero__blob hero__blob--1"></div>
        <div className="hero__blob hero__blob--2"></div>
        <div className="hero__blob hero__blob--3"></div>
      </div>

      <div className="hero__container container">
        <div className="hero__content">
          <div className="hero__badge">
            <span className="hero__badge-dot"></span>
            Cloud Security Monitoring
          </div>
          <h1 className="hero__title">
            Detect <span className="hero__title-accent">Shadow IT</span> in Your Cloud Infrastructure
          </h1>
          <p className="hero__description">
            ShadowGuard continuously scans your AWS environment to identify unauthorized resources,
            misconfigurations, and security vulnerabilities. Get real‑time insights and protect your
            cloud infrastructure from hidden threats.
          </p>
          <div className="hero__actions">
            <a href="#scan" className="btn-primary hero__cta">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21L16.65 16.65" />
              </svg>
              Run Security Scan
            </a>
            <a href="#dashboard" className="btn-secondary hero__cta-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              View Dashboard
            </a>
          </div>
          <div className="hero__stats">
            <div className="hero__stat">
              <span className="hero__stat-value">2,847</span>
              <span className="hero__stat-label">Resources Monitored</span>
            </div>
            <div className="hero__stat-divider"></div>
            <div className="hero__stat">
              <span className="hero__stat-value">99.9%</span>
              <span className="hero__stat-label">Uptime SLA</span>
            </div>
            <div className="hero__stat-divider"></div>
            <div className="hero__stat">
              <span className="hero__stat-value">&lt;5min</span>
              <span className="hero__stat-label">Scan Time</span>
            </div>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__shield-container">
            <div className="hero__shield-ring hero__shield-ring--outer"></div>
            <div className="hero__shield-ring hero__shield-ring--middle"></div>
            <div className="hero__shield-ring hero__shield-ring--inner"></div>
            <div className="hero__shield-core">
              <svg viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M40 5L8 20V45C8 65 22 81 40 85C58 81 72 65 72 45V20L40 5Z"
                  fill="url(#heroShieldGrad)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <path d="M34 52L24 42L27.5 38.5L34 45L52.5 26.5L56 30L34 52Z" fill="#22C55E" />
                <defs>
                  <linearGradient id="heroShieldGrad" x1="8" y1="5" x2="72" y2="85">
                    <stop stopColor="#2563EB" />
                    <stop offset="0.5" stopColor="#1E40AF" />
                    <stop offset="1" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="hero__orbit-dot hero__orbit-dot--1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#3B82F6"><rect x="2" y="2" width="20" height="20" rx="3" /><path d="M7 8h10M7 12h10M7 16h6" stroke="#fff" strokeWidth="1.5" /></svg>
            </div>
            <div className="hero__orbit-dot hero__orbit-dot--2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#EF4444"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
            </div>
            <div className="hero__orbit-dot hero__orbit-dot--3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#22C55E"><circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
