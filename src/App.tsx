import React, { useState, useEffect } from 'react';
import { User, Project, Task, TaskStatus, Comment } from './types';
import { 
  INITIAL_CURRENT_USER, 
  INITIAL_TEAM_MEMBERS, 
  INITIAL_PROJECTS, 
  INITIAL_TASKS 
} from './mockData';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import ProjectsView from './components/ProjectsView';
import MyWorkView from './components/MyWorkView';
import KanbanBoardView from './components/KanbanBoardView';
import ListView from './components/ListView';
import SettingsView from './components/SettingsView';
import LoginView from './components/LoginView';
import TaskModal from './components/TaskModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export default function App() {
  // ================= STATE INITIALIZATION =================
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('tf_is_logged_in') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('tf_current_user');
    return saved ? JSON.parse(saved) : INITIAL_CURRENT_USER;
  });

  const [teamMembers, setTeamMembers] = useState<User[]>(() => {
    const saved = localStorage.getItem('tf_team_members');
    return saved ? JSON.parse(saved) : INITIAL_TEAM_MEMBERS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('tf_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tf_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  // UI State Variables
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('all');

  // Preferences Toggles
  const [isCompact, setIsCompact] = useState<boolean>(() => {
    return localStorage.getItem('tf_pref_compact') === 'true';
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('tf_pref_dark') === 'true';
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('tf_pref_notif') !== 'false';
  });

  // Task Details / Create Modal Control State
  const [activeTaskForModal, setActiveTaskForModal] = useState<Task | undefined>(undefined);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [initialStatusForCreate, setInitialStatusForCreate] = useState<TaskStatus | undefined>(undefined);

  // Success Toasts Array
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ================= PERSISTENCE SYNC EFFECT =================
  useEffect(() => {
    localStorage.setItem('tf_is_logged_in', String(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('tf_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('tf_team_members', JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    localStorage.setItem('tf_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('tf_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('tf_pref_compact', String(isCompact));
  }, [isCompact]);

  useEffect(() => {
    localStorage.setItem('tf_pref_dark', String(isDarkMode));
    // Core HTML Document class toggler
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('tf_pref_notif', String(notificationsEnabled));
  }, [notificationsEnabled]);

  // ================= TOASTS MANAGER =================
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast_${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // ================= OPERATIONS & MUTATIONS =================
  const handleLogin = (user?: User) => {
    if (user) {
      setCurrentUser(user);
    }
    setIsLoggedIn(true);
    showToast(`Signed in successfully! Welcome back, ${user ? user.name : currentUser.name}.`, 'success');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    showToast('Signed out of TaskFlow workspace.', 'info');
  };

  const handleAddProject = (name: string, description: string) => {
    const newProj: Project = {
      id: `p_${Date.now()}`,
      name,
      description,
      progress: 0,
    };
    setProjects(prev => [...prev, newProj]);
    showToast(`Project "${name}" was created successfully.`, 'success');
  };

  const handleDeleteProject = (projectId: string) => {
    const proj = projects.find(p => p.id === projectId);
    const projName = proj ? proj.name : 'Project';
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setTasks(prev => prev.filter(t => t.projectId !== projectId));
    if (selectedProjectId === projectId) {
      setSelectedProjectId('all');
    }
    showToast(`Project "${projName}" and all its tasks were deleted.`, 'info');
  };

  const handleUpdateProjectMembers = (projectId: string, memberIds: string[]) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, memberIds };
      }
      return p;
    }));
    showToast('Project members updated successfully.', 'success');
  };

  const handleAddTeamMember = (name: string, role: string) => {
    const newMember: User = {
      id: `u_${Date.now()}`,
      name,
      role,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    };
    setTeamMembers(prev => [...prev, newMember]);
    showToast(`Team member "${name}" was successfully registered.`, 'success');
    return newMember;
  };

  const handleSaveTask = (taskData: Omit<Task, 'comments'>) => {
    const existingIndex = tasks.findIndex(t => t.id === taskData.id);
    
    if (existingIndex > -1) {
      // Edit mode: preserve existing comments!
      const originalComments = tasks[existingIndex].comments || [];
      const updatedTasks = [...tasks];
      updatedTasks[existingIndex] = {
        ...taskData,
        comments: originalComments,
      };
      setTasks(updatedTasks);
      showToast('Task specifications updated.', 'success');
    } else {
      // Create mode
      const newTask: Task = {
        ...taskData,
        comments: [],
      };
      setTasks(prev => [...prev, newTask]);
      showToast('Task added to active sprint board.', 'success');
    }
    setIsTaskModalOpen(false);
    setActiveTaskForModal(undefined);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    showToast('Task removed from pipeline.', 'info');
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        if (t.status !== newStatus) {
          showToast(`Task status changed to ${newStatus}.`, 'success');
        }
        return { ...t, status: newStatus };
      }
      return t;
    }));
  };

  const handleAddComment = (taskId: string, message: string) => {
    const newComm: Comment = {
      id: `c_${Date.now()}`,
      authorId: currentUser.id,
      message,
      timestamp: new Date().toISOString(),
    };

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          comments: [...(t.comments || []), newComm],
        };
      }
      return t;
    }));
    showToast('Comment posted successfully.', 'success');
  };

  // Shortcut for project card navigation
  const handleSelectProjectAndRoute = (projectId: string, targetView: 'board' | 'list') => {
    setSelectedProjectId(projectId);
    setCurrentView(targetView);
  };

  // Unified trigger to open details modal
  const handleOpenTaskDetails = (task: Task) => {
    setActiveTaskForModal(task);
    setIsTaskModalOpen(true);
  };

  // Unified trigger to open create modal
  const handleOpenCreateTask = (initialColStatus?: TaskStatus) => {
    setActiveTaskForModal(undefined);
    setInitialStatusForCreate(initialColStatus);
    setIsTaskModalOpen(true);
  };

  // ================= VIEW ROUTING ENGINE =================
  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={handleLogin} />;
  }

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            projects={projects}
            tasks={tasks}
            teamMembers={teamMembers}
            onNavigate={setCurrentView}
            onTaskClick={handleOpenTaskDetails}
            onCreateTaskClick={() => handleOpenCreateTask()}
            onCreateProjectClick={() => setCurrentView('projects')}
          />
        );
      case 'projects':
        return (
          <ProjectsView
            projects={projects}
            tasks={tasks}
            teamMembers={teamMembers}
            onAddProject={handleAddProject}
            onSelectProject={handleSelectProjectAndRoute}
            onDeleteProject={handleDeleteProject}
            onUpdateProjectMembers={handleUpdateProjectMembers}
            onAddTeamMember={handleAddTeamMember}
          />
        );
      case 'mywork':
        return (
          <MyWorkView
            tasks={tasks}
            projects={projects}
            currentUser={currentUser}
            onTaskClick={handleOpenTaskDetails}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
          />
        );
      case 'board':
        return (
          <KanbanBoardView
            tasks={tasks}
            projects={projects}
            teamMembers={teamMembers}
            onTaskClick={handleOpenTaskDetails}
            onCreateTaskClick={handleOpenCreateTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onDeleteProject={handleDeleteProject}
            onUpdateProjectMembers={handleUpdateProjectMembers}
            onAddTeamMember={handleAddTeamMember}
          />
        );
      case 'list':
        return (
          <ListView
            tasks={tasks}
            projects={projects}
            teamMembers={teamMembers}
            onTaskClick={handleOpenTaskDetails}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onDeleteProject={handleDeleteProject}
            onUpdateProjectMembers={handleUpdateProjectMembers}
            onAddTeamMember={handleAddTeamMember}
          />
        );
      case 'settings':
        return (
          <SettingsView
            currentUser={currentUser}
            isCompact={isCompact}
            setIsCompact={setIsCompact}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            notificationsEnabled={notificationsEnabled}
            setNotificationsEnabled={setNotificationsEnabled}
            onUpdateUser={setCurrentUser}
          />
        );
      default:
        return <div className="p-6 text-sm text-red-500">Workspace Routing Error</div>;
    }
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-gray-800 transition-colors duration-200 dark:bg-slate-950 dark:text-gray-100 ${isCompact ? 'text-xs' : ''}`}>
      
      {/* Sidebar navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Container frame */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Global sticky header */}
        <Header
          currentUser={currentUser}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onNavigate={setCurrentView}
          onLogout={handleLogout}
          notificationsEnabled={notificationsEnabled}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />

        {/* Dynamic page main panel content */}
        <main className="flex-1 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Unified Task details/creator popup Modal */}
      {isTaskModalOpen && (
        <TaskModal
          task={activeTaskForModal}
          initialStatus={initialStatusForCreate}
          projects={projects}
          teamMembers={teamMembers}
          currentUser={currentUser}
          onClose={() => {
            setIsTaskModalOpen(false);
            setActiveTaskForModal(undefined);
          }}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onAddComment={handleAddComment}
        />
      )}

      {/* Real-time Toasts notifications overlay */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-2.5 rounded-xl border p-4 shadow-xl transition-all duration-300 animate-slide-in bg-white dark:bg-slate-900 ${
              toast.type === 'success' 
                ? 'border-green-100 text-green-800 dark:border-green-950/45 dark:text-green-400'
                : toast.type === 'error'
                  ? 'border-red-100 text-red-800 dark:border-red-950/45 dark:text-red-400'
                  : 'border-blue-100 text-blue-800 dark:border-blue-950/45 dark:text-blue-400'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : toast.type === 'error' ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <Info className="h-5 w-5 text-blue-500" />
              )}
            </div>
            
            <div className="flex-1">
              <p className="text-xs font-semibold leading-normal">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="rounded-lg p-0.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}

