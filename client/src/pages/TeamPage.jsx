import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Mail, CheckCircle2, Clock, ShieldCheck, Briefcase } from 'lucide-react';

export const TeamPage = ({ users = [] }) => {
  const { user } = useAuth();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Directory</h1>
          <p className="page-subtitle">
            Overview of team members, departments, roles, and assigned task workloads.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {users.map((member) => {
          const isCurrentUser = member._id === user?._id;

          return (
            <div
              key={member._id}
              className="stat-card"
              style={{
                flexDirection: 'column',
                alignItems: 'stretch',
                padding: '1.5rem',
                gap: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  className="user-avatar"
                  style={{
                    width: '48px',
                    height: '48px',
                    fontSize: '1.1rem',
                    backgroundColor: member.avatarColor || '#6366f1',
                    boxShadow: '0 0 12px rgba(99, 102, 241, 0.25)',
                  }}
                >
                  {member.name?.[0]}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: '#fff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {member.name}
                    </h3>
                    {isCurrentUser && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          background: 'rgba(99, 102, 241, 0.2)',
                          color: '#a5b4fc',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 700,
                        }}
                      >
                        YOU
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <span
                      className={`badge ${member.role === 'admin' ? 'badge-role-admin' : 'badge-role-member'}`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {member.role === 'admin' ? 'Admin' : 'Member'}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      • {member.department || 'Engineering'}
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                }}
              >
                <Mail size={14} color="var(--text-dim)" />
                <span>{member.email}</span>
              </div>

              {/* Task Load Metrics */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} color="#60a5fa" />
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                      Active Tasks
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
                      {member.activeTasks || 0}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                      Completed
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
                      {member.completedTasks || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
