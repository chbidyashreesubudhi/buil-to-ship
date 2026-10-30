import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  Workflow,
  FileText,
  BarChart3,
  ShieldAlert,
  Settings,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Sidebar() {
  const { user } = useAuth();

  const links = [
    {
      to: '/dashboard',
      label: 'Executive Overview',
      icon: LayoutDashboard,
      roles: ['admin', 'manager', 'employee'],
    },
    {
      to: '/copilot',
      label: 'AI Command Copilot',
      icon: Bot,
      roles: ['admin', 'manager', 'employee'],
    },
    {
      to: '/workflows',
      label: 'Automated Workflows',
      icon: Workflow,
      roles: ['admin', 'manager', 'employee'],
    },
    {
      to: '/documents',
      label: 'Document Intelligence',
      icon: FileText,
      roles: ['admin', 'manager', 'employee'],
    },
    {
      to: '/analytics',
      label: 'Operational Analytics',
      icon: BarChart3,
      roles: ['admin', 'manager', 'employee'],
    },
    {
      to: '/audit',
      label: 'Audit & Compliance',
      icon: ShieldAlert,
      roles: ['admin', 'manager'],
    },
    {
      to: '/settings',
      label: 'Enterprise Settings',
      icon: Settings,
      roles: ['admin', 'manager', 'employee'],
    },
  ];

  const visibleLinks = links.filter((l) => user && l.roles.includes(user.role));

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col shrink-0 select-none">
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Workspaces</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
            v2.6
          </span>
        </div>
      </div>

      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {visibleLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </NavLink>
          );
        })}
      </nav>

      {/* Tenant & RLS Status indicator */}
      <div className="p-3 m-3 rounded-lg border border-slate-800/90 bg-slate-900/50 text-xs">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>RLS Isolation</span>
          </span>
          <span className="font-mono text-emerald-400 text-[10px]">Active</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Tenant: <span className="text-slate-200 font-medium">Acme Global Corp</span>
        </p>
        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
          Dept: <span className="text-indigo-300 capitalize">{user?.department}</span>
        </p>
      </div>
    </aside>
  );
}
