import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

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
      /* Replaced fetch with axios to point to Python backend running on localhost:8000 */
      const res = await axios.get(`http://localhost:8000/scan`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = res.data;

      setScanData({
        findings: data.results, // Python backend returns {"results": [...] }
        summary: {
          totalFindings: data.results.length,
          highRisk: data.results.filter(f => f.risk === 'High').length,
          mediumRisk: data.results.filter(f => f.risk === 'Medium').length,
          lowRisk: data.results.filter(f => f.risk === 'Low').length,
        },
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
