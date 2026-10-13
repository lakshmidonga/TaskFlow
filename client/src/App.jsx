import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { apiRequest } from './api/apiClient';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { TasksPage } from './pages/TasksPage';
import { TeamPage } from './pages/TeamPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import './App.css';

function MainLayout() {
  const { isAuthenticated, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'tasks' | 'team'
  const [users, setUsers] = useState([]);

  // Cross-page triggers from Dashboard
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Fetch team members when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchUsers = async () => {
        try {
          const res = await apiRequest('/users');
          if (res.success) {
            setUsers(res.users);
          }
        } catch (err) {
          console.error('Failed to load users:', err);
        }
      };
      fetchUsers();
    }
  }, [isAuthenticated, currentView]);

  const [authEmail, setAuthEmail] = useState('');

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-app)',
          color: 'var(--text-muted)',
        }}
      >
        <p>Loading TaskFlow workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return authView === 'login' ? (
      <Login
        initialEmail={authEmail}
        onSwitchToRegister={(email) => {
          if (email) setAuthEmail(email);
          setAuthView('register');
        }}
      />
    ) : (
      <Register
        initialEmail={authEmail}
        onSwitchToLogin={(email) => {
          if (email) setAuthEmail(email);
          setAuthView('login');
        }}
      />
    );
  }

  const handleOpenCreateTask = () => {
    setCurrentView('tasks');
    setCreateModalOpen(true);
  };

  const handleSelectTask = (task) => {
    setCurrentView('tasks');
    setSelectedTask(task);
  };

  return (
    <div className="app-container">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      <main className="main-wrapper">
        {currentView === 'dashboard' && (
          <Dashboard
            onNavigateToTasks={() => setCurrentView('tasks')}
            onOpenCreateTask={handleOpenCreateTask}
            onSelectTask={handleSelectTask}
          />
        )}

        {currentView === 'tasks' && (
          <TasksPage
            users={users}
            createModalOpen={createModalOpen}
            setCreateModalOpen={setCreateModalOpen}
            selectedTask={selectedTask}
            setSelectedTask={setSelectedTask}
          />
        )}

        {currentView === 'team' && <TeamPage users={users} />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ToastProvider>
  );
}
