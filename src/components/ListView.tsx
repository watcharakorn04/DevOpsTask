import React, { useState } from 'react';
import { Task, Project, User, TaskStatus, TaskPriority } from '../types';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  ArrowUpDown, 
  Calendar, 
  Check, 
  Trash2, 
  CheckCircle, 
  Sliders, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';

interface ListViewProps {
  tasks: Task[];
  projects: Project[];
  teamMembers: User[];
  onTaskClick: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

type SortField = 'title' | 'project' | 'status' | 'priority' | 'dueDate';
type SortOrder = 'asc' | 'desc';

export default function ListView({
  tasks,
  projects,
  teamMembers,
  onTaskClick,
  onUpdateTaskStatus,
  onDeleteTask,
  selectedProjectId,
  setSelectedProjectId,
  searchQuery,
  setSearchQuery,
}: ListViewProps) {
  // Filters
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Multi-select Tasks
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // Filter Logic
  const filteredTasks = tasks.filter(task => {
    const matchesProject = selectedProjectId === 'all' || task.projectId === selectedProjectId;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesAssignee = filterAssignee === 'all' || task.assigneeId === filterAssignee;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    
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

    return matchesProject && matchesPriority && matchesAssignee && matchesStatus && matchesSearch;
  });

  // Sort Logic
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let valueA: any = '';
    let valueB: any = '';

    if (sortField === 'title') {
      valueA = a.title.toLowerCase();
      valueB = b.title.toLowerCase();
    } else if (sortField === 'project') {
      const pA = projects.find(p => p.id === a.projectId)?.name || '';
      const pB = projects.find(p => p.id === b.projectId)?.name || '';
      valueA = pA.toLowerCase();
      valueB = pB.toLowerCase();
    } else if (sortField === 'status') {
      valueA = a.status;
      valueB = b.status;
    } else if (sortField === 'priority') {
      // Custom weight for priorities
      const priorityWeights = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      valueA = priorityWeights[a.priority] || 0;
      valueB = priorityWeights[b.priority] || 0;
    } else if (sortField === 'dueDate') {
      valueA = new Date(a.dueDate).getTime();
      valueB = new Date(b.dueDate).getTime();
    }

    if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTaskIds(sortedTasks.map(t => t.id));
    } else {
      setSelectedTaskIds([]);
    }
  };

  const handleSelectTask = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTaskIds(prev => [...prev, taskId]);
    } else {
      setSelectedTaskIds(prev => prev.filter(id => id !== taskId));
    }
  };

  // Bulk Actions
  const handleBulkComplete = () => {
    selectedTaskIds.forEach(id => {
      onUpdateTaskStatus(id, 'Done');
    });
    setSelectedTaskIds([]);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedTaskIds.length} tasks?`)) {
      selectedTaskIds.forEach(id => {
        onDeleteTask(id);
      });
      setSelectedTaskIds([]);
    }
  };

  const clearAllFilters = () => {
    setSelectedProjectId('all');
    setFilterPriority('all');
    setFilterAssignee('all');
    setFilterStatus('all');
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

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'To Do':
        return 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400';
      case 'Review':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400';
      case 'Done':
        return 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400';
    }
  };

  const isAnyFilterActive = 
    selectedProjectId !== 'all' || 
    filterPriority !== 'all' || 
    filterAssignee !== 'all' || 
    filterStatus !== 'all' ||
    searchQuery !== '';

  return (
    <div className="flex flex-col gap-5 p-6 h-full">
      {/* Visual Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Tabular Task List</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Advanced filter panel, column sorting, and multi-select bulk operations.
        </p>
      </div>

      {/* Advanced Filter Panel */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-150 bg-white p-4 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-slate-850">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-850 dark:text-gray-200">
            <SlidersHorizontal className="h-4 w-4 text-blue-600" />
            <span>Task Database Filter Control</span>
          </div>
          {isAnyFilterActive && (
            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold text-red-600 hover:text-red-800 dark:text-red-400 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Project Filter */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">
              Project
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

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300"
            >
              <option value="all">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Done">Done</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">
              Priority
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
              Assignee
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

          {/* Search Box */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">
              Keyword
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
                className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-xs outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-gray-150"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bulk Actions Panel */}
      {selectedTaskIds.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-blue-50 border border-blue-200 p-4 dark:bg-blue-950/25 dark:border-blue-900 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
            <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">
              {selectedTaskIds.length} {selectedTaskIds.length === 1 ? 'task' : 'tasks'} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkComplete}
              className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-green-750 transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              Mark Completed
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-750 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedTaskIds([])}
              className="rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Main Table View */}
      <div className="rounded-xl border border-gray-150 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="text-xs uppercase bg-gray-50 text-gray-700 dark:bg-slate-800 dark:text-gray-300">
              <tr>
                <th scope="col" className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={sortedTasks.length > 0 && selectedTaskIds.length === sortedTasks.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </th>
                <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-750" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-1">
                    <span>Task Name</span>
                    <ArrowUpDown className="h-3 w-3 text-gray-400" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-750" onClick={() => handleSort('project')}>
                  <div className="flex items-center gap-1">
                    <span>Project</span>
                    <ArrowUpDown className="h-3 w-3 text-gray-400" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-750" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="h-3 w-3 text-gray-400" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-750" onClick={() => handleSort('priority')}>
                  <div className="flex items-center gap-1">
                    <span>Priority</span>
                    <ArrowUpDown className="h-3 w-3 text-gray-400" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-750" onClick={() => handleSort('dueDate')}>
                  <div className="flex items-center gap-1">
                    <span>Due Date</span>
                    <ArrowUpDown className="h-3 w-3 text-gray-400" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-4">Assignee</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {sortedTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="h-10 w-10 text-gray-350 dark:text-gray-650 mb-3" />
                      <h4 className="text-base font-semibold text-gray-800 dark:text-gray-250">No tasks in database</h4>
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 max-w-xs">
                        No tasks match your filter setup. Adjust your dropdown selections or clear keyword parameters to start over.
                      </p>
                      <button
                        onClick={clearAllFilters}
                        className="mt-3 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Clear Search & Filter Settings
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedTasks.map((task) => {
                  const project = projects.find(p => p.id === task.projectId);
                  const assignee = teamMembers.find(m => m.id === task.assigneeId);
                  const isChecked = selectedTaskIds.includes(task.id);

                  return (
                    <tr 
                      key={task.id} 
                      className={`hover:bg-gray-55/30 transition-colors dark:hover:bg-slate-800/25 ${isChecked ? 'bg-blue-50/10 dark:bg-blue-950/10' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectTask(task.id, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                        />
                      </td>

                      {/* Title */}
                      <td className="px-6 py-4.5 font-medium text-gray-900 dark:text-white">
                        <button
                          onClick={() => onTaskClick(task)}
                          className="text-left font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 outline-none hover:underline"
                        >
                          {task.title}
                        </button>
                        {task.labels && task.labels.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {task.labels.map((l, i) => (
                              <span key={i} className="rounded bg-gray-100 px-1 py-0.5 text-[9px] text-gray-500 dark:bg-slate-800 dark:text-gray-400">
                                {l}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Project */}
                      <td className="px-6 py-4.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                        {project?.name || 'Unknown Project'}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>

                      {/* Due date */}
                      <td className="px-6 py-4.5">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {task.dueDate}
                        </span>
                      </td>

                      {/* Assignee */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={assignee?.avatar}
                            alt={assignee?.name}
                            className="h-6 w-6 rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(assignee?.name || '')}`;
                            }}
                          />
                          <span className="text-xs text-gray-700 dark:text-gray-300">{assignee?.name}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4.5 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => onTaskClick(task)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this task?')) {
                                onDeleteTask(task.id);
                              }
                            }}
                            className="text-xs font-bold text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
