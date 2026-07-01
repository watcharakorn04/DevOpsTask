import React, { useState } from 'react';
import { Project, Task, User } from '../types';
import { Search, Plus, Calendar, CheckSquare, Layers, Users, Sparkles, FolderKanban, Trash2 } from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  tasks: Task[];
  teamMembers: User[];
  onAddProject: (name: string, description: string) => void;
  onSelectProject: (projectId: string, view: 'board' | 'list') => void;
  onDeleteProject?: (projectId: string) => void;
}

export default function ProjectsView({
  projects,
  tasks,
  teamMembers,
  onAddProject,
  onSelectProject,
  onDeleteProject,
}: ProjectsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'high' | 'low' | 'empty'>('all');
  
  // Create Project Modal States
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [errorName, setErrorName] = useState('');
  const [errorDesc, setErrorDesc] = useState('');

  // Project Client Validation
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    
    if (!newProjectName.trim()) {
      setErrorName('Project name is required.');
      valid = false;
    } else if (newProjectName.length > 80) {
      setErrorName('Project name cannot exceed 80 characters.');
      valid = false;
    } else {
      setErrorName('');
    }

    if (newProjectDesc.length > 500) {
      setErrorDesc('Description cannot exceed 500 characters.');
      valid = false;
    } else {
      setErrorDesc('');
    }

    if (valid) {
      onAddProject(newProjectName.trim(), newProjectDesc.trim());
      // Reset
      setNewProjectName('');
      setNewProjectDesc('');
      setIsOpenModal(false);
    }
  };

  // Filter & Search Projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          project.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Dynamic stats to calculate filter
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    const completedTasks = projectTasks.filter(t => t.status === 'Done').length;
    const calcProgress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;

    if (filterType === 'high') return matchesSearch && calcProgress >= 60;
    if (filterType === 'low') return matchesSearch && calcProgress < 60 && projectTasks.length > 0;
    if (filterType === 'empty') return matchesSearch && projectTasks.length === 0;
    return matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Upper header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create, manage, and track individual projects and visual boards.
          </p>
        </div>

        <button
          onClick={() => setIsOpenModal(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Project
        </button>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl border border-gray-150 dark:bg-slate-900 dark:border-slate-800">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-55 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">Progress Filter</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 outline-none hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-200"
          >
            <option value="all">All Projects</option>
            <option value="high">High Progress (≥60%)</option>
            <option value="low">In-Flight (&lt;60%)</option>
            <option value="empty">No tasks defined yet</option>
          </select>
        </div>
      </div>

      {/* Project Grid */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-250 py-16 text-center dark:border-slate-700 bg-gray-55/30 dark:bg-slate-800/10">
          <FolderKanban className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">No projects found</h3>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 max-w-sm">
            We couldn't find any projects matching your current query. Try adjusting your search query or progress filter, or add a new project.
          </p>
          <button
            onClick={() => setIsOpenModal(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400"
          >
            Create First Project
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            // Task calculations
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const doneTasks = projectTasks.filter(t => t.status === 'Done').length;
            const inProgressCount = projectTasks.filter(t => t.status === 'In Progress').length;
            const calcProgress = projectTasks.length > 0 ? Math.round((doneTasks / projectTasks.length) * 100) : 0;

            // Extract unique members assigned to tasks in this project
            const assignedUserIds = Array.from(new Set(projectTasks.map(t => t.assigneeId)));
            const assignedUsers = teamMembers.filter(m => assignedUserIds.includes(m.id));

            return (
              <div 
                key={project.id}
                className="flex flex-col justify-between rounded-xl border border-gray-150 bg-white p-5 shadow-xs transition-all hover:shadow-md hover:translate-y-[-2px] dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                      Active Board
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1 font-mono">
                      <Layers className="h-3 w-3" />
                      ID: {project.id}
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                    {project.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-3 min-h-[48px]">
                    {project.description || 'No description provided.'}
                  </p>

                  {/* Summary indicators */}
                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <CheckSquare className="h-4 w-4 text-gray-400" />
                      <span>{projectTasks.length} {projectTasks.length === 1 ? 'task' : 'tasks'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{assignedUsers.length === 0 ? 'No members' : `${assignedUsers.length} active`}</span>
                    </div>
                  </div>

                  {/* Overlapping member avatars */}
                  {assignedUsers.length > 0 && (
                    <div className="mt-3 flex items-center -space-x-2 overflow-hidden">
                      {assignedUsers.map((user) => (
                        <img
                          key={user.id}
                          className="inline-block h-6.5 w-6.5 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
                          src={user.avatar}
                          alt={user.name}
                          title={user.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`;
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Progress Indicators */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                      <span>Completion</span>
                      <span>{calcProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-slate-850">
                      <div 
                        className="h-1.5 rounded-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${calcProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-6 flex items-center gap-2 border-t border-gray-100 pt-4 dark:border-slate-800">
                  <button
                    onClick={() => onSelectProject(project.id, 'board')}
                    className="flex-1 rounded-lg bg-blue-600 py-1.5 text-center text-xs font-bold text-white hover:bg-blue-700 transition-colors"
                  >
                    Open Board
                  </button>
                  <button
                    onClick={() => onSelectProject(project.id, 'list')}
                    className="flex-1 rounded-lg border border-gray-200 bg-white py-1.5 text-center text-xs font-semibold text-gray-700 hover:bg-gray-55 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-750"
                  >
                    View List
                  </button>
                  {onDeleteProject && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete project "${project.name}"? This will also permanently delete all tasks under this project.`)) {
                          onDeleteProject(project.id);
                        }
                      }}
                      className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400 transition-colors cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal Dialog */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-gray-900/45 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpenModal(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create New Project</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Set up a new space for planning issues, kanban pipelines, and goals.
            </p>

            <form onSubmit={handleCreateProject} className="mt-4 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Developer Documentation API"
                  value={newProjectName}
                  onChange={(e) => {
                    setNewProjectName(e.target.value);
                    if (e.target.value.trim()) setErrorName('');
                  }}
                  className={`w-full rounded-lg border px-3.5 py-2 text-sm outline-none transition-all dark:bg-slate-800 dark:text-gray-100 ${
                    errorName ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700'
                  }`}
                />
                {errorName && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{errorName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">
                  Description
                </label>
                <textarea
                  placeholder="Describe project details, scopes, and milestones..."
                  rows={3}
                  value={newProjectDesc}
                  onChange={(e) => {
                    setNewProjectDesc(e.target.value);
                    if (e.target.value.length <= 500) setErrorDesc('');
                  }}
                  className={`w-full rounded-lg border px-3.5 py-2 text-sm outline-none transition-all dark:bg-slate-800 dark:text-gray-100 ${
                    errorDesc ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700'
                  }`}
                />
                <div className="flex items-center justify-between mt-1">
                  {errorDesc ? (
                    <p className="text-xs text-red-500 font-semibold">{errorDesc}</p>
                  ) : (
                    <span className="text-[10px] text-gray-400">Optional</span>
                  )}
                  <span className="text-[10px] text-gray-400 font-mono">{newProjectDesc.length}/500</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpenModal(false);
                    setNewProjectName('');
                    setNewProjectDesc('');
                    setErrorName('');
                    setErrorDesc('');
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
