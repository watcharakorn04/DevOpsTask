import React, { useState, useEffect } from 'react';
import { Task, Project, User, Comment, TaskStatus, TaskPriority } from '../types';
import { 
  X, 
  Calendar, 
  MessageSquare, 
  Tag, 
  UserPlus, 
  Folder, 
  AlertOctagon, 
  Clock, 
  Plus,
  Send,
  AlertCircle
} from 'lucide-react';

interface TaskModalProps {
  task?: Task; // If provided, we are viewing/editing. If undefined, we are creating.
  initialStatus?: TaskStatus;
  projects: Project[];
  teamMembers: User[];
  currentUser: User;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'comments'>) => void;
  onDelete?: (taskId: string) => void;
  onAddComment?: (taskId: string, message: string) => void;
}

export default function TaskModal({
  task,
  initialStatus,
  projects,
  teamMembers,
  currentUser,
  onClose,
  onSave,
  onDelete,
  onAddComment,
}: TaskModalProps) {
  const isCreateMode = !task;
  const [isEditing, setIsEditing] = useState(isCreateMode);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [labels, setLabels] = useState<string[]>([]);

  // Comment state
  const [newComment, setNewComment] = useState('');

  // Validation Errors
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    dueDate?: string;
    project?: string;
    assignee?: string;
  }>({});

  // Character counters
  const maxTitleLength = 100;
  const maxDescLength = 1000;
  const maxCommentLength = 300;

  // Initialize form with task details if in view/edit mode
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setProjectId(task.projectId);
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate);
      setAssigneeId(task.assigneeId);
      setLabels(task.labels || []);
      setIsEditing(false);
    } else {
      // Create mode
      setTitle('');
      setDescription('');
      setProjectId(projects[0]?.id || '');
      setStatus(initialStatus || 'To Do');
      setPriority('Medium');
      // Pre-fill next week's date as comfortable default
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setDueDate(nextWeek.toISOString().split('T')[0]);
      setAssigneeId(teamMembers[0]?.id || '');
      setLabels([]);
      setIsEditing(true);
    }
    setErrors({});
  }, [task, initialStatus]);

  // Real-time client-side validation
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = 'Task title is required.';
      isValid = false;
    } else if (title.length > maxTitleLength) {
      newErrors.title = `Title cannot exceed ${maxTitleLength} characters.`;
      isValid = false;
    }

    if (description.length > maxDescLength) {
      newErrors.description = `Description cannot exceed ${maxDescLength} characters.`;
      isValid = false;
    }

    if (!dueDate) {
      newErrors.dueDate = 'Due date is required.';
      isValid = false;
    } else {
      const dateVal = new Date(dueDate);
      if (isNaN(dateVal.getTime())) {
        newErrors.dueDate = 'Please enter a valid date.';
        isValid = false;
      }
    }

    if (!projectId) {
      newErrors.project = 'Please choose a project.';
      isValid = false;
    }

    if (!assigneeId) {
      newErrors.assignee = 'Please select an assignee.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSave({
      id: task?.id || `t_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      projectId,
      status,
      priority,
      dueDate,
      assigneeId,
      labels,
    });

    if (isCreateMode) {
      onClose();
    } else {
      setIsEditing(false);
    }
  };

  const handleAddLabel = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && labelInput.trim()) {
      e.preventDefault();
      const cleanedLabel = labelInput.trim();
      if (!labels.includes(cleanedLabel)) {
        setLabels([...labels, cleanedLabel]);
      }
      setLabelInput('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter(l => l !== labelToRemove));
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !task || !onAddComment) return;
    onAddComment(task.id, newComment.trim());
    setNewComment('');
  };

  const getPriorityBadgeColor = (p: TaskPriority) => {
    switch (p) {
      case 'Low': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900';
      case 'Medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-900';
      case 'High': return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900';
      case 'Critical': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900';
    }
  };

  // Find linked models
  const linkedProject = projects.find(p => p.id === projectId);
  const linkedAssignee = teamMembers.find(m => m.id === assigneeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/45 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative flex flex-col w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-gray-100 dark:border-slate-800 overflow-hidden">
        
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-blue-50 p-1.5 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Folder className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-gray-750 dark:text-gray-250">
              {isCreateMode ? 'Create New Workspace Task' : isEditing ? 'Edit Task Specifications' : 'Task Workspace Details'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Container Body */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {isEditing ? (
            /* ================= EDIT / CREATE FORM LAYOUT ================= */
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              
              {/* Task Title Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (e.target.value.trim() && e.target.value.length <= maxTitleLength) {
                      setErrors(prev => ({ ...prev, title: undefined }));
                    }
                  }}
                  placeholder="e.g., Deliver high-fidelity visual system assets"
                  className={`w-full rounded-lg border px-3.5 py-2 text-sm outline-none transition-all dark:bg-slate-800 dark:text-gray-100 ${
                    errors.title ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700'
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.title ? (
                    <p className="text-xs text-red-500 font-semibold">{errors.title}</p>
                  ) : (
                    <span className="text-[10px] text-gray-400">Required</span>
                  )}
                  <span className="text-[10px] text-gray-400 font-mono">{title.length}/{maxTitleLength}</span>
                </div>
              </div>

              {/* Grid selectors */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Project Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">
                    Project Board <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => {
                      setProjectId(e.target.value);
                      if (e.target.value) setErrors(prev => ({ ...prev, project: undefined }));
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none bg-white transition-all dark:bg-slate-800 dark:text-gray-150 dark:border-slate-700`}
                  >
                    <option value="">Select Target Project...</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {errors.project && (
                    <p className="mt-1 text-xs text-red-500 font-semibold">{errors.project}</p>
                  )}
                </div>

                {/* Assignee Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">
                    Teammate Assignee <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={assigneeId}
                    onChange={(e) => {
                      setAssigneeId(e.target.value);
                      if (e.target.value) setErrors(prev => ({ ...prev, assignee: undefined }));
                    }}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none bg-white transition-all dark:bg-slate-800 dark:text-gray-150 dark:border-slate-700"
                  >
                    <option value="">Select Team Member...</option>
                    {teamMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                  {errors.assignee && (
                    <p className="mt-1 text-xs text-red-500 font-semibold">{errors.assignee}</p>
                  )}
                </div>

                {/* Status Column Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">
                    Pipeline Column
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none bg-white transition-all dark:bg-slate-800 dark:text-gray-150 dark:border-slate-700"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                {/* Priority Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">
                    Risk Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none bg-white transition-all dark:bg-slate-800 dark:text-gray-150 dark:border-slate-700"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                {/* Due Date Picker */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">
                    Due Date Target <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => {
                        setDueDate(e.target.value);
                        if (e.target.value) setErrors(prev => ({ ...prev, dueDate: undefined }));
                      }}
                      className={`w-full rounded-lg border py-2 pl-10 pr-4 text-sm outline-none bg-white transition-all dark:bg-slate-800 dark:text-gray-100 ${
                        errors.dueDate ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700'
                      }`}
                    />
                  </div>
                  {errors.dueDate && (
                    <p className="mt-1 text-xs text-red-500 font-semibold">{errors.dueDate}</p>
                  )}
                </div>
              </div>

              {/* Description Details textarea */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">
                  Task Specifications Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (e.target.value.length <= maxDescLength) {
                      setErrors(prev => ({ ...prev, description: undefined }));
                    }
                  }}
                  placeholder="Provide technical outlines, acceptance criteria, Figma layouts details, etc..."
                  className={`w-full rounded-lg border px-3.5 py-2 text-sm outline-none transition-all dark:bg-slate-800 dark:text-gray-100 ${
                    errors.description ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700'
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description ? (
                    <p className="text-xs text-red-500 font-semibold">{errors.description}</p>
                  ) : (
                    <span className="text-[10px] text-gray-400">Optional</span>
                  )}
                  <span className="text-[10px] text-gray-400 font-mono">{description.length}/{maxDescLength}</span>
                </div>
              </div>

              {/* Labels tag system */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">
                  Metadata Labels
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-55/30 dark:bg-slate-900">
                  {labels.map((lbl, i) => (
                    <span 
                      key={i} 
                      className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                    >
                      {lbl}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveLabel(lbl)}
                        className="text-blue-400 hover:text-blue-600"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    onKeyDown={handleAddLabel}
                    placeholder="Type label & hit Enter..."
                    className="flex-1 min-w-[120px] bg-transparent text-xs text-gray-800 outline-none dark:text-gray-100"
                  />
                </div>
                <p className="mt-1 text-[10px] text-gray-400">Press Enter after typing to add chips.</p>
              </div>

              {/* Saving actions */}
              <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-gray-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    if (isCreateMode) {
                      onClose();
                    } else {
                      setIsEditing(false);
                      // Restore field values from task state
                      setTitle(task.title);
                      setDescription(task.description);
                      setProjectId(task.projectId);
                      setStatus(task.status);
                      setPriority(task.priority);
                      setDueDate(task.dueDate);
                      setAssigneeId(task.assigneeId);
                      setLabels(task.labels || []);
                      setErrors({});
                    }
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  Save Task Details
                </button>
              </div>

            </form>
          ) : (
            /* ================= READ DETAILS VIEW LAYOUT ================= */
            <div className="flex flex-col gap-6">
              
              {/* Task Header info */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    Project: {linkedProject?.name}
                  </span>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold border ${getPriorityBadgeColor(priority)}`}>
                    Priority: {priority}
                  </span>
                  <span className="rounded bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-600 dark:bg-slate-800 dark:text-gray-350">
                    Status: {status}
                  </span>
                </div>

                <h2 className="mt-3.5 text-xl font-bold text-gray-900 dark:text-white leading-tight">
                  {title}
                </h2>
              </div>

              {/* Grid of properties */}
              <div className="grid gap-4 rounded-xl border border-gray-100 bg-gray-55/30 p-4 dark:border-slate-800 dark:bg-slate-800/25 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white p-2 text-gray-400 dark:bg-slate-800 shadow-xs">
                    <Calendar className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Target Due Date</span>
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{dueDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={linkedAssignee?.avatar}
                    alt={linkedAssignee?.name}
                    className="h-8.5 w-8.5 rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(linkedAssignee?.name || '')}`;
                    }}
                  />
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Assigned Developer</span>
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{linkedAssignee?.name}</span>
                  </div>
                </div>
              </div>

              {/* Task Description */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-1.5">Description Outline</h4>
                <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  {description ? (
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                      {description}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No description details provided for this issue.</p>
                  )}
                </div>
              </div>

              {/* Labels chips */}
              {labels.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-1.5">Category Labels</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {labels.map((lbl, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1 rounded bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-600 dark:bg-slate-800 dark:text-gray-450"
                      >
                        <Tag className="h-3 w-3" />
                        {lbl}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Unified Timeline & Comments Panel */}
              <div className="border-t border-gray-100 pt-5 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3.5">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <MessageSquare className="h-4.5 w-4.5 text-blue-600" />
                    <span>Collaboration Feed ({task?.comments?.length || 0})</span>
                  </h3>
                </div>

                {/* Comment Threads */}
                <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto mb-4 pr-1">
                  {(!task?.comments || task.comments.length === 0) ? (
                    <p className="text-xs text-gray-400 italic py-4 text-center">No comments logged yet. Start the conversation!</p>
                  ) : (
                    task.comments.map((comment) => {
                      const author = teamMembers.find(m => m.id === comment.authorId);
                      return (
                        <div 
                          key={comment.id}
                          className="flex gap-3 rounded-lg bg-gray-55/40 p-3 dark:bg-slate-800/35"
                        >
                          <img
                            src={author?.avatar}
                            alt={author?.name}
                            className="h-7 w-7 rounded-full object-cover mt-0.5"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(author?.name || '')}`;
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-900 dark:text-white">{author?.name || 'Teammate'}</span>
                              <span className="text-[10px] text-gray-400">{new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className="mt-1 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                              {comment.message}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Comment Posting Input */}
                {onAddComment && (
                  <form onSubmit={handlePostComment} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Write a message update on this task..."
                        value={newComment}
                        onChange={(e) => {
                          if (e.target.value.length <= maxCommentLength) {
                            setNewComment(e.target.value);
                          }
                        }}
                        className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-16 text-xs outline-none focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono">
                        {newComment.length}/{maxCommentLength}
                      </span>
                    </div>
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="rounded-lg bg-blue-600 px-3.5 py-2 text-white hover:bg-blue-700 transition-colors disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </form>
                )}
              </div>

              {/* View Action Commands Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-slate-800">
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this task permanently?')) {
                        onDelete(task!.id);
                        onClose();
                      }
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 hover:underline outline-none"
                  >
                    Delete Task
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300"
                  >
                    Edit Specifications
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                  >
                    Close Window
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
