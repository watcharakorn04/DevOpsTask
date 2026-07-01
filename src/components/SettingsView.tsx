import React, { useState } from 'react';
import { User } from '../types';
import { UserCheck, Shield, Laptop, BellRing, ToggleLeft, ToggleRight, Sparkles, Check } from 'lucide-react';

interface SettingsViewProps {
  currentUser: User;
  isCompact: boolean;
  setIsCompact: (compact: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (darkMode: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  onUpdateUser: (updatedUser: User) => void;
}

export default function SettingsView({
  currentUser,
  isCompact,
  setIsCompact,
  isDarkMode,
  setIsDarkMode,
  notificationsEnabled,
  setNotificationsEnabled,
  onUpdateUser,
}: SettingsViewProps) {
  // Form profile edits
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState('sarah.johnson@taskflow.dev');
  const [role, setRole] = useState(currentUser.role || 'Project Manager');
  const [avatar, setAvatar] = useState(currentUser.avatar);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorText('Name is required.');
      return;
    }
    setErrorText('');
    onUpdateUser({
      id: currentUser.id,
      name: name.trim(),
      avatar: avatar.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
      role: role.trim(),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl">
      {/* Settings Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Settings & Customization</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Personalize your team profile account and local UI application variables.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Left column navigation or categories (styled sidebar) */}
        <div className="md:col-span-1 flex flex-col gap-3">
          <div className="rounded-xl border border-gray-150 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Settings Directory</h3>
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-2.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <UserCheck className="h-4 w-4" />
                Profile Settings
              </span>
              <span className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
                <Laptop className="h-4 w-4 text-gray-400" />
                UI Appearance
              </span>
              <span className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
                <BellRing className="h-4 w-4 text-gray-400" />
                Notification Setup
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/20 p-4 dark:border-blue-900/30 dark:bg-blue-950/15">
            <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
              <Sparkles className="h-4 w-4" />
              Developer Preview
            </span>
            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 leading-normal">
              State is currently persisted inside your browser's local cache. Clearing browser data will reset all custom-created cards.
            </p>
          </div>
        </div>

        {/* Right column main inputs form fields */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Section 1: Personal User Profile */}
          <div className="rounded-xl border border-gray-150 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold text-gray-900 dark:text-white border-b border-gray-100 pb-3 dark:border-slate-850">
              Personal Profile Section
            </h3>

            <form onSubmit={handleSaveProfile} className="mt-4 flex flex-col gap-4">
              
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <img
                  src={avatar}
                  alt={name}
                  className="h-16 w-16 rounded-full object-cover ring-4 ring-blue-50 dark:ring-slate-850"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
                  }}
                />
                
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">
                    Avatar Image URL
                  </label>
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://unsplash.com/..."
                    className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:bg-slate-800 dark:text-gray-100 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:bg-slate-800 dark:text-gray-150 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:bg-slate-800 dark:text-gray-150 dark:border-slate-700"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">
                    Corporate Role Job Title
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:bg-slate-800 dark:text-gray-150 dark:border-slate-700"
                  />
                </div>
              </div>

              {errorText && (
                <p className="text-xs text-red-500 font-semibold">{errorText}</p>
              )}

              <div className="flex items-center justify-end gap-3 mt-2">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-xs text-green-600 font-semibold animate-fade-in">
                    <Check className="h-4 w-4" /> Profile saved successfully!
                  </span>
                )}
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
                >
                  Save Profile Info
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: UI Preference Controls */}
          <div className="rounded-xl border border-gray-150 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold text-gray-900 dark:text-white border-b border-gray-100 pb-3 dark:border-slate-850">
              UI Display & Notification Preferences
            </h3>

            <div className="mt-4 flex flex-col gap-4">
              
              {/* Dark mode Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-semibold text-gray-850 dark:text-gray-200">Dark Visual Theme</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Enable high-contrast eye-safe dark slate interface layouts.</span>
                </div>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none"
                >
                  {isDarkMode ? (
                    <ToggleRight className="h-10 w-10 text-blue-600 cursor-pointer" />
                  ) : (
                    <ToggleLeft className="h-10 w-10 cursor-pointer" />
                  )}
                </button>
              </div>

              {/* Compact mode Toggle */}
              <div className="flex items-center justify-between border-t border-gray-50 pt-4 dark:border-slate-850">
                <div>
                  <span className="block text-sm font-semibold text-gray-850 dark:text-gray-200">Compact Table Layout</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Reduce margin whitespace padding in tabular database sheets.</span>
                </div>
                <button
                  onClick={() => setIsCompact(!isCompact)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none"
                >
                  {isCompact ? (
                    <ToggleRight className="h-10 w-10 text-blue-600 cursor-pointer" />
                  ) : (
                    <ToggleLeft className="h-10 w-10 cursor-pointer" />
                  )}
                </button>
              </div>

              {/* Notifications Toggle */}
              <div className="flex items-center justify-between border-t border-gray-50 pt-4 dark:border-slate-850">
                <div>
                  <span className="block text-sm font-semibold text-gray-850 dark:text-gray-200">Mock Notifications Ring</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Show floating alerts and unread counts inside application headers.</span>
                </div>
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none"
                >
                  {notificationsEnabled ? (
                    <ToggleRight className="h-10 w-10 text-blue-600 cursor-pointer" />
                  ) : (
                    <ToggleLeft className="h-10 w-10 cursor-pointer" />
                  )}
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
