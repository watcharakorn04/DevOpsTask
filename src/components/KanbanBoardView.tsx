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
  AlertCircle 
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
}: KanbanBoardViewProps) {
  // Local Filter States
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<TaskStatus | null>(null);

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
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300"
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
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
    </div>
  );
}
