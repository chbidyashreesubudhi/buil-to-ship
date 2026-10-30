import React, { useState, useEffect } from 'react';
import { api, AuditLog } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Search, RefreshCw, ChevronDown, ChevronRight, Lock, CheckCircle2 } from 'lucide-react';

export function AuditLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
  }, [user]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getAuditLogs();
      setLogs(res.logs);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.module.toLowerCase().includes(q) ||
      (log.user_name && log.user_name.toLowerCase().includes(q)) ||
      (log.department && log.department.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Immutable Compliance Trail</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Audit Logs &amp; Security Ledger</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically timestamped record of all AI decisions, autonomous triggers, and administrative actions
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="px-3.5 py-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, module, user, or department..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <span className="text-xs font-mono text-slate-400 shrink-0">
          Showing {filteredLogs.length} events
        </span>
      </div>

      {/* Logs Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/70">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-medium">
                <th className="py-3 px-4 w-10"></th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.map((log) => {
                const isExpanded = expandedId === log.id;
                return (
                  <React.Fragment key={log.id}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 text-slate-500">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-indigo-400">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-medium">
                        {log.module}
                      </td>
                      <td className="py-3 px-4 text-slate-200">
                        {log.user_name || 'System Daemon'}
                      </td>
                      <td className="py-3 px-4 text-slate-400 capitalize">
                        {log.department || 'Cross-Dept'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {log.ip_address}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-950/90 border-b border-slate-800">
                        <td colSpan={7} className="p-4">
                          <div className="text-[11px] font-mono text-slate-400 mb-1">
                            Payload Details (JSONB):
                          </div>
                          <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-indigo-300 font-mono text-xs overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    No matching audit records in tenant ledger.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
