import React, { useState } from 'react';
import { Activity, Mail, Lock, Sparkles, Users, ArrowRight } from 'lucide-react';
import { User } from '../types';
import { INITIAL_TEAM_MEMBERS } from '../mockData';

interface LoginViewProps {
  onLoginSuccess: (user?: User) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('sarah.johnson@taskflow.dev');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorText, setErrorText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDemoUser, setSelectedDemoUser] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!email.trim()) {
      setErrorText('Email address is required.');
      return;
    }

    if (!password) {
      setErrorText('Password is required.');
      return;
    }

    // Basic email structure validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorText('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    // Simulate minor network delay for luxury loading states
    setTimeout(() => {
      setLoading(false);
      // Find matching user from team members
      const cleanEmail = email.toLowerCase().trim();
      const matchedUser = INITIAL_TEAM_MEMBERS.find(member => {
        const generatedEmail = member.name.toLowerCase().replace(/\s+/g, '.') + '@taskflow.dev';
        return generatedEmail === cleanEmail || (member.id === 'u1' && cleanEmail === 'sarah.johnson@taskflow.dev');
      });

      onLoginSuccess(matchedUser);
    }, 800);
  };

  const handleQuickLogin = (user: User) => {
    setSelectedDemoUser(user.id);
    setLoading(true);
    
    // Auto fill credentials so the form matches the selection
    const formattedEmail = user.name.toLowerCase().replace(/\s+/g, '.') + '@taskflow.dev';
    setEmail(formattedEmail);
    setPassword('password123');

    setTimeout(() => {
      setLoading(false);
      setSelectedDemoUser(null);
      onLoginSuccess(user);
    }, 600);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
      {/* Centered Premium Login Container */}
      <div className="w-full max-w-lg rounded-2xl border border-gray-150 bg-white p-6 md:p-8 shadow-2xl dark:border-slate-900/80 dark:bg-slate-900/70 backdrop-blur-md flex flex-col space-y-6">
        
        {/* Branding & Welcome - Centered */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/20">
            <Activity className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="mt-4 text-2xl md:text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white">
            TaskFlow Workspace
          </h2>
          <p className="mt-2 text-xs md:text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            Team task management and priority backlog boards for agile engineering squads.
          </p>
        </div>

        {/* Form Container */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3.5">
            {/* Email field */}
            <div>
              <label htmlFor="email-address" className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. sarah.johnson@taskflow.dev"
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Remember me & Options */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-slate-800"
              />
              <label htmlFor="remember-me" className="ml-2 block font-medium text-gray-600 dark:text-gray-400">
                Remember Me
              </label>
            </div>

            <div>
              <span className="cursor-pointer font-semibold text-blue-600 hover:underline dark:text-blue-400">
                Forgot password?
              </span>
            </div>
          </div>

          {/* Validation error feedback */}
          {errorText && (
            <div className="rounded-xl bg-red-50 border border-red-150 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/25 dark:border-red-900 dark:text-red-400">
              {errorText}
            </div>
          )}

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center items-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-colors focus:outline-none disabled:opacity-50 cursor-pointer"
            >
              {loading && !selectedDemoUser ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Sign In to Workspace'
              )}
            </button>
          </div>
        </form>

        {/* Divider / Separator */}
        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-gray-150 dark:border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            OR QUICK ACCESS WITH DEMO ACCOUNTS
          </span>
          <div className="flex-grow border-t border-gray-150 dark:border-slate-800"></div>
        </div>

        {/* Centered Quick Access Accounts */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {INITIAL_TEAM_MEMBERS.map((member) => {
              const isSelected = selectedDemoUser === member.id;
              
              return (
                <div
                  key={member.id}
                  onClick={() => !loading && handleQuickLogin(member)}
                  className={`group relative flex items-center justify-between rounded-xl border p-2.5 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-500 dark:border-blue-500 dark:bg-blue-950/20'
                      : 'border-gray-150 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/10 hover:shadow-sm dark:border-slate-800/80 dark:bg-slate-900/30 dark:hover:border-blue-800 dark:hover:bg-blue-950/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-100 dark:ring-slate-800 group-hover:ring-blue-200 dark:group-hover:ring-blue-900 transition-all"
                    />
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {member.name}
                      </h4>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400">
                        {member.role || 'Team Member'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center pr-1">
                    {isSelected ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    ) : (
                      <ArrowRight className="h-3 w-3 text-gray-400 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sandbox Info */}
          <div className="rounded-xl bg-blue-50/20 border border-blue-100/30 p-3 dark:bg-blue-950/10 dark:border-blue-900/20 text-center">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400">
              <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
              Evaluation Sandbox Workspace
            </span>
            <p className="mt-1 text-[10px] leading-relaxed text-gray-500 dark:text-gray-400 px-1">
              Sarah has PM rights, David is a Dev, Emily is a UX designer, and James is a QA engineer. The workspace controls will adapt based on the selected identity.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
