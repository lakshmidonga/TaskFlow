import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Clock, AlertTriangle, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const TaskModal = ({
  isOpen,
  onClose,
  task = null,
  users = [],
  onSave,
  onAddProgressNote,
  mode = 'edit', // 'create' | 'edit' | 'view'
}) => {
  const { user, isAdmin } = useAuth();

  const isAssignee = task?.assignedTo?._id === user?._id || task?.assignedTo === user?._id;
  const canEditOrManage = mode === 'create' || (isAdmin && mode !== 'view');
  const canMemberUpdate = (isAdmin || isAssignee) && mode !== 'create';

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    dueDate: '',
    assignedTo: '',
  });

  const [progressNote, setProgressNote] = useState('');
  const [newStatus, setNewStatus] = useState('To Do');
  const [submitting, setSubmitting] = useState(false);
  const [noteSubmitting, setNoteSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      // Format date for <input type="date"> (YYYY-MM-DD)
      const dateStr = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'To Do',
        priority: task.priority || 'Medium',
        dueDate: dateStr,
        assignedTo: task.assignedTo?._id || task.assignedTo || '',
      });
      setNewStatus(task.status || 'To Do');
    } else {
      // Default for create mode
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 3);
      setFormData({
        title: '',
        description: '',
        status: 'To Do',
        priority: 'Medium',
        dueDate: defaultDate.toISOString().split('T')[0],
        assignedTo: users[0]?._id || '',
      });
    }
    setProgressNote('');
  }, [task, users, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave(formData, task?._id);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    if (!progressNote.trim() && newStatus === task?.status) return;

    setNoteSubmitting(true);
    try {
      await onAddProgressNote(task._id, {
        note: progressNote.trim(),
        status: newStatus,
      });
      setProgressNote('');
    } finally {
      setNoteSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {mode === 'create'
              ? 'Create New Task'
              : canEditOrManage
              ? 'Edit Task Details'
              : 'Task Overview & Progress'}
          </h3>
          <button onClick={onClose} className="btn-icon" aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Form: Create or Full Edit */}
          {canEditOrManage ? (
            <form id="task-admin-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="task-title">Task Title *</label>
                <input
                  id="task-title"
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Implement OAuth login provider"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-desc">Description</label>
                <textarea
                  id="task-desc"
                  className="form-textarea"
                  placeholder="Detailed task description and acceptance criteria..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="task-status">Status</label>
                  <select
                    id="task-status"
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="task-priority">Priority</label>
                  <select
                    id="task-priority"
                    className="form-select"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="task-due">Due Date *</label>
                  <input
                    id="task-due"
                    type="date"
                    className="form-input"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="task-assignee">Assignee *</label>
                  <select
                    id="task-assignee"
                    className="form-select"
                    required
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  >
                    <option value="">Select team member...</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.role === 'admin' ? 'Admin' : u.department || 'Member'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </form>
          ) : (
            /* Team Member / Read-only View */
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem' }}>
                  <span className={`badge ${formData.priority === 'High' ? 'badge-priority-high' : formData.priority === 'Medium' ? 'badge-priority-medium' : 'badge-priority-low'}`}>
                    {task.priority} Priority
                  </span>
                  <span className={`badge ${task.status === 'Completed' ? 'badge-completed' : task.status === 'In Progress' ? 'badge-inprogress' : 'badge-todo'}`}>
                    {task.status}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>
                  {task.title}
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  {task.description || 'No detailed description provided.'}
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1.5rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    Assigned To
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <div
                      className="user-avatar"
                      style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: task.assignedTo?.avatarColor || '#6366f1',
                      }}
                    >
                      {task.assignedTo?.name?.[0]}
                    </div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>
                      {task.assignedTo?.name}
                    </span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    Due Date
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <Calendar size={16} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>
                      {new Date(task.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Update Box (for Assignee or Admin) */}
              {canMemberUpdate && (
                <div
                  style={{
                    background: '#0d1322',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <h4 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MessageSquare size={15} color="var(--primary)" /> Update Progress & Status
                  </h4>

                  <form onSubmit={handleProgressSubmit}>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <select
                        className="form-select"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        style={{ width: '160px' }}
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>

                      <input
                        type="text"
                        className="form-input"
                        placeholder="Add a remark (e.g. Fixed bug, ready for review)..."
                        value={progressNote}
                        onChange={(e) => setProgressNote(e.target.value)}
                        style={{ flex: 1 }}
                      />

                      <button
                        type="submit"
                        disabled={noteSubmitting}
                        className="btn btn-primary"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        <Send size={14} /> Update
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Activity / Progress History Timeline */}
          {task?.history && task.history.length > 0 && (
            <div>
              <h4
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginTop: '1.25rem',
                  marginBottom: '0.75rem',
                }}
              >
                Progress History & Remarks ({task.history.length})
              </h4>
              <div className="history-timeline">
                {task.history.map((item, idx) => (
                  <div key={idx} className="history-item">
                    <div className="history-dot" />
                    <div className="history-header">
                      <span style={{ fontWeight: 600, color: '#fff' }}>
                        {item.updatedBy?.name || 'Team Member'}
                      </span>
                      <span>•</span>
                      <span className={`badge ${item.status === 'Completed' ? 'badge-completed' : item.status === 'In Progress' ? 'badge-inprogress' : 'badge-todo'}`} style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                        {item.status}
                      </span>
                      <span>•</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {new Date(item.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {item.note && <div className="history-note">{item.note}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          {canEditOrManage && (
            <button
              type="submit"
              form="task-admin-form"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? 'Saving...' : mode === 'create' ? 'Create Task' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
