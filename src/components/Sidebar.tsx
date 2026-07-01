import React from 'react';
import { LayoutDashboard, FolderKanban, Briefcase, Columns4, ListTodo, Settings, ChevronLeft, ChevronRight, Activity } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({
  currentView,
  onNavigate,
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'mywork', label: 'My Work', icon: Briefcase },
    { id: 'board', label: 'Board View', icon: Columns4 },
    { id: 'list', label: 'List View', icon: ListTodo },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative flex h-screen flex-col border-r border-gray-200 bg-white text-gray-800 transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 dark:text-gray-100 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Logo Container */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              TaskFlow
            </span>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="hidden lg:flex rounded-md p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-gray-200"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 space-y-1.5 p-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-55 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-100'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Expand trigger when collapsed */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="absolute bottom-4 right-1/2 translate-x-1/2 rounded-full border border-gray-200 bg-white p-1.5 text-gray-400 shadow-sm hover:bg-gray-50 hover:text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
          title="Expand Sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Mini Profile Footer */}
      {!isCollapsed && (
        <div className="border-t border-gray-150 p-4 dark:border-slate-800">
          <div className="rounded-lg bg-gray-55 p-3 text-center dark:bg-slate-800/40">
            <span className="block text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold">
              Current Environment
            </span>
            <span className="mt-0.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Client Prototype
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
