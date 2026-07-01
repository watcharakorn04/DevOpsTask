import React from 'react';
import { Project, Task, User } from '../types';
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  ListTodo, 
  Calendar, 
  UserPlus, 
  ArrowUpRight 
} from 'lucide-react';

interface DashboardViewProps {
  projects: Project[];
  tasks: Task[];
  teamMembers: User[];
  onNavigate: (view: string) => void;
  onTaskClick: (task: Task) => void;
  onCreateTaskClick: () => void;
  onCreateProjectClick: () => void;
}

export default function DashboardView({
  projects,
  tasks,
  teamMembers,
  onNavigate,
  onTaskClick,
  onCreateTaskClick,
  onCreateProjectClick,
}: DashboardViewProps) {
  // Compute Stats
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const reviewTasks = tasks.filter(t => t.status === 'Review').length;
  const todoTasks = tasks.filter(t => t.status === 'To Do').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Upcoming deadlines (sorted by due date, incomplete only)
  const upcomingTasks = [...tasks]
    .filter(t => t.status !== 'Done')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  // Recent Activity Feed
  const recentActivities = [
    { id: 'act1', user: 'Sarah Johnson', text: 'created task "Design homepage"', time: '10m ago', target: 'Website Redesign' },
    { id: 'act2', user: 'David Chen', text: 'moved "Implement navigation" to "In Progress"', time: '42m ago', target: 'Website Redesign' },
    { id: 'act3', user: 'Emily Carter', text: 'added comment to "QA testing"', time: '2h ago', target: 'Mobile App' },
    { id: 'act4', user: 'James Wilson', text: 'marked "Set up development environments" as complete', time: '1d ago', target: 'Mobile App' },
  ];

  const getPriorityBadgeColor = (priority: string) => {
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

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Welcome Heading */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome back, Sarah
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Here is what is happening with your projects today.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2 md:mt-0">
          <button
            onClick={onCreateProjectClick}
            className="flex items-center gap-2 rounded-lg bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 hover:text-gray-900 transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-700"
          >
            <FolderKanban className="h-4 w-4" />
            New Project
          </button>
          <button
            onClick={onCreateTaskClick}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Task
          </button>
        </div>
      </div>

      {/* Grid of Summary Stats */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Projects */}
        <div className="rounded-xl border border-gray-150 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Projects</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <FolderKanban className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalProjects}</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Multi-departmental teams
            </p>
          </div>
        </div>

        {/* Completed Tasks Rate */}
        <div className="rounded-xl border border-gray-150 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Task Completion Rate</span>
            <div className="rounded-lg bg-green-50 p-2 text-green-600 dark:bg-green-950/50 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{completionRate}%</h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({completedTasks} / {totalTasks} tasks)
              </span>
            </div>
            {/* Horizontal progress meter */}
            <div className="mt-2.5 h-1.5 w-full rounded-full bg-gray-100 dark:bg-slate-800">
              <div 
                className="h-1.5 rounded-full bg-green-500 transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* In Progress Tasks */}
        <div className="rounded-xl border border-gray-150 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Progress</span>
            <div className="rounded-lg bg-yellow-50 p-2 text-yellow-600 dark:bg-yellow-950/50 dark:text-yellow-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{inProgressTasks}</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Currently actively building
            </p>
          </div>
        </div>

        {/* Needs Attention / In Review */}
        <div className="rounded-xl border border-gray-150 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Under Review</span>
            <div className="rounded-lg bg-orange-50 p-2 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{reviewTasks}</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Awaiting manager feedback
            </p>
          </div>
        </div>
      </div>

      {/* Main Core Columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Project Progress Cards */}
        <div className="flex flex-col gap-4 rounded-xl border border-gray-150 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-slate-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">Project Milestones</h2>
            <button 
              onClick={() => onNavigate('projects')}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              All Projects <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((project) => {
              const projectTasks = tasks.filter(t => t.projectId === project.id);
              const doneTasks = projectTasks.filter(t => t.status === 'Done').length;
              const calcProgress = projectTasks.length > 0 ? Math.round((doneTasks / projectTasks.length) * 100) : 0;

              return (
                <div 
                  key={project.id}
                  className="rounded-lg border border-gray-100 p-4 hover:shadow-xs transition-shadow dark:border-slate-800 bg-gray-55/30 dark:bg-slate-800/25"
                >
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500">Project</span>
                  <h4 className="font-bold text-gray-900 dark:text-white">{project.name}</h4>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{project.description}</p>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      <span>Tasks Complete</span>
                      <span>{calcProgress}% ({doneTasks}/{projectTasks.length})</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-slate-700">
                      <div 
                        className="h-1.5 rounded-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${calcProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Activity Widget */}
        <div className="flex flex-col gap-4 rounded-xl border border-gray-150 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-gray-100 pb-3 dark:border-slate-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">Team Activity Feed</h2>
          </div>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
            {recentActivities.map((act) => {
              const member = teamMembers.find(m => m.name === act.user);
              return (
                <div key={act.id} className="flex gap-3">
                  <img
                    src={member?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'}
                    alt={act.user}
                    className="h-8 w-8 rounded-full object-cover mt-0.5"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(act.user)}`;
                    }}
                  />
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      <span className="font-semibold text-gray-900 dark:text-white">{act.user}</span>{' '}
                      {act.text}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] rounded-sm bg-gray-100 px-1 py-0.5 text-gray-500 dark:bg-slate-800 dark:text-gray-400">
                        {act.target}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">&bull; {act.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Secondary Bottom Section: Upcoming Deadlines & Task Quick Summary */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Deadlines (List) */}
        <div className="flex flex-col gap-4 rounded-xl border border-gray-150 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-slate-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">Upcoming Project Deadlines</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => onNavigate('board')}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              >
                Board View
              </button>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <button 
                onClick={() => onNavigate('list')}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              >
                List View
              </button>
            </div>
          </div>

          {upcomingTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Calendar className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No upcoming tasks due!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="text-xs uppercase bg-gray-50 text-gray-700 dark:bg-slate-800 dark:text-gray-300">
                  <tr>
                    <th scope="col" className="px-4 py-3">Task Name</th>
                    <th scope="col" className="px-4 py-3">Project</th>
                    <th scope="col" className="px-4 py-3">Due Date</th>
                    <th scope="col" className="px-4 py-3">Priority</th>
                    <th scope="col" className="px-4 py-3">Assignee</th>
                    <th scope="col" className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {upcomingTasks.map((task) => {
                    const project = projects.find(p => p.id === task.projectId);
                    const assignee = teamMembers.find(m => m.id === task.assigneeId);
                    return (
                      <tr key={task.id} className="hover:bg-gray-55/40 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-3.5 font-medium text-gray-900 dark:text-white">
                          <button 
                            onClick={() => onTaskClick(task)}
                            className="text-left font-semibold hover:text-blue-600 dark:hover:text-blue-400 outline-none"
                          >
                            {task.title}
                          </button>
                        </td>
                        <td className="px-4 py-3.5">{project?.name || 'Unknown Project'}</td>
                        <td className="px-4 py-3.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            {task.dueDate}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold border ${getPriorityBadgeColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
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
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => onTaskClick(task)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
