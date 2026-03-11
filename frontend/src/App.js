import React, { useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ScanProvider } from './context/ScanContext';
import Login from './components/Login/Login';
import Navbar from './components/Navbar/Navbar';
import HeroSection from './components/HeroSection/HeroSection';
import DashboardOverview from './components/DashboardOverview/DashboardOverview';
import RiskFindingsTable from './components/RiskFindingsTable/RiskFindingsTable';
import CloudVisualization from './components/CloudVisualization/CloudVisualization';
import ScanForm from './components/ScanForm/ScanForm';
import Footer from './components/Footer/Footer';

function Dashboard() {
  return (
    <ScanProvider>
      <Navbar />
      <main>
        <HeroSection />
        <DashboardOverview />
        <RiskFindingsTable />
        <CloudVisualization />
        <ScanForm />
      </main>
      <Footer />
    </ScanProvider>
  );
}

function LandingPage({ onGetStarted }) {
  return (
    <>
      <Navbar onGetStarted={onGetStarted} />
      <main>
        <HeroSection onGetStarted={onGetStarted} />
      </main>
      <Footer />
    </>
  );
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('landing');

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading__spinner"></div>
        <p>Loading ShadowGuard...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Dashboard />;
  }

  if (currentPage === 'auth') {
    return <Login onBackToLanding={() => setCurrentPage('landing')} />;
  }

  return <LandingPage onGetStarted={() => setCurrentPage('auth')} />;
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;