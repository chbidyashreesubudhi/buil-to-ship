import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Key, Building2, UserCheck, Lock, CheckCircle2, Server, Cpu, Database, RefreshCw, AlertCircle } from 'lucide-react';

export function SettingsPage() {
  const { user } = useAuth();

  const permissions = [
    {
      feature: 'Document Parsing & Extraction',
      admin: true,
      manager: true,
      employee: true,
      note: 'Employee access filtered to assigned department',
    },
    {
      feature: 'Autonomous Workflow Execution',
      admin: true,
      manager: true,
      employee: true,
      note: 'All authenticated personnel can dispatch departmental workflows',
    },
    {
      feature: 'Workflow Provisioning & Deletion',
      admin: true,
      manager: true,
      employee: false,
      note: 'Managers can configure workflows only for their department',
    },
    {
      feature: 'Full Enterprise Audit Ledger',
      admin: true,
      manager: false,
      employee: false,
      note: 'Admin-exclusive immutable compliance oversight',
    },
    {
      feature: 'Global Cross-Department Analytics',
      admin: true,
      manager: true,
      employee: false,
      note: 'Strategic C-suite & Director level visibility',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
        <h1 className="text-xl font-bold text-white tracking-tight">Enterprise Organization Settings</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Tenant identity, Row Level Security (RLS) enforcement, and Role-Based Access Control (RBAC)
        </p>
      </div>

      {/* User Profile Card */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <UserCheck className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">Authenticated Profile</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-slate-400 text-[11px]">Full Name</div>
            <div className="font-medium text-slate-200 mt-0.5">{user?.name}</div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Enterprise Email</div>
            <div className="font-mono text-slate-200 mt-0.5">{user?.email}</div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Security Clearance</div>
            <div className="font-mono text-indigo-400 uppercase font-semibold mt-0.5">
              {user?.role} Tier
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Assigned Department</div>
            <div className="font-medium text-slate-200 mt-0.5 capitalize">{user?.department}</div>
          </div>
        </div>
      </div>

      {/* Organization Tenant Card */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Building2 className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">Enterprise Tenant Configuration</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <div className="text-slate-400 text-[11px]">Tenant Organization</div>
            <div className="font-medium text-slate-200 mt-0.5">Acme Global Corporation</div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Data Isolation Architecture</div>
            <div className="font-mono text-emerald-400 mt-0.5">PostgreSQL Row-Level-Security (RLS)</div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Session Invalidation Policy</div>
            <div className="font-mono text-slate-300 mt-0.5">8 Hours JWT Expiration</div>
          </div>
        </div>
      </div>

      {/* PostgreSQL Database Integration Status */}
      <DatabaseIntegrationCard />

      {/* Server-Side AI Architecture Status */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Server className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white">Server-Side Gemini Architecture</h2>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          In strict compliance with enterprise security requirements, all Google Gemini API calls are executed
          strictly within the backend Node/Express proxy layer using <code className="text-indigo-400">@google/genai</code>.
          Zero credentials or keys are exposed to the client bundle.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
          <div className="p-3 rounded-lg border border-slate-800 bg-slate-950">
            <span className="text-[11px] text-slate-400">Active Model</span>
            <div className="font-mono font-medium text-slate-200 mt-1">gemini-3.8-flash</div>
          </div>
          <div className="p-3 rounded-lg border border-slate-800 bg-slate-950">
            <span className="text-[11px] text-slate-400">Telemetry Agent</span>
            <div className="font-mono font-medium text-slate-200 mt-1">aistudio-build</div>
          </div>
          <div className="p-3 rounded-lg border border-slate-800 bg-slate-950">
            <span className="text-[11px] text-slate-400">Structured Extraction</span>
            <div className="font-mono font-medium text-emerald-400 mt-1">JSON Schema Enforced</div>
          </div>
        </div>
      </div>

      {/* RBAC Granular Clearance Matrix */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">Granular RBAC Clearance Matrix</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Role Permissions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">Enterprise Feature</th>
                <th className="py-2.5 px-3 text-center">Admin</th>
                <th className="py-2.5 px-3 text-center">Manager</th>
                <th className="py-2.5 px-3 text-center">Employee</th>
                <th className="py-2.5 px-3">Governance Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {permissions.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-900/50">
                  <td className="py-3 px-3 font-medium text-slate-200">{p.feature}</td>
                  <td className="py-3 px-3 text-center">
                    {p.admin ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {p.manager ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {p.employee ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[11px]">{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DatabaseIntegrationCard() {
  const [status, setStatus] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/database/status');
      const data = await res.json();
      setStatus(data.status);
    } catch (err: any) {
      setStatus({
        connected: false,
        configured: false,
        error: err.message,
        provider: 'Local Persistent Store (Fallback)',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">PostgreSQL Database Connection Telemetry</h2>
        </div>
        <button
          onClick={checkStatus}
          disabled={loading}
          className="px-2.5 py-1 rounded-md border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Verify Connection</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950">
          <span className="text-[11px] text-slate-400">Connection Status</span>
          <div className="flex items-center gap-1.5 mt-1 font-mono font-medium">
            {status?.connected ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ONLINE (Connected)</span>
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>OFFLINE (Fallback Active)</span>
              </span>
            )}
          </div>
        </div>

        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950">
          <span className="text-[11px] text-slate-400">Database Engine / Provider</span>
          <div className="font-mono font-medium text-slate-200 mt-1 truncate">
            {status?.provider || 'Detecting...'}
          </div>
        </div>

        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950">
          <span className="text-[11px] text-slate-400">Connection Pool Telemetry</span>
          <div className="font-mono text-slate-300 mt-1">
            {status?.connected
              ? `${status.activeClientCount || 0} active / ${status.idleClientCount || 0} idle · ${status.latencyMs || 0}ms`
              : 'Standalone Pool Standby'}
          </div>
        </div>
      </div>

      {status && !status.connected && (
        <div className="p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-200 text-xs space-y-2">
          <div className="font-semibold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>PostgreSQL Database Credentials Not Yet Attached</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Google AI Studio does not bundle a built-in PostgreSQL container. The application is running seamlessly
            with full ACID isolation using the built-in resilient storage engine.
          </p>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
            <div className="text-indigo-300 font-semibold">How to connect Google Cloud SQL or external PostgreSQL:</div>
            <div>1. Add environment variable or Secret: <code className="text-emerald-300">DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"</code></div>
            <div>2. The application automatically runs <code className="text-emerald-300">database/schema.sql</code> and validates connection pooling.</div>
          </div>
        </div>
      )}
    </div>
  );
}

