import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const ScanContext = createContext(null);

const API_URL = 'http://localhost:5000/api';

export const ScanProvider = ({ children }) => {
  const { token } = useAuth();
  const [scanData, setScanData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState(null);

  const runScan = useCallback(async (accessKey, secretKey, region, scanDepth) => {
    setIsScanning(true);
    setScanError(null);

    try {
      const res = await fetch(`${API_URL}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ accessKey, secretKey, region, scanDepth }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setScanData({
        findings: data.findings,
        summary: data.summary,
      });

      return data;
    } catch (error) {
      setScanError(error.message);
      throw error;
    } finally {
      setIsScanning(false);
    }
  }, [token]);

  const exportReport = useCallback(async (format) => {
    if (!scanData) return;

    try {
      const res = await fetch(`${API_URL}/report/${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          findings: scanData.findings,
          summary: scanData.summary,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shadowguard-report.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }, [token, scanData]);

  const value = {
    scanData,
    isScanning,
    scanError,
    runScan,
    exportReport,
    hasScanData: !!scanData,
  };

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
};

export const useScan = () => {
  const context = useContext(ScanContext);
  if (!context) throw new Error('useScan must be used within ScanProvider');
  return context;
};

export default ScanContext;
