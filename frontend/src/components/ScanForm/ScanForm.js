import React, { useState } from 'react';
import { useScan } from '../../context/ScanContext';
import './ScanForm.css';

const regions = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'eu-west-1', 'eu-west-2', 'eu-central-1',
  'ap-south-1', 'ap-southeast-1', 'ap-northeast-1',
];

const ScanForm = () => {
  const { runScan, isScanning } = useScan();
  const [formData, setFormData] = useState({
    accessKey: '',
    secretKey: '',
    region: '',
    scanDepth: 'standard',
  });
  const [errors, setErrors] = useState({});
  const [scanResult, setScanResult] = useState(null);

  const validate = () => {
    const newErrors = {};
    if (!formData.accessKey.trim()) {
      newErrors.accessKey = 'AWS Access Key is required';
    } else if (formData.accessKey.length < 16) {
      newErrors.accessKey = 'Access Key must be at least 16 characters';
    }
    if (!formData.secretKey.trim()) {
      newErrors.secretKey = 'AWS Secret Key is required';
    } else if (formData.secretKey.length < 30) {
      newErrors.secretKey = 'Secret Key must be at least 30 characters';
    }
    if (!formData.region) {
      newErrors.region = 'Please select a region';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setScanResult(null);

    try {
      const data = await runScan(
        formData.accessKey,
        formData.secretKey,
        formData.region,
        formData.scanDepth
      );
      
      const findingCount = data.findings ? data.findings.length : 0;
      const serviceCount = data.summary && data.summary.services 
        ? Object.keys(data.summary.services).filter(k => data.summary.services[k] > 0).length 
        : 0;

      if (findingCount === 0) {
        setScanResult({
          success: true,
          message: `Scan finished, but no findings were detected. Please ensure your AWS credentials are correct.`,
        });
      } else {
        setScanResult({
          success: true,
          message: `Scan completed! Found ${findingCount} findings across ${serviceCount} services.`,
        });
      }
    } catch (error) {
      setScanResult({
        success: false,
        message: error.message || 'Scan failed. Please check your credentials and try again.',
      });
    }
  };

  return (
    <section className="scan section" id="scan">
      <div className="container">
        <div className="scan__layout">
          <div className="scan__info">
            <h2 className="section-title">Run Security Scan</h2>
            <p className="section-subtitle" style={{ marginBottom: 'var(--space-lg)' }}>
              Configure and launch a comprehensive security analysis of your AWS infrastructure
            </p>

            <div className="scan__features">
              <div className="scan__feature">
                <div className="scan__feature-icon scan__feature-icon--blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="scan__feature-title">Secure Credentials</h4>
                  <p className="scan__feature-desc">Keys are sent per-request and never stored on the server</p>
                </div>
              </div>
              <div className="scan__feature">
                <div className="scan__feature-icon scan__feature-icon--green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div>
                  <h4 className="scan__feature-title">Real AWS Scanning</h4>
                  <p className="scan__feature-desc">Connects to live AWS APIs — EC2, S3, IAM, RDS, Lambda</p>
                </div>
              </div>
              <div className="scan__feature">
                <div className="scan__feature-icon scan__feature-icon--purple">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="scan__feature-title">Multi-Service</h4>
                  <p className="scan__feature-desc">Covers EC2, S3, RDS, IAM, Lambda and more</p>
                </div>
              </div>
            </div>
          </div>

          <div className="scan__form-container">
            <form className="scan__form" onSubmit={handleSubmit} id="scan-form">
              <div className="scan__form-group">
                <label className="scan__label" htmlFor="accessKey">
                  AWS Access Key ID
                </label>
                <input
                  type="text"
                  id="accessKey"
                  name="accessKey"
                  className={`scan__input ${errors.accessKey ? 'scan__input--error' : ''}`}
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  value={formData.accessKey}
                  onChange={handleChange}
                  autoComplete="off"
                />
                {errors.accessKey && <span className="scan__error">{errors.accessKey}</span>}
              </div>

              <div className="scan__form-group">
                <label className="scan__label" htmlFor="secretKey">
                  AWS Secret Access Key
                </label>
                <input
                  type="password"
                  id="secretKey"
                  name="secretKey"
                  className={`scan__input ${errors.secretKey ? 'scan__input--error' : ''}`}
                  placeholder="••••••••••••••••••••"
                  value={formData.secretKey}
                  onChange={handleChange}
                  autoComplete="off"
                />
                {errors.secretKey && <span className="scan__error">{errors.secretKey}</span>}
              </div>

              <div className="scan__form-group">
                <label className="scan__label" htmlFor="region">
                  AWS Region
                </label>
                <select
                  id="region"
                  name="region"
                  className={`scan__select ${errors.region ? 'scan__input--error' : ''}`}
                  value={formData.region}
                  onChange={handleChange}
                >
                  <option value="">Select region...</option>
                  {regions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {errors.region && <span className="scan__error">{errors.region}</span>}
              </div>

              <div className="scan__form-group">
                <label className="scan__label">Scan Depth</label>
                <div className="scan__radio-group">
                  {['quick', 'standard', 'deep'].map((depth) => (
                    <label className={`scan__radio-label ${formData.scanDepth === depth ? 'scan__radio-label--active' : ''}`} key={depth}>
                      <input
                        type="radio"
                        name="scanDepth"
                        value={depth}
                        checked={formData.scanDepth === depth}
                        onChange={handleChange}
                        className="scan__radio"
                      />
                      <span className="scan__radio-text">
                        {depth.charAt(0).toUpperCase() + depth.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary scan__submit-btn"
                disabled={isScanning}
                id="scan-submit-btn"
              >
                {isScanning ? (
                  <>
                    <span className="scan__spinner"></span>
                    Scanning AWS Infrastructure...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="M21 21L16.65 16.65"/>
                    </svg>
                    Start Security Scan
                  </>
                )}
              </button>

              {scanResult && (
                <div className={`scan__result ${scanResult.success ? 'scan__result--success' : 'scan__result--error'}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {scanResult.success ? (
                      <><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></>
                    ) : (
                      <><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></>
                    )}
                  </svg>
                  <div>
                    <strong>{scanResult.success ? 'Scan Complete' : 'Scan Failed'}</strong>
                    <p>{scanResult.message}</p>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScanForm;
