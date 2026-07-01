import React, { useState } from 'react';
import { Search, Bell, Settings, LogOut, CheckCircle2, AlertCircle, Sun, Moon } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  notificationsEnabled: boolean;
  isDarkMode?: boolean;
  setIsDarkMode?: (dark: boolean) => void;
}

export default function Header({
  currentUser,
  searchQuery,
  setSearchQuery,
  onNavigate,
  onLogout,
  notificationsEnabled,
  isDarkMode = false,
  setIsDarkMode,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const mockNotifications = [
    { id: 'n1', text: 'Emily Carter commented on "QA testing"', time: '10m ago', unread: true },
    { id: 'n2', text: 'David Chen updated "Design homepage" status to In Progress', time: '1h ago', unread: true },
    { id: 'n3', text: 'Sarah Johnson assigned "Implement navigation" to you', time: '4h ago', unread: false },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
      {/* Search Bar */}
      <div className="flex flex-1 max-w-md items-center gap-2">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search tasks, projects, assignees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-55 py-2 pl-10 pr-10 text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100 dark:focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Right Navigation Controls */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-200"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {notificationsEnabled && mockNotifications.some(n => n.unread) && (
              <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-500" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-100 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-800">
              <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2 dark:border-slate-700">
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">Notifications</span>
                <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                  {notificationsEnabled ? 'Active' : 'Muted'}
                </span>
              </div>
              <div className="mt-1 divide-y divide-gray-50 dark:divide-slate-700/50">
                {mockNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex flex-col gap-1 p-3 transition-colors hover:bg-gray-55 dark:hover:bg-slate-700/30 ${
                      notif.unread ? 'bg-blue-50/30 dark:bg-blue-950/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {notif.id === 'n1' ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 text-blue-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        {notif.text}
                      </p>
                    </div>
                    <span className="pl-5 text-[10px] text-gray-400 dark:text-gray-500">{notif.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        {setIsDarkMode && (
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-200"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-amber-500" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        )}

        {/* Settings Button */}
        <button
          onClick={() => onNavigate('settings')}
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-200"
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 border-l border-gray-100 pl-4 dark:border-slate-800">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-100 dark:ring-slate-800"
            onError={(e) => {
              // Fallback for image error
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`;
            }}
          />
          <div className="hidden md:flex flex-col">
            <span className="text-xs font-semibold text-gray-900 dark:text-gray-150">{currentUser.name}</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">{currentUser.role || 'Teammate'}</span>
          </div>
          <button
            onClick={onLogout}
            className="rounded p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
