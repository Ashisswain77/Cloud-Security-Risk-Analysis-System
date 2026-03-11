import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer" id="settings">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__about">
            <div className="footer__logo">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7V12C3 17.25 6.75 22.13 12 23C17.25 22.13 21 17.25 21 12V7L12 2Z" 
                      fill="url(#footerShieldGrad)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
                <path d="M10 15.5L7.5 13L8.91 11.59L10 12.67L14.59 8.08L16 9.5L10 15.5Z" fill="#fff"/>
                <defs>
                  <linearGradient id="footerShieldGrad" x1="3" y1="2" x2="21" y2="23">
                    <stop stopColor="#2563EB"/>
                    <stop offset="1" stopColor="#7C3AED"/>
                  </linearGradient>
                </defs>
              </svg>
              <span>ShadowGuard</span>
            </div>
            <p className="footer__desc">
              Open-source cloud security monitoring platform. Detect Shadow IT, 
              identify misconfigurations, and protect your AWS infrastructure.
            </p>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Quick Links</h4>
            <a href="#dashboard" className="footer__link">Dashboard</a>
            <a href="#scan" className="footer__link">Run Scan</a>
            <a href="#reports" className="footer__link">Reports</a>
            <a href="#visualization" className="footer__link">Analytics</a>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Documentation</h4>
            <a href="#" className="footer__link">Getting Started</a>
            <a href="#" className="footer__link">API Reference</a>
            <a href="#" className="footer__link">Architecture</a>
            <a href="#" className="footer__link">Contributing</a>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Connect</h4>
            <a href="https://github.com" className="footer__link" target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <a href="#" className="footer__link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Contact
            </a>
            <a href="#" className="footer__link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
              </svg>
              Twitter
            </a>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2026 ShadowGuard. Built for cloud security analysis and Shadow IT detection.</p>
          <div className="footer__bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">License</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
