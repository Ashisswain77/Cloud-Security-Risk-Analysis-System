import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useScan } from '../../context/ScanContext';
import './CloudVisualization.css';

const COLORS = {
  Critical: '#EF4444',
  Medium: '#F59E0B',
  Low: '#22C55E',
};

const SERVICE_COLORS = {
  EC2: '#EF4444',
  S3: '#F59E0B',
  IAM: '#F59E0B',
  RDS: '#3B82F6',
  Lambda: '#22C55E',
  VPC: '#22C55E',
};

const defaultRiskDist = [
  { name: 'Critical', value: 23 },
  { name: 'Medium', value: 89 },
  { name: 'Low', value: 35 },
];

const defaultServiceData = [
  { service: 'EC2', count: 42 },
  { service: 'S3', count: 35 },
  { service: 'IAM', count: 28 },
  { service: 'RDS', count: 18 },
  { service: 'Lambda', count: 12 },
  { service: 'VPC', count: 8 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="viz__tooltip">
        <p className="viz__tooltip-label">{payload[0].name || label}</p>
        <p className="viz__tooltip-value">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const CloudVisualization = () => {
  const { scanData, hasScanData } = useScan();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const riskDistribution = useMemo(() => {
    if (!hasScanData) return defaultRiskDist;
    return [
      { name: 'Critical', value: scanData.summary.critical },
      { name: 'Medium', value: scanData.summary.medium },
      { name: 'Low', value: scanData.summary.low },
    ].filter(d => d.value > 0);
  }, [scanData, hasScanData]);

  const serviceData = useMemo(() => {
    if (!hasScanData) return defaultServiceData;
    return Object.entries(scanData.summary.services)
      .filter(([, count]) => count > 0)
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count);
  }, [scanData, hasScanData]);

  const totalFindings = riskDistribution.reduce((a, b) => a + b.value, 0);

  // Security score calculation
  const securityScore = useMemo(() => {
    if (!hasScanData) return 72;
    const total = scanData.summary.totalResources;
    if (total === 0) return 100;
    const criticalWeight = scanData.summary.critical * 10;
    const mediumWeight = scanData.summary.medium * 5;
    const lowWeight = scanData.summary.low * 1;
    const raw = Math.max(0, 100 - criticalWeight - mediumWeight - lowWeight);
    return Math.round(raw);
  }, [scanData, hasScanData]);

  return (
    <section className="viz section" id="visualization" ref={sectionRef}>
      <div className="container">
        <h2 className="section-title">Cloud Infrastructure Analysis</h2>
        <p className="section-subtitle">
          {hasScanData
            ? 'Visual breakdown of security status across your AWS services'
            : 'Sample visualization — run a scan for real data'}
        </p>

        <div className="viz__grid">
          {/* Pie Chart */}
          <div className={`viz__card ${isVisible ? 'viz__card--visible' : ''}`}>
            <h3 className="viz__card-title">Risk Distribution</h3>
            <div className="viz__chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1200}
                  >
                    {riskDistribution.map((entry) => (
                      <Cell key={entry.name} fill={COLORS[entry.name] || '#666'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => <span style={{ color: '#94A3B8', fontSize: 12 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="viz__pie-center-label">
                <span className="viz__pie-total">{totalFindings}</span>
                <span className="viz__pie-sublabel">Total</span>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className={`viz__card ${isVisible ? 'viz__card--visible' : ''}`} style={{ animationDelay: '0.2s' }}>
            <h3 className="viz__card-title">Service Vulnerabilities</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={serviceData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
                <XAxis type="number" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="service"
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={55}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar
                  dataKey="count"
                  radius={[0, 4, 4, 0]}
                  animationBegin={200}
                  animationDuration={1200}
                >
                  {serviceData.map((entry) => (
                    <Cell key={entry.service} fill={SERVICE_COLORS[entry.service] || '#3B82F6'} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Security Score */}
          <div className={`viz__card viz__card--score ${isVisible ? 'viz__card--visible' : ''}`} style={{ animationDelay: '0.4s' }}>
            <h3 className="viz__card-title">Security Score</h3>
            <div className="viz__score-container">
              <div className="viz__score-ring">
                <svg viewBox="0 0 120 120" className="viz__score-svg">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke="url(#scoreGrad)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${isVisible ? securityScore * 3.27 : 0} 327`}
                    transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dasharray 1.5s ease' }}
                  />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22C55E"/>
                      <stop offset="100%" stopColor="#3B82F6"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="viz__score-value">
                  <span className="viz__score-number">{securityScore}</span>
                  <span className="viz__score-unit">/100</span>
                </div>
              </div>
              <div className="viz__score-details">
                <div className="viz__score-item">
                  <span className="viz__score-dot" style={{ background: '#EF4444' }}></span>
                  Critical Issues: {hasScanData ? scanData.summary.critical : 23}
                </div>
                <div className="viz__score-item">
                  <span className="viz__score-dot" style={{ background: '#F59E0B' }}></span>
                  Medium Issues: {hasScanData ? scanData.summary.medium : 89}
                </div>
                <div className="viz__score-item">
                  <span className="viz__score-dot" style={{ background: '#22C55E' }}></span>
                  Low Issues: {hasScanData ? scanData.summary.low : 35}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CloudVisualization;
