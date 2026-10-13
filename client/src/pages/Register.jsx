import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CheckSquare, ArrowRight, ShieldCheck, User } from 'lucide-react';

export const Register = ({ onSwitchToLogin, initialEmail = '' }) => {
  const { register } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: initialEmail,
    password: '',
    department: 'Engineering',
    role: 'member',
    adminCode: 'admin123',
  });

  const [loading, setLoading] = useState(false);

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = formData.email.trim();

    if (!formData.name.trim() || !cleanEmail || !formData.password) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      showToast('Please enter a valid email address (e.g., user@company.com).', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    setLoading(true);
    try {
      const newUser = await register({
        ...formData,
        name: formData.name.trim(),
        email: cleanEmail.toLowerCase(),
      });
      showToast(`Welcome to TaskFlow, ${newUser.name}!`, 'success');
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand-logo">
            <CheckSquare size={26} strokeWidth={2.5} />
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">
            Join your team workspace on TaskFlow.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="role-selector-tabs">
          <button
            type="button"
            className={`role-tab ${formData.role === 'member' ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, role: 'member' })}
          >
            Team Member
          </button>
          <button
            type="button"
            className={`role-tab ${formData.role === 'admin' ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, role: 'admin' })}
          >
            Admin (Manager)
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">Full Name *</label>
            <input
              id="register-name"
              name="name"
              type="text"
              className="form-input"
              required
              autoComplete="name"
              placeholder="e.g. Jordan Smith"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Email Address *</label>
            <input
              id="register-email"
              name="email"
              type="email"
              className="form-input"
              required
              autoComplete="email"
              placeholder="jordan@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-dept">Department</label>
            <input
              id="register-dept"
              name="department"
              type="text"
              className="form-input"
              placeholder="e.g. Frontend Engineering, Product, DevOps"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">Password (min 6 characters) *</label>
            <input
              id="register-password"
              name="password"
              type="password"
              className="form-input"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {formData.role === 'admin' && (
            <div className="form-group">
              <label className="form-label" htmlFor="admin-code">
                <span>Admin Registration Code *</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--primary)' }}>
                  (Default demo code: admin123)
                </span>
              </label>
              <input
                id="admin-code"
                type="password"
                className="form-input"
                required
                placeholder="Enter admin verification key"
                value={formData.adminCode}
                onChange={(e) => setFormData({ ...formData, adminCode: e.target.value })}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.8rem' }}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
          <button
            type="button"
            onClick={() => onSwitchToLogin(formData.email.trim())}
            style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};
