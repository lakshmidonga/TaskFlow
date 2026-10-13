import React, { useState, useEffect, useMemo } from 'react';
import { apiRequest } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FilterBar } from '../components/FilterBar';
import { TaskCard } from '../components/TaskCard';
import { TaskModal } from '../components/TaskModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import {
  Plus,
  RefreshCw,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Inbox,
  ArrowRight,
  Edit2,
  Trash2,
} from 'lucide-react';

export const TasksPage = ({
  users = [],
  createModalOpen = false,
  setCreateModalOpen,
  selectedTask = null,
  setSelectedTask,
}) => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [assignee, setAssignee] = useState('all');
  const [isOverdueOnly, setIsOverdueOnly] = useState(false);
  const [sort, setSort] = useState('due_asc');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'create' | 'edit' | 'view'
  const [modalTask, setModalTask] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Listen to external createModalOpen or selectedTask from Dashboard
  useEffect(() => {
    if (createModalOpen) {
      setModalTask(null);
      setActiveModal('create');
    }
  }, [createModalOpen]);

  useEffect(() => {
    if (selectedTask) {
      setModalTask(selectedTask);
      setActiveModal(isAdmin ? 'edit' : 'view');
    }
  }, [selectedTask, isAdmin]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status !== 'all') params.append('status', status);
      if (priority !== 'all') params.append('priority', priority);
      if (assignee !== 'all') params.append('assignee', assignee);
      if (isOverdueOnly) params.append('overdue', 'true');
      if (search.trim()) params.append('search', search.trim());
      if (sort) params.append('sort', sort);

      const res = await apiRequest(`/tasks?${params.toString()}`);
      if (res.success) {
        setTasks(res.tasks);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, status, priority, assignee, isOverdueOnly, sort]);

  // Admin Save Task (Create or Edit)
  const handleSaveTask = async (formData, taskId) => {
    try {
      if (taskId) {
        // Edit existing
        const res = await apiRequest(`/tasks/${taskId}`, {
          method: 'PUT',
          body: formData,
        });
        if (res.success) {
          showToast('Task updated successfully!', 'success');
          fetchTasks();
        }
      } else {
        // Create new
        const res = await apiRequest('/tasks', {
          method: 'POST',
          body: formData,
        });
        if (res.success) {
          showToast('Task created successfully!', 'success');
          fetchTasks();
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to save task', 'error');
      throw err;
    }
  };

  // Quick Status Update
  const handleUpdateStatus = async (task, newStatus) => {
    try {
      const res = await apiRequest(`/tasks/${task._id}`, {
        method: 'PUT',
        body: { status: newStatus },
      });
      if (res.success) {
        showToast(`Task moved to "${newStatus}"!`, 'success');
        fetchTasks();
      }
    } catch (err) {
      showToast(err.message || 'Could not update task status', 'error');
    }
  };

  // Add Progress Note
  const handleAddProgressNote = async (taskId, { note, status }) => {
    try {
      const res = await apiRequest(`/tasks/${taskId}/progress`, {
        method: 'POST',
        body: { note, status },
      });
      if (res.success) {
        showToast('Progress update recorded!', 'success');
        fetchTasks();
        setModalTask(res.task);
      }
    } catch (err) {
      showToast(err.message || 'Failed to record progress update', 'error');
      throw err;
    }
  };

  // Confirm and Execute Task Delete
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      const res = await apiRequest(`/tasks/${taskToDelete._id}`, {
        method: 'DELETE',
      });
      if (res.success) {
        showToast('Task deleted successfully.', 'info');
        fetchTasks();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete task', 'error');
    }
  };

  const handleOpenEdit = (task) => {
    setModalTask(task);
    setActiveModal(isAdmin ? 'edit' : 'view');
  };

  const handleOpenDelete = (task) => {
    setTaskToDelete(task);
    setDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setModalTask(null);
    if (setCreateModalOpen) setCreateModalOpen(false);
    if (setSelectedTask) setSelectedTask(null);
  };

  // Group tasks into Kanban columns
  const kanbanColumns = useMemo(() => {
    return {
      'To Do': tasks.filter((t) => t.status === 'To Do'),
      'In Progress': tasks.filter((t) => t.status === 'In Progress'),
      'Completed': tasks.filter((t) => t.status === 'Completed'),
    };
  }, [tasks]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks Management</h1>
          <p className="page-subtitle">
            Create, assign, track milestones, and update sprint deliverables.
          </p>
        </div>

        <div className="header-actions">
          <button
            onClick={fetchTasks}
            className="btn btn-secondary"
            title="Refresh task list"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh
          </button>

          <button
            id="create-task-btn"
            onClick={() => {
              setModalTask(null);
              setActiveModal('create');
            }}
            className="btn btn-primary"
            style={{ fontWeight: 700 }}
          >
            <Plus size={16} strokeWidth={2.5} /> Create Task
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        priority={priority}
        setPriority={setPriority}
        assignee={assignee}
        setAssignee={setAssignee}
        isOverdueOnly={isOverdueOnly}
        setIsOverdueOnly={setIsOverdueOnly}
        sort={sort}
        setSort={setSort}
        viewMode={viewMode}
        setViewMode={setViewMode}
        users={users}
      />

      {/* Empty State */}
      {!loading && tasks.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <Inbox size={32} />
          </div>
          <h3 className="empty-title">No tasks found</h3>
          <p className="empty-desc">
            {isOverdueOnly
              ? 'Great news! There are no overdue tasks matching your filter criteria.'
              : 'Try clearing your filters or create a new task to get started.'}
          </p>
          <button
            onClick={() => {
              setModalTask(null);
              setActiveModal('create');
            }}
            className="btn btn-primary"
          >
            <Plus size={16} /> Create First Task
          </button>
        </div>
      )}

      {/* Kanban Board View */}
      {viewMode === 'kanban' && tasks.length > 0 && (
        <div className="kanban-grid">
          {Object.entries(kanbanColumns).map(([colStatus, colTasks]) => (
            <div key={colStatus} className="kanban-column">
              <div className="kanban-column-header">
                <div className="kanban-column-title">
                  <span
                    className={`badge ${colStatus === 'Completed' ? 'badge-completed' : colStatus === 'In Progress' ? 'badge-inprogress' : 'badge-todo'}`}
                    style={{ fontSize: '0.7rem' }}
                  >
                    {colStatus}
                  </span>
                </div>
                <span className="kanban-column-count">{colTasks.length}</span>
              </div>

              <div className="kanban-cards-wrapper">
                {colTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={handleOpenEdit}
                    onDelete={handleOpenDelete}
                    onUpdateStatus={handleUpdateStatus}
                    onViewDetails={handleOpenEdit}
                  />
                ))}

                {colTasks.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                    No tasks in {colStatus}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List / Table View */}
      {viewMode === 'list' && tasks.length > 0 && (
        <div className="tasks-table-container">
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assignee</th>
                <th>Due Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const dueDate = new Date(task.dueDate);
                const isOverdue = task.status !== 'Completed' && new Date() > dueDate;
                const isAssignee = task.assignedTo?._id === user?._id;

                return (
                  <tr key={task._id}>
                    <td>
                      <div
                        style={{ cursor: 'pointer', fontWeight: 600, color: '#fff' }}
                        onClick={() => handleOpenEdit(task)}
                      >
                        {task.title}
                      </div>
                      {task.description && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {task.description}
                        </div>
                      )}
                    </td>

                    <td>
                      <span
                        className={`badge ${task.status === 'Completed' ? 'badge-completed' : task.status === 'In Progress' ? 'badge-inprogress' : 'badge-todo'}`}
                      >
                        {task.status}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`badge ${task.priority === 'High' ? 'badge-priority-high' : task.priority === 'Medium' ? 'badge-priority-medium' : 'badge-priority-low'}`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          className="user-avatar"
                          style={{
                            width: '24px',
                            height: '24px',
                            fontSize: '0.68rem',
                            backgroundColor: task.assignedTo?.avatarColor || '#6366f1',
                          }}
                        >
                          {task.assignedTo?.name?.[0]}
                        </div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {task.assignedTo?.name || 'Unassigned'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          color: isOverdue ? '#f87171' : 'var(--text-muted)',
                          fontSize: '0.85rem',
                          fontWeight: isOverdue ? 700 : 500,
                        }}
                      >
                        <Calendar size={13} />
                        <span>{dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        {isOverdue && (
                          <span className="badge badge-overdue" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                            Overdue
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {(isAdmin || isAssignee) && (
                          <button
                            onClick={() => handleOpenEdit(task)}
                            className="btn btn-secondary btn-sm"
                            title="Update progress or details"
                          >
                            <Edit2 size={13} /> Details
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleOpenDelete(task)}
                            className="btn-icon"
                            style={{ width: '28px', height: '28px', color: '#f43f5e' }}
                            title="Delete Task"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Modal (Create, Edit, Progress Update, Timeline) */}
      <TaskModal
        isOpen={!!activeModal}
        onClose={handleCloseModal}
        task={modalTask}
        users={users}
        onSave={handleSaveTask}
        onAddProgressNote={handleAddProgressNote}
        mode={activeModal || 'view'}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        taskTitle={taskToDelete?.title || ''}
      />
    </div>
  );
};
