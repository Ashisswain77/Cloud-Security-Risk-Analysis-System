import React, { useState, useMemo } from 'react';
import { useScan } from '../../context/ScanContext';
import './RiskFindingsTable.css';

const sampleData = [
  { id: 'i-0a1b2c3d4', service: 'EC2', riskLevel: 'Critical', issue: 'Instance publicly accessible with open SSH port (22)', fix: 'Restrict security group to specific IP ranges' },
  { id: 's3-prod-assets', service: 'S3', riskLevel: 'Critical', issue: 'Bucket has public read access enabled', fix: 'Enable Block Public Access settings' },
  { id: 'rds-main-db', service: 'RDS', riskLevel: 'Critical', issue: 'Database instance publicly accessible', fix: 'Disable public accessibility and use VPC endpoints' },
  { id: 'lambda-auth-fn', service: 'Lambda', riskLevel: 'Medium', issue: 'Function has overly permissive IAM role', fix: 'Apply least-privilege IAM policy' },
  { id: 'sg-0e5f6g7h8', service: 'EC2', riskLevel: 'Medium', issue: 'Security group allows inbound from 0.0.0.0/0 on port 3389', fix: 'Restrict RDP access to known CIDR blocks' },
  { id: 'ebs-vol-9i0j', service: 'EBS', riskLevel: 'Medium', issue: 'Volume is not encrypted at rest', fix: 'Enable EBS encryption with KMS key' },
  { id: 'iam-user-legacy', service: 'IAM', riskLevel: 'Medium', issue: 'User has not rotated access keys in 180+ days', fix: 'Rotate access keys and enforce rotation policy' },
  { id: 'vpc-flow-logs', service: 'VPC', riskLevel: 'Low', issue: 'Flow logs not enabled for VPC', fix: 'Enable VPC Flow Logs for traffic monitoring' },
  { id: 'cloudtrail-01', service: 'CloudTrail', riskLevel: 'Low', issue: 'Multi-region trail not configured', fix: 'Enable multi-region CloudTrail logging' },
  { id: 's3-log-bucket', service: 'S3', riskLevel: 'Low', issue: 'Server access logging not enabled', fix: 'Enable server access logging to a dedicated bucket' },
];

const RiskFindingsTable = () => {
  const { scanData, hasScanData, exportReport } = useScan();
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  const riskData = hasScanData ? scanData.findings : sampleData;

  const filteredData = useMemo(() => {
    let data = [...riskData];
    if (riskFilter !== 'All') {
      data = data.filter((item) => item.riskLevel === riskFilter);
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(
        (item) =>
          item.id.toLowerCase().includes(lower) ||
          item.service.toLowerCase().includes(lower) ||
          item.issue.toLowerCase().includes(lower)
      );
    }
    if (sortConfig.key) {
      data.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [riskData, searchTerm, riskFilter, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleExport = async (format) => {
    setExporting(true);
    setShowExportMenu(false);
    try {
      await exportReport(format);
    } catch (error) {
      alert(`Export failed: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  const riskLevels = ['All', 'Critical', 'Medium', 'Low'];

  const getRiskBadgeClass = (level) => {
    switch (level) {
      case 'Critical': return 'risk-badge--critical';
      case 'Medium': return 'risk-badge--medium';
      case 'Low': return 'risk-badge--low';
      default: return '';
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <section className="risk-table section" id="reports">
      <div className="container">
        <h2 className="section-title">Risk Findings</h2>
        <p className="section-subtitle">
          {hasScanData
            ? 'Security issues found across your cloud resources'
            : 'Sample data shown — run a scan for real results'}
        </p>

        <div className="risk-table__controls">
          <div className="risk-table__search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21L16.65 16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search resources, services, issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="risk-table__search-input"
              id="risk-search-input"
            />
          </div>
          <div className="risk-table__filters">
            {riskLevels.map((level) => (
              <button
                key={level}
                className={`risk-table__filter-btn ${riskFilter === level ? 'risk-table__filter-btn--active' : ''} ${level !== 'All' ? `risk-table__filter-btn--${level.toLowerCase()}` : ''}`}
                onClick={() => setRiskFilter(level)}
                id={`filter-${level.toLowerCase()}`}
              >
                {level}
                {level !== 'All' && (
                  <span className="risk-table__filter-count">
                    {riskData.filter((d) => d.riskLevel === level).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="risk-table__wrapper">
          <table className="risk-table__table">
            <thead>
              <tr>
                <th onClick={() => handleSort('id')}>
                  Resource ID <span className="risk-table__sort-icon">{getSortIcon('id')}</span>
                </th>
                <th onClick={() => handleSort('service')}>
                  Service <span className="risk-table__sort-icon">{getSortIcon('service')}</span>
                </th>
                <th onClick={() => handleSort('riskLevel')}>
                  Risk Level <span className="risk-table__sort-icon">{getSortIcon('riskLevel')}</span>
                </th>
                <th>Issue</th>
                <th>Recommended Fix</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={`${item.id}-${index}`} style={{ animationDelay: `${index * 0.05}s` }}>
                    <td>
                      <code className="risk-table__resource-id">{item.id}</code>
                    </td>
                    <td>
                      <span className="risk-table__service-badge">{item.service}</span>
                    </td>
                    <td>
                      <span className={`risk-badge ${getRiskBadgeClass(item.riskLevel)}`}>
                        {item.riskLevel}
                      </span>
                    </td>
                    <td className="risk-table__issue">{item.issue}</td>
                    <td className="risk-table__fix">{item.fix}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="risk-table__empty">
                    No findings match your search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="risk-table__footer">
          <span className="risk-table__count">
            Showing {filteredData.length} of {riskData.length} findings
          </span>
          <div className="risk-table__export-container">
            {hasScanData && (
              <>
                <button
                  className="btn-secondary"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={exporting}
                  id="export-report-btn"
                >
                  {exporting ? (
                    <>
                      <span className="scan__spinner" style={{ width: 16, height: 16 }}></span>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Export Report
                    </>
                  )}
                </button>
                {showExportMenu && (
                  <div className="risk-table__export-menu">
                    <button onClick={() => handleExport('pdf')} className="risk-table__export-option">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      Export as PDF
                    </button>
                    <button onClick={() => handleExport('csv')} className="risk-table__export-option">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <line x1="3" y1="9" x2="21" y2="9"/>
                        <line x1="3" y1="15" x2="21" y2="15"/>
                        <line x1="9" y1="3" x2="9" y2="21"/>
                      </svg>
                      Export as CSV
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RiskFindingsTable;
