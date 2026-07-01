import React, { useState } from 'react';
import { Task, Project, User, TaskStatus, TaskPriority } from '../types';
import { 
  Plus, 
  Calendar, 
  MessageSquare, 
  Tag, 
  X, 
  Filter, 
  Search, 
  SlidersHorizontal, 
  CheckCircle, 
  Trash2,
  AlertCircle,
  Users,
  UserPlus,
  Check
} from 'lucide-react';

interface KanbanBoardViewProps {
  tasks: Task[];
  projects: Project[];
  teamMembers: User[];
  onTaskClick: (task: Task) => void;
  onCreateTaskClick: (initialStatus?: TaskStatus) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  // Active states from parent (or local)
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onDeleteProject?: (projectId: string) => void;
  onUpdateProjectMembers?: (projectId: string, memberIds: string[]) => void;
  onAddTeamMember?: (name: string, role: string) => User;
}

const COLUMNS: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Done'];

export default function KanbanBoardView({
  tasks,
  projects,
  teamMembers,
  onTaskClick,
  onCreateTaskClick,
  onUpdateTaskStatus,
  selectedProjectId,
  setSelectedProjectId,
  searchQuery,
  setSearchQuery,
  onDeleteProject,
  onUpdateProjectMembers,
  onAddTeamMember,
}: KanbanBoardViewProps) {
  // Local Filter States
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<TaskStatus | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Manage Project Members States
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [memberError, setMemberError] = useState('');

  const currentProject = projects.find(p => p.id === selectedProjectId);

  const selectedProjTasks = currentProject ? tasks.filter(t => t.projectId === currentProject.id) : [];
  const defaultSelectedUserIds = Array.from(new Set(selectedProjTasks.map(t => t.assigneeId)));
  const currentProjMemberIds = currentProject ? (currentProject.memberIds || defaultSelectedUserIds) : [];

  const handleToggleMember = (userId: string) => {
    if (!currentProject || !onUpdateProjectMembers) return;
    const isMember = currentProjMemberIds.includes(userId);
    let newMemberIds: string[];
    if (isMember) {
      newMemberIds = currentProjMemberIds.filter(id => id !== userId);
    } else {
      newMemberIds = [...currentProjMemberIds, userId];
    }
    onUpdateProjectMembers(currentProject.id, newMemberIds);
  };

  const handleCreateAndAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) {
      setMemberError('Name is required.');
      return;
    }
    if (!currentProject || !onAddTeamMember || !onUpdateProjectMembers) return;

    // Create team member and add to project
    const newMember = onAddTeamMember(newMemberName.trim(), newMemberRole.trim() || 'Contributor');
    const newMemberIds = [...currentProjMemberIds, newMember.id];
    onUpdateProjectMembers(currentProject.id, newMemberIds);

    setNewMemberName('');
    setNewMemberRole('');
    setMemberError('');
  };

  // Filter Logic
  const filteredTasks = tasks.filter(task => {
    const matchesProject = selectedProjectId === 'all' || task.projectId === selectedProjectId;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesAssignee = filterAssignee === 'all' || task.assigneeId === filterAssignee;
    
    // Search fields: title, description, project name, assignee name
    const assignee = teamMembers.find(m => m.id === task.assigneeId);
    const project = projects.find(p => p.id === task.projectId);
    const searchLower = searchQuery.toLowerCase();
    
    const matchesSearch = 
      task.title.toLowerCase().includes(searchLower) ||
      task.description.toLowerCase().includes(searchLower) ||
      (assignee && assignee.name.toLowerCase().includes(searchLower)) ||
      (project && project.name.toLowerCase().includes(searchLower)) ||
      task.labels.some(l => l.toLowerCase().includes(searchLower));

    return matchesProject && matchesPriority && matchesAssignee && matchesSearch;
  });

  // Native Drag and Drop
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent, status: TaskStatus) => {
    setHoveredColumn(status);
  };

  const handleDragLeave = (e: React.DragEvent, status: TaskStatus) => {
    // Only clear if we actually moved out of this column
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onUpdateTaskStatus(taskId, targetStatus);
    }
    setDraggedTaskId(null);
    setHoveredColumn(null);
  };

  const clearAllFilters = () => {
    setSelectedProjectId('all');
    setFilterPriority('all');
    setFilterAssignee('all');
    setSearchQuery('');
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/45 dark:text-green-400 dark:border-green-900';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/45 dark:text-yellow-400 dark:border-yellow-900';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/45 dark:text-orange-400 dark:border-orange-900';
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/45 dark:text-red-400 dark:border-red-900';
    }
  };

  // Check if any filter is active
  const isAnyFilterActive = 
    selectedProjectId !== 'all' || 
    filterPriority !== 'all' || 
    filterAssignee !== 'all' || 
    searchQuery !== '';

  return (
    <div className="flex flex-col gap-5 p-6 h-full">
      {/* Visual Title */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Kanban Pipeline</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Drag and drop cards across columns to coordinate live task assignments.
          </p>
        </div>

        <button
          onClick={() => onCreateTaskClick('To Do')}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Task
        </button>
      </div>

      {/* Interactive Sliders Filter Panel */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-150 bg-white p-4 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-slate-850">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-850 dark:text-gray-200">
            <SlidersHorizontal className="h-4 w-4 text-blue-600" />
            <span>Filter and Sort Pipeline</span>
          </div>
          {isAnyFilterActive && (
            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold text-red-600 hover:text-red-800 dark:text-red-400 hover:underline"
            >
              Clear All Filters
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Project Filter */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">
              Filter by Project
            </label>
            <div className="flex gap-1.5">
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  setConfirmDelete(false);
                }}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300"
              >
                <option value="all">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {selectedProjectId !== 'all' && onUpdateProjectMembers && (
                <button
                  onClick={() => setIsMembersModalOpen(true)}
                  className="rounded-lg border border-blue-200 bg-blue-50 p-1.5 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-400 transition-colors cursor-pointer shrink-0 flex items-center gap-1 text-xs font-semibold"
                  title="Manage Project Members"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Members</span>
                </button>
              )}
              {selectedProjectId !== 'all' && onDeleteProject && (
                <button
                  onClick={() => {
                    if (confirmDelete) {
                      onDeleteProject(selectedProjectId);
                      setConfirmDelete(false);
                    } else {
                      setConfirmDelete(true);
                      setTimeout(() => setConfirmDelete(false), 4000);
                    }
                  }}
                  className={`rounded-lg border p-1.5 transition-colors cursor-pointer shrink-0 flex items-center justify-center ${
                    confirmDelete
                      ? 'border-red-500 bg-red-600 text-white hover:bg-red-700 animate-pulse'
                      : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400'
                  }`}
                  title={confirmDelete ? "Click again to confirm delete" : "Delete Selected Project"}
                >
                  {confirmDelete ? (
                    <span className="text-[10px] font-bold px-1 text-white">Confirm?</span>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">
              Filter by Priority
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300"
            >
              <option value="all">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Assignee Filter */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">
              Filter by Assignee
            </label>
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300"
            >
              <option value="all">All Assignees</option>
              {teamMembers.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Instant Search Widget */}
          <div className="relative">
            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">
              Keyword Search
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-gray-400">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-xs outline-none transition-all focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-150"
              />
            </div>
          </div>
        </div>

        {/* Removable chips */}
        {isAnyFilterActive && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-gray-100 dark:border-slate-850">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Active filters:</span>
            {selectedProjectId !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                Project: {projects.find(p => p.id === selectedProjectId)?.name}
                <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setSelectedProjectId('all')} />
              </span>
            )}
            {filterPriority !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                Priority: {filterPriority}
                <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setFilterPriority('all')} />
              </span>
            )}
            {filterAssignee !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600 dark:bg-green-950/40 dark:text-green-400">
                Assignee: {teamMembers.find(m => m.id === filterAssignee)?.name}
                <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setFilterAssignee('all')} />
              </span>
            )}
            {searchQuery !== '' && (
              <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 dark:bg-slate-800 dark:text-gray-400">
                Query: "{searchQuery}"
                <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setSearchQuery('')} />
              </span>
            )}
          </div>
        )}
      </div>

      {/* Board Columns Layout */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 min-h-[500px] h-full">
          {COLUMNS.map((columnStatus) => {
            const columnTasks = filteredTasks.filter(t => t.status === columnStatus);
            const isHovered = hoveredColumn === columnStatus;

            return (
              <div
                key={columnStatus}
                onDragOver={(e) => handleDragOver(e, columnStatus)}
                onDragEnter={(e) => handleDragEnter(e, columnStatus)}
                onDragLeave={(e) => handleDragLeave(e, columnStatus)}
                onDrop={(e) => handleDrop(e, columnStatus)}
                className={`flex w-72 shrink-0 flex-col rounded-xl p-3 transition-colors duration-200 ${
                  isHovered 
                    ? 'bg-blue-50/40 border border-dashed border-blue-400 dark:bg-slate-800/50' 
                    : 'bg-gray-50/80 border border-transparent dark:bg-slate-900/40'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-100">{columnStatus}</span>
                    <span className="rounded-full bg-gray-200/60 px-2 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-slate-800 dark:text-gray-400">
                      {columnTasks.length}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => onCreateTaskClick(columnStatus)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-150 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-gray-200"
                    title="Add task in this column"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Cards Container */}
                <div className="flex flex-col gap-2.5 overflow-y-auto flex-1 max-h-[600px] pr-1">
                  {columnTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-gray-200 rounded-lg dark:border-slate-800">
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Empty column</p>
                    </div>
                  ) : (
                    columnTasks.map((task) => {
                      const assignee = teamMembers.find(u => u.id === task.assigneeId);
                      const project = projects.find(p => p.id === task.projectId);

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={() => onTaskClick(task)}
                          className="group relative flex flex-col justify-between rounded-xl border border-gray-150 bg-white p-4 shadow-xs transition-all hover:shadow-md hover:translate-y-[-1px] cursor-grab active:cursor-grabbing dark:border-slate-800 dark:bg-slate-900"
                        >
                          {/* Project Tag */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 truncate max-w-[120px]">
                              {project?.name || 'No Project'}
                            </span>
                            <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-bold border ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>

                          {/* Task Title */}
                          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                            {task.title}
                          </h4>

                          {/* Task Description */}
                          {task.description && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          {/* Labels Chips */}
                          {task.labels && task.labels.length > 0 && (
                            <div className="mt-2.5 flex flex-wrap gap-1">
                              {task.labels.map((lbl, idx) => (
                                <span 
                                  key={idx} 
                                  className="inline-flex items-center gap-0.5 rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold text-gray-600 dark:bg-slate-800 dark:text-gray-400"
                                >
                                  <Tag className="h-2 w-2 text-gray-400" />
                                  {lbl}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Card Footer: Due Date, Comments, Avatar */}
                          <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-2.5 dark:border-slate-850">
                            <div className="flex items-center gap-2.5 text-[10px] text-gray-400 dark:text-gray-500 font-semibold">
                              <span className="flex items-center gap-0.5">
                                <Calendar className="h-3.5 w-3.5" />
                                {task.dueDate}
                              </span>
                              {task.comments.length > 0 && (
                                <span className="flex items-center gap-0.5">
                                  <MessageSquare className="h-3.5 w-3.5" />
                                  {task.comments.length}
                                </span>
                              )}
                            </div>

                            <img
                              src={assignee?.avatar}
                              alt={assignee?.name}
                              title={`Assigned to ${assignee?.name}`}
                              className="h-6 w-6 rounded-full object-cover ring-1 ring-gray-100 dark:ring-slate-850"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(assignee?.name || '')}`;
                              }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manage Project Members Modal */}
      {isMembersModalOpen && currentProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-gray-900/45 backdrop-blur-xs transition-opacity"
            onClick={() => {
              setIsMembersModalOpen(false);
              setNewMemberName('');
              setNewMemberRole('');
              setMemberError('');
            }}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-gray-100 dark:border-slate-800 flex flex-col max-h-[90vh] text-left">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Manage Project Members</h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Select team members to join <span className="font-semibold text-blue-600 dark:text-blue-400">"{currentProject.name}"</span>.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsMembersModalOpen(false);
                  setNewMemberName('');
                  setNewMemberRole('');
                  setMemberError('');
                }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Members List section */}
            <div className="mt-4 flex-1 overflow-y-auto pr-1 max-h-[300px] border border-gray-100 dark:border-slate-800 rounded-xl p-3 bg-gray-55/30 dark:bg-slate-950/20">
              <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">
                Team Members ({teamMembers.length})
              </label>
              <div className="flex flex-col gap-2">
                {teamMembers.map((member) => {
                  const isChecked = currentProjMemberIds.includes(member.id);
                  return (
                    <div
                      key={member.id}
                      onClick={() => handleToggleMember(member.id)}
                      className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                        isChecked 
                          ? 'border-blue-150 bg-blue-50/30 dark:border-blue-900/40 dark:bg-blue-950/10' 
                          : 'border-transparent bg-white hover:bg-gray-50 dark:bg-slate-900 dark:hover:bg-slate-800/55'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="h-8 w-8 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`;
                          }}
                        />
                        <div>
                          <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200">{member.name}</h4>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">{member.role || 'Member'}</p>
                        </div>
                      </div>
                      <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-300 dark:border-slate-700'
                      }`}>
                        {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Add Team Member Section */}
            {onAddTeamMember && (
              <div className="mt-5 pt-4 border-t border-gray-150 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <UserPlus className="h-4 w-4 text-blue-500" />
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Create & Register New Team Member</h4>
                </div>
                <form onSubmit={handleCreateAndAddMember} className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Full Name (e.g. John Doe)"
                        value={newMemberName}
                        onChange={(e) => {
                          setNewMemberName(e.target.value);
                          if (e.target.value.trim()) setMemberError('');
                        }}
                        className={`w-full rounded-lg border px-3 py-1.5 text-xs outline-none transition-all dark:bg-slate-800 dark:text-gray-100 ${
                          memberError ? 'border-red-500' : 'border-gray-200 dark:border-slate-700 focus:border-blue-500'
                        }`}
                      />
                      {memberError && (
                        <p className="mt-1 text-[10px] text-red-500 font-semibold">{memberError}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Role (e.g. Developer, Designer)"
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-blue-600 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create Member and Add to Project
                  </button>
                </form>
              </div>
            )}

            {/* Close Button */}
            <div className="mt-5 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsMembersModalOpen(false);
                  setNewMemberName('');
                  setNewMemberRole('');
                  setMemberError('');
                }}
                className="rounded-lg bg-gray-100 hover:bg-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-gray-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
