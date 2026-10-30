import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, ChevronDown, Sparkles, Building2, ShieldCheck, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  breadcrumbs?: string[];
}

export function Navbar({ breadcrumbs = ['Enterprise Suite', 'Command Center'] }: NavbarProps) {
  const { user, logout, quickLoginAs } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-16 px-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between gap-8 shrink-0 sticky top-0 z-40">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-4 whitespace-nowrap shrink-0">
        <Link to="/dashboard" className="flex items-center gap-2.5 text-slate-100 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
            Nexus-AI
          </span>
        </Link>

        <span className="text-slate-700 hidden sm:inline" aria-hidden="true">/</span>

        {/* Breadcrumb Context */}
        <nav className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb}>
              <span className={idx === breadcrumbs.length - 1 ? 'text-slate-200' : 'text-slate-400'}>
                {crumb}
              </span>
              {idx < breadcrumbs.length - 1 && <span className="text-slate-700">/</span>}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Zone 2: Enterprise Telemetry (Unboxed text with typographic separators) */}
      <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
        <span className="text-slate-300 font-medium">Autonomous Core Active</span>
        <span aria-hidden="true">·</span>
        <span className="font-mono tabular-nums text-indigo-400">99.4% SLA</span>
        <span aria-hidden="true">·</span>
        <span className="text-slate-400">{user?.department || 'Operations'} Department</span>
      </div>

      {/* Zone 3: User Profile & Quick Clearance Switcher */}
      <div className="flex items-center gap-3 shrink-0 relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-200 text-xs transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-[11px] uppercase">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="text-left hidden sm:block">
            <div className="font-medium text-slate-200 leading-none">{user?.name}</div>
            <div className="text-[10px] text-slate-400 font-mono capitalize mt-0.5">
              {user?.role} · {user?.department}
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-12 w-64 rounded-xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/50 p-2 z-50 text-xs">
            <div className="px-3 py-2 border-b border-slate-800">
              <div className="font-semibold text-slate-200">{user?.name}</div>
              <div className="text-slate-400 truncate">{user?.email}</div>
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-300 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span className="capitalize">{user?.role} Clearance</span>
              </div>
            </div>

            <div className="py-1">
              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Switch Role Clearance (Demo)
              </div>
              <button
                onClick={() => {
                  quickLoginAs('admin');
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-md hover:bg-slate-800 flex items-center justify-between text-slate-300 hover:text-white"
              >
                <span>Admin Clearance</span>
                <span className="text-[10px] font-mono text-slate-500">Executive</span>
              </button>
              <button
                onClick={() => {
                  quickLoginAs('finance_manager');
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-md hover:bg-slate-800 flex items-center justify-between text-slate-300 hover:text-white"
              >
                <span>Manager Clearance</span>
                <span className="text-[10px] font-mono text-slate-500">Finance</span>
              </button>
              <button
                onClick={() => {
                  quickLoginAs('sales_employee');
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-md hover:bg-slate-800 flex items-center justify-between text-slate-300 hover:text-white"
              >
                <span>Employee Clearance</span>
                <span className="text-[10px] font-mono text-slate-500">Sales</span>
              </button>
            </div>

            <div className="pt-1 border-t border-slate-800">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-1.5 rounded-md hover:bg-rose-500/10 text-rose-400 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
