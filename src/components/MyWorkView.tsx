import React, { useState } from 'react';
import { Task, Project, User, TaskStatus, TaskPriority } from '../types';
import { 
  Briefcase, 
  Search, 
  SlidersHorizontal, 
  Calendar, 
  CheckCircle, 
  Trash2, 
  Play, 
  Clock, 
  AlertTriangle, 
  Check, 
  ChevronRight,
  Filter
} from 'lucide-react';

interface MyWorkViewProps {
  tasks: Task[];
  projects: Project[];
  currentUser: User;
  onTaskClick: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function MyWorkView({
  tasks,
  projects,
  currentUser,
  onTaskClick,
  onUpdateTaskStatus,
  onDeleteTask,
}: MyWorkViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filter tasks assigned to the CURRENT USER
  const myTasks = tasks.filter(t => t.assigneeId === currentUser.id);

  // Compute Stats for current user
  const totalMyTasks = myTasks.length;
  const myCompletedTasks = myTasks.filter(t => t.status === 'Done').length;
  const myInProgressTasks = myTasks.filter(t => t.status === 'In Progress').length;
  const myReviewTasks = myTasks.filter(t => t.status === 'Review').length;
  const myTodoTasks = myTasks.filter(t => t.status === 'To Do').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const myOverdueTasks = myTasks.filter(t => t.status !== 'Done' && t.dueDate < todayStr).length;

  // Filter Logic
  const filteredTasks = myTasks.filter(task => {
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesProject = filterProject === 'all' || task.projectId === filterProject;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    
    const project = projects.find(p => p.id === task.projectId);
    const searchLower = searchQuery.toLowerCase();
    
    const matchesSearch = 
      task.title.toLowerCase().includes(searchLower) ||
      task.description.toLowerCase().includes(searchLower) ||
      (project && project.name.toLowerCase().includes(searchLower)) ||
      task.labels.some(l => l.toLowerCase().includes(searchLower));

    return matchesPriority && matchesProject && matchesStatus && matchesSearch;
  });

  // Sort: Overdue first, then by priority weight, then by due date
  const priorityWeights = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // 1. Incomplete Overdue tasks go first
    const isAOverdue = a.status !== 'Done' && a.dueDate < todayStr;
    const isBOverdue = b.status !== 'Done' && b.dueDate < todayStr;
    if (isAOverdue && !isBOverdue) return -1;
    if (!isAOverdue && isBOverdue) return 1;

    // 2. Critical/High priorities next
    const weightA = priorityWeights[a.priority] || 0;
    const weightB = priorityWeights[b.priority] || 0;
    if (weightA !== weightB) return weightB - weightA;

    // 3. Due Date ascending
    return a.dueDate.localeCompare(b.dueDate);
  });

  const getPriorityBadgeColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'Low':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900';
      case 'Medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-900';
      case 'High':
        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900';
      case 'Critical':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-gray-300';
    }
  };

  const getStatusBadgeColor = (status: TaskStatus) => {
    switch (status) {
      case 'To Do':
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900';
      case 'Review':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900';
      case 'Done':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header Container */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/10">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-950 dark:text-white">
              My Work
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Welcome, <strong className="text-gray-800 dark:text-gray-200">{currentUser.name}</strong> ({currentUser.role}) • Review and manage your assigned tasks.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Tasks Card */}
        <div className="rounded-xl border border-gray-150 bg-white p-4.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Total My Tasks
            </span>
            <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {totalMyTasks}
            </span>
            <span className="text-xs text-gray-450">tasks</span>
          </div>
        </div>

        {/* In Progress Card */}
        <div className="rounded-xl border border-gray-150 bg-white p-4.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              In Progress
            </span>
            <div className="rounded-lg bg-yellow-50 p-1.5 text-yellow-600 dark:bg-yellow-950/40 dark:text-yellow-400">
              <Clock className="h-4 w-4 animate-spin-slow" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-yellow-600 dark:text-yellow-400">
              {myInProgressTasks}
            </span>
            <span className="text-xs text-gray-450">tasks</span>
          </div>
        </div>

        {/* Under Review Card */}
        <div className="rounded-xl border border-gray-150 bg-white p-4.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Under Review
            </span>
            <div className="rounded-lg bg-purple-50 p-1.5 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400">
              {myReviewTasks}
            </span>
            <span className="text-xs text-gray-450 font-medium">tasks</span>
          </div>
        </div>

        {/* Completed Card */}
        <div className="rounded-xl border border-gray-150 bg-white p-4.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Completed
            </span>
            <div className="rounded-lg bg-green-50 p-1.5 text-green-600 dark:bg-green-950/40 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-green-600 dark:text-green-400">
              {myCompletedTasks}
            </span>
            <span className="text-xs text-green-500 font-medium">
              /{totalMyTasks}
            </span>
          </div>
        </div>

        {/* Overdue Card */}
        <div className="rounded-xl border border-gray-150 bg-white p-4.5 shadow-sm col-span-2 lg:col-span-1 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Overdue
            </span>
            <div className={`rounded-lg p-1.5 ${myOverdueTasks > 0 ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' : 'bg-gray-50 text-gray-400'}`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className={`text-2xl font-bold tracking-tight ${myOverdueTasks > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
              {myOverdueTasks}
            </span>
            <span className="text-xs text-gray-450 font-medium">tasks</span>
          </div>
        </div>
      </div>

      {/* Main Filter & List Container */}
      <div className="rounded-2xl border border-gray-150 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Filters Top Bar */}
        <div className="flex flex-col gap-3 p-4 border-b border-gray-150 dark:border-slate-800 md:flex-row md:items-center">
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search task title, description, tags, or projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-4 text-xs outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-gray-100"
            />
          </div>

          {/* Inline Select Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Filter className="h-3.5 w-3.5" />
              <span>Filters:</span>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-gray-300"
            >
              <option value="all">All Statuses ({myTasks.length})</option>
              <option value="To Do">To Do ({myTodoTasks})</option>
              <option value="In Progress">In Progress ({myInProgressTasks})</option>
              <option value="Review">Review ({myReviewTasks})</option>
              <option value="Done">Done ({myCompletedTasks})</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-gray-300"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Project Filter */}
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-gray-300 max-w-[150px] truncate"
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tasks List */}
        {sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 dark:bg-slate-800 dark:text-slate-600 mb-4">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
              No tasks found
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-sm">
              There are no tasks assigned to you matching your current filter criteria.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-850">
            {sortedTasks.map((task) => {
              const project = projects.find(p => p.id === task.projectId);
              const isOverdue = task.status !== 'Done' && task.dueDate < todayStr;
              
              return (
                <div
                  key={task.id}
                  className="group flex flex-col md:flex-row md:items-center justify-between p-4 gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all"
                >
                  {/* Task details (Clickable area to open modal) */}
                  <div
                    onClick={() => onTaskClick(task)}
                    className="flex-1 min-w-0 cursor-pointer flex flex-col sm:flex-row sm:items-start gap-3.5"
                  >
                    {/* Status Checkbox Button indicator */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateTaskStatus(task.id, task.status === 'Done' ? 'To Do' : 'Done');
                      }}
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                        task.status === 'Done'
                          ? 'border-green-500 bg-green-500 text-white dark:border-green-600 dark:bg-green-600'
                          : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50/10 dark:border-slate-700 dark:hover:border-blue-800'
                      }`}
                      title={task.status === 'Done' ? 'Mark Incomplete' : 'Mark Complete'}
                    >
                      {task.status === 'Done' && <Check className="h-3 w-3 stroke-[3]" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {project && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50/50 px-1.5 py-0.5 rounded-md dark:bg-blue-950/30 dark:text-blue-400 uppercase tracking-wider">
                            {project.name}
                          </span>
                        )}
                        <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${getPriorityBadgeColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-medium ${getStatusBadgeColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>

                      <h4 className={`mt-2 text-xs font-bold leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${
                        task.status === 'Done' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-950 dark:text-white'
                      }`}>
                        {task.title}
                      </h4>

                      <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                        {task.description || 'No description provided'}
                      </p>

                      {/* Labels & Comments footer */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        {task.labels.map((lbl, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-medium text-gray-500 bg-gray-100 dark:bg-slate-800 dark:text-gray-400 px-1.5 py-0.5 rounded"
                          >
                            #{lbl}
                          </span>
                        ))}

                        {task.comments && task.comments.length > 0 && (
                          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                            • Comments ({task.comments.length})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Dates Column */}
                  <div className="flex items-center justify-between md:justify-end gap-3.5 border-t border-gray-100/40 pt-2.5 md:pt-0 md:border-0">
                    {/* Due Date Indicator */}
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${
                      isOverdue 
                        ? 'text-red-600 dark:text-red-400 animate-pulse' 
                        : task.status === 'Done'
                          ? 'text-gray-400'
                          : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-[11px]">
                        {isOverdue ? 'Overdue: ' : 'Due: '}
                        {new Date(task.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    {/* Quick status transition Actions */}
                    <div className="flex items-center gap-1">
                      {task.status === 'To Do' && (
                        <button
                          onClick={() => onUpdateTaskStatus(task.id, 'In Progress')}
                          className="flex h-7 items-center gap-1 rounded-lg border border-yellow-200 bg-yellow-50 px-2.5 text-[10px] font-bold text-yellow-700 hover:bg-yellow-100 dark:border-yellow-950/40 dark:bg-yellow-950/20 dark:text-yellow-400 cursor-pointer"
                          title="Start work immediately"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Start</span>
                        </button>
                      )}

                      {task.status === 'In Progress' && (
                        <button
                          onClick={() => onUpdateTaskStatus(task.id, 'Review')}
                          className="flex h-7 items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-2.5 text-[10px] font-bold text-purple-700 hover:bg-purple-100 dark:border-purple-950/40 dark:bg-purple-950/20 dark:text-purple-400 cursor-pointer"
                          title="Submit task for review"
                        >
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span>Submit</span>
                        </button>
                      )}

                      {task.status === 'Review' && (
                        <button
                          onClick={() => onUpdateTaskStatus(task.id, 'Done')}
                          className="flex h-7 items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-2.5 text-[10px] font-bold text-green-700 hover:bg-green-100 dark:border-green-950/40 dark:bg-green-950/20 dark:text-green-400 cursor-pointer"
                          title="Approve and mark as complete"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Approve</span>
                        </button>
                      )}

                      {/* View Details arrow indicator */}
                      <button
                        onClick={() => onTaskClick(task)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-800 dark:hover:text-gray-200"
                        title="View detailed specifications"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>

                      {/* Delete Quick action */}
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to remove this task from the workspace?')) {
                            onDeleteTask(task.id);
                          }
                        }}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/25 dark:hover:text-red-400"
                        title="Delete task from pipeline"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
