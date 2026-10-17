import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Folder, ChevronDown, Bell, User } from 'lucide-react';

interface TopBarProps {
  dark?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ dark = false }) => {
  const location = useLocation();

  const navLinks = [
    { path: '/agent', label: 'Agent & Graph' },
    { path: '/overview', label: 'Overview' },
    { path: '/upload', label: 'Document Upload' },
    { path: '/checklist', label: 'Checklist' },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-40 transition-colors shadow-sm ${
        dark
          ? 'bg-[#18181B]/95 text-slate-100 border-b border-zinc-800'
          : 'bg-[#FFFFFF]/90 text-[#1E293B] border-b border-slate-200 backdrop-blur-xl'
      }`}
    >
      <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand & Estate Selector */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            to="/agent"
            className={`text-2xl font-bold tracking-wider font-serif ${
              dark ? 'text-[#D97706]' : 'text-[#0D9488]'
            }`}
          >
            WAARIS
          </Link>

          <div
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-semibold border ${
              dark
                ? 'bg-zinc-800/80 text-zinc-200 border-zinc-700'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Folder className={`w-5 h-5 ${dark ? 'text-[#D97706]' : 'text-[#0D9488]'}`} />
            <span className="truncate max-w-[140px] sm:max-w-[240px]">
              Late Shri R.K. Verma Estate
            </span>
            <ChevronDown className="w-4 h-4 opacity-70" />
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive =
              location.pathname === link.path ||
              (link.path === '/agent' && location.pathname === '/');

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 text-[16px] font-medium rounded-xl transition-all ${
                  isActive
                    ? dark
                      ? 'bg-[#D97706] text-white shadow-sm font-semibold'
                      : 'bg-teal-50 text-[#0D9488] font-semibold border border-teal-200 shadow-sm'
                    : dark
                    ? 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                    : 'text-slate-600 hover:text-[#1E293B] hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Readiness Metric, Notifications & Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Circular Readiness Gauge */}
          <div
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border ${
              dark
                ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                : 'bg-slate-100 border-slate-200 text-[#1E293B]'
            }`}
          >
            <div className="relative w-6 h-6 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className={dark ? 'text-zinc-700' : 'text-slate-300'}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className={dark ? 'text-[#D97706]' : 'text-[#0D9488]'}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="62, 100"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
            </div>
            <span className="text-[15px] sm:text-[16px] font-semibold whitespace-nowrap">
              62% Readiness
            </span>
          </div>

          {/* Notifications */}
          <button
            title="Notifications"
            className={`relative p-2 rounded-xl transition-colors ${
              dark
                ? 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                : 'text-slate-600 hover:text-[#1E293B] hover:bg-slate-100'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span
              className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ring-2 ${
                dark ? 'bg-[#D97706] ring-zinc-900' : 'bg-[#0D9488] ring-white'
              }`}
            />
          </button>

          {/* User Profile */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center border font-semibold ${
              dark
                ? 'bg-zinc-800 text-[#D97706] border-zinc-700'
                : 'bg-teal-50 text-[#0D9488] border-teal-200'
            }`}
          >
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer Row */}
      <div
        className={`lg:hidden flex items-center justify-around py-2 border-t px-2 text-sm overflow-x-auto ${
          dark ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-white'
        }`}
      >
        {navLinks.map((link) => {
          const isActive =
            location.pathname === link.path ||
            (link.path === '/agent' && location.pathname === '/');
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium text-xs sm:text-sm ${
                isActive
                  ? dark
                    ? 'bg-[#D97706] text-white font-semibold'
                    : 'bg-teal-50 text-[#0D9488] font-semibold'
                  : dark
                  ? 'text-zinc-400'
                  : 'text-slate-600'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
};
