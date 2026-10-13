import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CheckSquare, ArrowRight, ShieldCheck, User, Sparkles } from 'lucide-react';

export const Login = ({ onSwitchToRegister, initialEmail = '' }) => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // RFC 5322 compliant regex that permits letters, numbers, dots, underscores, plus signs, hyphens, and multi-part domains
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setErrorMessage('Please enter both email and password.');
      showToast('Please enter both email and password.', 'error');
      return;
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address (e.g., user@company.com).');
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    setLoading(true);
    try {
      // Backend expects exact field names: { email, password }
      const loggedUser = await login(cleanEmail.toLowerCase(), password);
      showToast(`Welcome back, ${loggedUser.name}!`, 'success');
    } catch (err) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
    showToast(`Loaded ${demoEmail} credentials`, 'info');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand-logo">
            <CheckSquare size={26} strokeWidth={2.5} />
          </div>
          <h1 className="auth-title">Welcome to TaskFlow</h1>
          <p className="auth-subtitle">
            Sign in to track team progress, sprints, and deliverables.
          </p>
        </div>

        {/* Quick Demo Credentials Box */}
        <div className="quick-demo-box">
          <div className="quick-demo-title">
            <Sparkles size={14} color="#818cf8" />
            <span>Instant Demo Accounts (1-Click Fill)</span>
          </div>
          <div className="demo-buttons-grid">
            <button
              type="button"
              className="btn-demo-pill"
              onClick={() => handleFillDemo('admin@taskflow.dev', 'admin123')}
            >
              👑 <strong>Alex Morgan</strong> (Admin)
            </button>
            <button
              type="button"
              className="btn-demo-pill"
              onClick={() => handleFillDemo('sarah@taskflow.dev', 'password123')}
            >
              👩‍💻 <strong>Sarah Chen</strong> (Member)
            </button>
            <button
              type="button"
              className="btn-demo-pill"
              onClick={() => handleFillDemo('marcus@taskflow.dev', 'password123')}
            >
              👨‍💻 <strong>Marcus Vance</strong> (Member)
            </button>
            <button
              type="button"
              className="btn-demo-pill"
              onClick={() => handleFillDemo('elena@taskflow.dev', 'password123')}
            >
              ☁️ <strong>Elena Rostova</strong> (DevOps)
            </button>
          </div>
        </div>

        {errorMessage && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              color: '#f87171',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <span>{errorMessage}</span>
            {errorMessage.includes('No account found') && (
              <button
                type="button"
                onClick={() => onSwitchToRegister(email.trim())}
                className="btn btn-secondary btn-sm"
                style={{
                  alignSelf: 'flex-start',
                  fontSize: '0.78rem',
                  borderColor: '#f43f5e',
                  color: '#fff',
                }}
              >
                Create account with this email →
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              name="email"
              type="email"
              className="form-input"
              required
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              className="form-input"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.8rem' }}
          >
            {loading ? 'Signing in...' : 'Sign In to TaskFlow'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
          <button
            type="button"
            onClick={() => onSwitchToRegister(email.trim())}
            style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
};
