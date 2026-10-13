import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, CheckSquare, Users, LogOut, ShieldAlert, UserCheck } from 'lucide-react';

export const Navbar = ({ currentView, setCurrentView }) => {
  const { user, logout, isAdmin } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="navbar">
      <div className="brand-wrapper" onClick={() => setCurrentView('dashboard')}>
        <div className="brand-logo-icon">
          <CheckSquare size={20} strokeWidth={2.5} />
        </div>
        <span>TaskFlow</span>
      </div>

      <nav className="nav-links">
        <button
          className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
        >
          <LayoutDashboard size={17} />
          <span>Dashboard</span>
        </button>

        <button
          className={`nav-item ${currentView === 'tasks' ? 'active' : ''}`}
          onClick={() => setCurrentView('tasks')}
        >
          <CheckSquare size={17} />
          <span>Tasks</span>
        </button>

        <button
          className={`nav-item ${currentView === 'team' ? 'active' : ''}`}
          onClick={() => setCurrentView('team')}
        >
          <Users size={17} />
          <span>Team Members</span>
        </button>
      </nav>

      <div className="nav-user-section">
        <div className="user-profile-badge">
          <div
            className="user-avatar"
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: user?.avatarColor || '#6366f1',
            }}
          >
            {getInitials(user?.name)}
          </div>
          <div className="user-info-text">
            <span className="user-info-name">{user?.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span
                className={`badge ${isAdmin ? 'badge-role-admin' : 'badge-role-member'}`}
                style={{ fontSize: '0.65rem', padding: '1px 5px' }}
              >
                {isAdmin ? 'Admin' : 'Member'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn-icon"
          title="Sign out of TaskFlow"
          aria-label="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};
