import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = ({ onBackToLanding }) => {
  const { login, register } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!formData.name.trim()) {
          throw new Error('Name is required');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await register(formData.name, formData.email, formData.password);
      } else {
        await login(formData.email, formData.password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="login-page">
      <div className="login-page__bg">
        <div className="login-page__grid-lines"></div>
        <div className="login-page__blob login-page__blob--1"></div>
        <div className="login-page__blob login-page__blob--2"></div>
      </div>

      <div className="login-page__container">
        {onBackToLanding && (
          <button className="login-page__back-btn" onClick={onBackToLanding} id="back-to-landing">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5"/>
              <path d="M12 19l-7-7 7-7"/>
            </svg>
            Back to Home
          </button>
        )}
        <div className="login-page__left">
          <div className="login-page__brand">
            <svg className="login-page__shield" viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M40 5L8 20V45C8 65 22 81 40 85C58 81 72 65 72 45V20L40 5Z"
                    fill="url(#loginShieldGrad)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
              <path d="M34 52L24 42L27.5 38.5L34 45L52.5 26.5L56 30L34 52Z" fill="#22C55E"/>
              <defs>
                <linearGradient id="loginShieldGrad" x1="8" y1="5" x2="72" y2="85">
                  <stop stopColor="#2563EB"/>
                  <stop offset="0.5" stopColor="#1E40AF"/>
                  <stop offset="1" stopColor="#7C3AED"/>
                </linearGradient>
              </defs>
            </svg>
            <h1 className="login-page__title">ShadowGuard</h1>
            <p className="login-page__tagline">Cloud Security Risk Analysis Platform</p>
          </div>

          <div className="login-page__features">
            <div className="login-page__feature">
              <div className="login-page__feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <div>
                <strong>Shadow IT Detection</strong>
                <p>Identify unauthorized cloud resources automatically</p>
              </div>
            </div>
            <div className="login-page__feature">
              <div className="login-page__feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21L16.65 16.65"/>
                </svg>
              </div>
              <div>
                <strong>Real AWS Scanning</strong>
                <p>Scan EC2, S3, IAM, RDS, and Lambda services</p>
              </div>
            </div>
            <div className="login-page__feature">
              <div className="login-page__feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div>
                <strong>Exportable Reports</strong>
                <p>Generate comprehensive PDF and CSV reports</p>
              </div>
            </div>
          </div>
        </div>

        <div className="login-page__right">
          <div className="login-page__form-card">
            <div className="login-page__form-header">
              <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
              <p>{isSignUp ? 'Sign up to start securing your cloud' : 'Sign in to your ShadowGuard dashboard'}</p>
            </div>

            {error && (
              <div className="login-page__error" id="auth-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-page__form" id="auth-form">
              {isSignUp && (
                <div className="login-page__field">
                  <label htmlFor="name">Full Name</label>
                  <div className="login-page__input-wrap">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div className="login-page__field">
                <label htmlFor="email">Email Address</label>
                <div className="login-page__input-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="login-page__field">
                <label htmlFor="password">Password</label>
                <div className="login-page__input-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    required
                  />
                </div>
              </div>

              {isSignUp && (
                <div className="login-page__field">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="login-page__input-wrap">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="login-page__submit"
                disabled={loading}
                id="auth-submit-btn"
              >
                {loading ? (
                  <>
                    <span className="login-page__spinner"></span>
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {isSignUp ? (
                        <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></>
                      ) : (
                        <><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></>
                      )}
                    </svg>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </>
                )}
              </button>
            </form>

            <div className="login-page__divider">
              <span>OR</span>
            </div>

            <div className="login-page__toggle">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button onClick={toggleMode} className="login-page__toggle-btn" id="auth-toggle-btn">
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
