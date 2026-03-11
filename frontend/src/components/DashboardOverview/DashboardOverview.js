import React, { useState, useEffect, useRef } from 'react';
import { useScan } from '../../context/ScanContext';
import './DashboardOverview.css';

const defaultStats = [
  { id: 'total', label: 'Total Scanned', value: 0, color: 'blue', trend: '--', trendUp: true },
  { id: 'critical', label: 'Critical Risks', value: 0, color: 'red', trend: '--', trendUp: false },
  { id: 'medium', label: 'Medium Risks', value: 0, color: 'amber', trend: '--', trendUp: true },
  { id: 'secure', label: 'Low Risks', value: 0, color: 'green', trend: '--', trendUp: true },
];

const icons = {
  total: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  critical: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  medium: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  secure: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  ),
};

const AnimatedCounter = ({ value, duration = 1500 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Reset when value changes
    hasAnimated.current = false;
    setCount(0);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * value));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
};

const DashboardOverview = () => {
  const { scanData, hasScanData } = useScan();

  const stats = hasScanData
    ? [
        { id: 'total', label: 'Total Findings', value: scanData.summary.totalResources, color: 'blue', trend: `${scanData.summary.totalResources}`, trendUp: true },
        { id: 'critical', label: 'Critical Risks', value: scanData.summary.critical, color: 'red', trend: `${scanData.summary.critical}`, trendUp: false },
        { id: 'medium', label: 'Medium Risks', value: scanData.summary.medium, color: 'amber', trend: `${scanData.summary.medium}`, trendUp: true },
        { id: 'secure', label: 'Low Risks', value: scanData.summary.low, color: 'green', trend: `${scanData.summary.low}`, trendUp: true },
      ]
    : defaultStats;

  const maxValue = Math.max(...stats.map((s) => s.value), 1);

  return (
    <section className="dashboard section" id="dashboard">
      <div className="container">
        <div className="dashboard__header">
          <div>
            <h2 className="section-title">Security Overview</h2>
            <p className="section-subtitle">
              {hasScanData
                ? 'Results from your latest security scan'
                : 'Run a scan to see real-time cloud security status'}
            </p>
          </div>
          {hasScanData && (
            <div className="dashboard__last-scan">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Scanned: {new Date(scanData.summary.scannedAt).toLocaleTimeString()}
            </div>
          )}
        </div>

        <div className="dashboard__grid">
          {stats.map((stat, index) => (
            <div
              className={`dashboard__card dashboard__card--${stat.color}`}
              key={stat.id}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="dashboard__card-header">
                <div className={`dashboard__card-icon dashboard__card-icon--${stat.color}`}>
                  {icons[stat.id]}
                </div>
                {hasScanData && (
                  <div className={`dashboard__card-trend ${stat.id === 'critical' ? 'dashboard__card-trend--down' : 'dashboard__card-trend--up'}`}>
                    {stat.value}
                  </div>
                )}
              </div>
              <div className="dashboard__card-value">
                <AnimatedCounter value={stat.value} />
              </div>
              <div className="dashboard__card-label">{stat.label}</div>
              <div className="dashboard__card-bar">
                <div
                  className={`dashboard__card-bar-fill dashboard__card-bar-fill--${stat.color}`}
                  style={{ width: `${(stat.value / maxValue) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {!hasScanData && (
          <div className="dashboard__empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--color-text-muted)' }}>
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21L16.65 16.65"/>
            </svg>
            <p>No scan data yet. <a href="#scan">Run a security scan</a> to see your cloud security overview.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default DashboardOverview;
