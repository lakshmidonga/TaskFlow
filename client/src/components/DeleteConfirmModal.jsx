import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, taskTitle }) => {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fb7185' }}>
            <AlertTriangle size={20} /> Confirm Delete
          </h3>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontWeight: 600 }}>
            Are you sure you want to delete this task?
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            "{taskTitle}" will be permanently removed. This action cannot be undone.
          </p>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} disabled={deleting} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={deleting} className="btn btn-danger">
            {deleting ? 'Deleting...' : 'Delete Task'}
          </button>
        </div>
      </div>
    </div>
  );
};
