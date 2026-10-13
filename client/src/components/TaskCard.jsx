import React from 'react';
import { Calendar, AlertTriangle, Clock, Edit2, Trash2, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const TaskCard = ({ task, onEdit, onDelete, onUpdateStatus, onViewDetails }) => {
  const { user, isAdmin } = useAuth();

  const isAssignee = task.assignedTo?._id === user?._id;
  const canEdit = isAdmin;
  const canDelete = isAdmin;
  const canUpdateProgress = isAdmin || isAssignee;

  // Format Due Date
  const dueDateObj = new Date(task.dueDate);
  const formattedDate = dueDateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  // Calculate Overdue and Remaining Days
  const now = new Date();
  const diffTime = dueDateObj.getTime() - now.getTime();
  const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isOverdue = task.status !== 'Completed' && daysDiff < 0;

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'badge-priority-high';
      case 'Medium':
        return 'badge-priority-medium';
      case 'Low':
      default:
        return 'badge-priority-low';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'badge-completed';
      case 'In Progress':
        return 'badge-inprogress';
      case 'To Do':
      default:
        return 'badge-todo';
    }
  };

  const getAssigneeInitials = (name) => {
    if (!name) return '?';
    const p = name.split(' ');
    return p.length >= 2 ? `${p[0][0]}${p[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="task-card">
      <div className="task-card-header">
        <div className="badges-group">
          <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
            {task.priority}
          </span>
          <span className={`badge ${getStatusBadgeClass(task.status)}`}>
            {task.status}
          </span>
          {isOverdue && (
            <span className="badge badge-overdue">
              <AlertTriangle size={12} />
              {Math.abs(daysDiff)}d Overdue
            </span>
          )}
        </div>

        <div className="task-card-actions">
          {canEdit && (
            <button
              onClick={() => onEdit(task)}
              className="btn-icon"
              style={{ width: '28px', height: '28px' }}
              title="Edit Task (Admin)"
            >
              <Edit2 size={13} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(task)}
              className="btn-icon"
              style={{ width: '28px', height: '28px', color: '#f43f5e' }}
              title="Delete Task (Admin)"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      <div onClick={() => onViewDetails(task)}>
        <h4 className="task-card-title">{task.title}</h4>
        {task.description && <p className="task-card-desc">{task.description}</p>}
      </div>

      <div className="task-card-footer">
        <div className={`task-due-info ${isOverdue ? 'overdue' : ''}`}>
          <Calendar size={13} />
          <span>{formattedDate}</span>
          {!isOverdue && task.status !== 'Completed' && (
            <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>
              ({daysDiff === 0 ? 'Today' : `${daysDiff}d left`})
            </span>
          )}
        </div>

        <div className="task-assignee-bubble" title={`Assigned to: ${task.assignedTo?.name || 'Unassigned'}`}>
          <div
            className="user-avatar"
            style={{
              width: '24px',
              height: '24px',
              fontSize: '0.68rem',
              backgroundColor: task.assignedTo?.avatarColor || '#6366f1',
            }}
          >
            {getAssigneeInitials(task.assignedTo?.name)}
          </div>
          <span className="task-assignee-name">
            {isAssignee ? 'You' : task.assignedTo?.name?.split(' ')[0] || 'Unassigned'}
          </span>
        </div>
      </div>

      {/* Quick Status Bar for Assignee or Admin */}
      {canUpdateProgress && task.status !== 'Completed' && (
        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
          {task.status === 'To Do' && (
            <button
              onClick={() => onUpdateStatus(task, 'In Progress')}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', fontSize: '0.75rem', padding: '4px' }}
            >
              <ArrowRight size={13} /> Start Task
            </button>
          )}
          {task.status === 'In Progress' && (
            <button
              onClick={() => onUpdateStatus(task, 'Completed')}
              className="btn btn-primary btn-sm"
              style={{ width: '100%', fontSize: '0.75rem', padding: '4px', background: '#10b981' }}
            >
              <CheckCircle size={13} /> Mark Completed
            </button>
          )}
        </div>
      )}
    </div>
  );
};
