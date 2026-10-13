import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import {
  CheckSquare,
  Clock,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  Calendar,
  Users,
} from 'lucide-react';

export const Dashboard = ({ onNavigateToTasks, onOpenCreateTask, onSelectTask }) => {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState('all'); // 'all' (team) or 'me' (personal)

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(`/dashboard/stats?scope=${scope}`);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [scope]);

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading TaskFlow Dashboard metrics...</p>
      </div>
    );
  }

  const { stats, priorityBreakdown, upcomingTasks, recentTasks } = data || {
    stats: { totalTasks: 0, todoTasks: 0, inProgressTasks: 0, completedTasks: 0, overdueTasks: 0, completionRate: 0 },
    priorityBreakdown: { High: 0, Medium: 0, Low: 0 },
    upcomingTasks: [],
    recentTasks: [],
  };

  const totalPriorityCount =
    (priorityBreakdown?.High || 0) +
    (priorityBreakdown?.Medium || 0) +
    (priorityBreakdown?.Low || 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="page-subtitle">
            Here is your team's task velocity and progress summary for today.
          </p>
        </div>

        <div className="header-actions">
          {/* Scope Toggle for Team Members */}
          <div className="view-toggle-group">
            <button
              className={`view-btn ${scope === 'all' ? 'active' : ''}`}
              onClick={() => setScope('all')}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            >
              All Team
            </button>
            <button
              className={`view-btn ${scope === 'me' ? 'active' : ''}`}
              onClick={() => setScope('me')}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            >
              My Tasks
            </button>
          </div>

          <button onClick={onOpenCreateTask} className="btn btn-primary">
            <Plus size={16} /> Create Task
          </button>
        </div>
      </div>

      {/* Primary Metrics Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Tasks"
          value={stats.totalTasks}
          subtext={`${stats.completionRate}% completion rate`}
          icon={CheckSquare}
          colorType="primary"
        />
        <StatCard
          label="Pending (To Do)"
          value={stats.todoTasks}
          subtext="Awaiting start"
          icon={Clock}
          colorType="todo"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgressTasks}
          subtext="Actively developing"
          icon={PlayCircle}
          colorType="progress"
        />
        <StatCard
          label="Completed"
          value={stats.completedTasks}
          subtext="Successfully delivered"
          icon={CheckCircle2}
          colorType="completed"
        />
        <StatCard
          label="Overdue Tasks"
          value={stats.overdueTasks}
          subtext={stats.overdueTasks > 0 ? "Requires attention" : "All on schedule"}
          icon={AlertTriangle}
          colorType="overdue"
        />
      </div>

      {/* Analytics Breakdown */}
      <div className="dashboard-analytics-grid">
        {/* Left Column: Progress & Priorities */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <h3 className="analytics-title">
              <TrendingUp size={18} color="var(--primary)" /> Sprint Progress & Priorities
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>
              Live Overview
            </span>
          </div>

          {/* Completion Meter */}
          <div className="progress-meter-container">
            <div className="progress-meter-label">
              <span>Overall Completion</span>
              <span style={{ color: '#fff' }}>{stats.completionRate}%</span>
            </div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>

          {/* Priority Breakdown Bars */}
          <div style={{ marginTop: '1.5rem' }}>
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text-dim)',
                letterSpacing: '0.04em',
                display: 'block',
                marginBottom: '1rem',
              }}
            >
              Priority Distribution
            </span>

            <div className="priority-bar-item">
              <span className="priority-bar-label" style={{ color: '#fb7185' }}>
                High
              </span>
              <div className="priority-track">
                <div
                  className="priority-fill-high"
                  style={{
                    width: totalPriorityCount > 0
                      ? `${(priorityBreakdown.High / totalPriorityCount) * 100}%`
                      : '0%',
                  }}
                />
              </div>
              <span className="priority-bar-count">{priorityBreakdown.High}</span>
            </div>

            <div className="priority-bar-item">
              <span className="priority-bar-label" style={{ color: '#fbbf24' }}>
                Medium
              </span>
              <div className="priority-track">
                <div
                  className="priority-fill-med"
                  style={{
                    width: totalPriorityCount > 0
                      ? `${(priorityBreakdown.Medium / totalPriorityCount) * 100}%`
                      : '0%',
                  }}
                />
              </div>
              <span className="priority-bar-count">{priorityBreakdown.Medium}</span>
            </div>

            <div className="priority-bar-item">
              <span className="priority-bar-label" style={{ color: '#34d399' }}>
                Low
              </span>
              <div className="priority-track">
                <div
                  className="priority-fill-low"
                  style={{
                    width: totalPriorityCount > 0
                      ? `${(priorityBreakdown.Low / totalPriorityCount) * 100}%`
                      : '0%',
                  }}
                />
              </div>
              <span className="priority-bar-count">{priorityBreakdown.Low}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Deadlines */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <h3 className="analytics-title">
              <Calendar size={18} color="var(--warning)" /> Upcoming Deadlines
            </h3>
            <button
              onClick={onNavigateToTasks}
              className="btn-ghost"
              style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View all <ArrowRight size={13} />
            </button>
          </div>

          {upcomingTasks.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', padding: '1rem 0' }}>
              No upcoming pending deadlines. All tasks caught up!
            </p>
          ) : (
            <div className="upcoming-tasks-list">
              {upcomingTasks.map((t) => {
                const dueDate = new Date(t.dueDate);
                const isOver = new Date() > dueDate && t.status !== 'Completed';
                return (
                  <div
                    key={t._id}
                    className="upcoming-task-item"
                    onClick={() => onSelectTask(t)}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span className="upcoming-task-title">{t.title}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          className={`badge ${isOver ? 'badge-overdue' : 'badge-priority-medium'}`}
                          style={{ fontSize: '0.65rem', padding: '1px 5px' }}
                        >
                          {isOver ? 'Overdue' : t.priority}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {t.assignedTo?.name?.split(' ')[0]}
                        </span>
                      </div>
                    </div>

                    <div className="upcoming-task-meta">
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: isOver ? '#f87171' : 'var(--text-muted)',
                        }}
                      >
                        {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
