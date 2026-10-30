import React, { useEffect, useState } from 'react';
import { api, DashboardMetrics, Workflow } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MetricCard } from '../components/MetricCard';
import {
  Zap,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Play,
  ArrowRight,
  Sparkles,
  Bot,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mRes, wRes] = await Promise.all([api.getDashboardMetrics(), api.getWorkflows()]);
      setMetrics(mRes.metrics);
      setWorkflows(wRes.workflows);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async (wf: Workflow) => {
    setExecutingId(wf.id);
    setExecutionMessage(null);
    try {
      await api.executeWorkflow(wf.id, { trigger: 'Manual Dashboard Dispatch' });
      setExecutionMessage(`Autonomous execution dispatched for "${wf.name}".`);
      fetchData();
    } catch (err: any) {
      setExecutionMessage(err.message || 'Execution failed');
    } finally {
      setExecutingId(null);
    }
  };

  const trendData = [
    { name: 'May', savings: 8580, automatedHours: 110 },
    { name: 'Jun', savings: 15210, automatedHours: 195 },
    { name: 'Jul', savings: 22620, automatedHours: 290 },
    { name: 'Aug', savings: 29640, automatedHours: 380 },
    { name: 'Sep', savings: 38220, automatedHours: 490 },
    { name: 'Oct', savings: 48360, automatedHours: 620 },
  ];

  if (loading && !metrics) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh] text-slate-400 text-xs font-mono">
        Loading enterprise telemetry...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Intelligence Fabric</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Enterprise Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Welcome back, <span className="text-slate-200 font-medium">{user?.name}</span>. Currently orchestrating{' '}
            <span className="text-slate-200 font-mono font-medium">{metrics?.activeWorkflows || 0}</span> autonomous workflows across{' '}
            <span className="text-slate-200 capitalize">{user?.department}</span> and enterprise systems.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/copilot"
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-2 shadow-sm shadow-indigo-600/30 transition-all whitespace-nowrap"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Open AI Copilot</span>
          </Link>
          <Link
            to="/workflows"
            className="px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Manage Workflows</span>
          </Link>
        </div>
      </div>

      {executionMessage && (
        <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{executionMessage}</span>
          </div>
          <button onClick={() => setExecutionMessage(null)} className="text-emerald-400 text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Active Autonomous Workflows"
          value={metrics?.activeWorkflows || 0}
          subValue={`/ ${metrics?.totalWorkflows || 0} total`}
          change="+18.4%"
          isPositive={true}
          icon={Zap}
        />
        <MetricCard
          label="Estimated Monthly Hours Saved"
          value={`${metrics?.estimatedHoursSaved || 0}h`}
          subValue="velocity gain"
          change="+34.2%"
          isPositive={true}
          icon={Clock}
        />
        <MetricCard
          label="Operational Cost Reductions"
          value={`$${(metrics?.automationCostSavingsUSD || 0).toLocaleString()}`}
          subValue="annualized $580k"
          change="+26.8%"
          isPositive={true}
          icon={DollarSign}
        />
        <MetricCard
          label="Operational Velocity Index"
          value={`${metrics?.operationalVelocityIndex || 96.4}%`}
          subValue="system benchmark"
          change="+3.1%"
          isPositive={true}
          icon={TrendingUp}
        />
      </div>

      {/* Charts Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Automation Value Growth */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Cumulative Automation Cost Savings</h2>
              <p className="text-xs text-slate-400 mt-0.5">Calculated based on FTE hourly rates across autonomous chains</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-emerald-400 font-semibold">$48,360 in Oct</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: any) => [`$${value.toLocaleString()}`, 'Savings']}
                />
                <Area type="monotone" dataKey="savings" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#savingsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Throughput Breakdown */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-slate-100">Department Throughput</h2>
              <span className="text-xs font-mono text-slate-400">Velocity %</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">Autonomous execution rate by division</p>

            <div className="space-y-3">
              {metrics?.departmentDistribution.map((dept) => (
                <div key={dept.department} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{dept.department}</span>
                    <span className="font-mono text-slate-400">{dept.throughput}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                      style={{ width: `${dept.throughput}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Gemini Token Consumption</span>
            <span className="font-mono text-slate-200">2.48M tokens</span>
          </div>
        </div>
      </div>

      {/* Operational Bottlenecks & Quick Workflows Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identified Operational Bottlenecks */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-slate-100">AI-Flagged Operational Bottlenecks</h2>
            </div>
            <span className="text-xs font-mono text-amber-400">Requires Attention</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Autonomous anomaly engine monitors queue latencies and cross-departmental handoffs.
          </p>

          <div className="space-y-3">
            {metrics?.bottlenecks.map((b) => (
              <div key={b.id} className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/70 text-xs">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <span className="font-medium text-slate-200">{b.title}</span>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {b.department} Department · <span className="text-amber-400 font-mono">~{b.impactHours}h monthly delay</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] uppercase font-mono rounded ${
                    b.severity === 'high' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {b.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 bg-slate-900/80 p-2 rounded border border-slate-800/80">
                  <span className="text-indigo-300 font-medium">Recommendation:</span> {b.recommendation}
                </p>
                <div className="mt-2.5 flex items-center justify-end">
                  <button
                    onClick={() => navigate('/workflows')}
                    className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>Synthesize Workflow Fix</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Trigger Active Workflows */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-100">Autonomous Workflow Trigger Hub</h2>
            <Link to="/workflows" className="text-xs text-indigo-400 hover:underline">
              View All ({workflows.length})
            </Link>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Test and trigger multi-step autonomous chains directly from the executive deck.
          </p>

          <div className="space-y-2.5">
            {workflows.slice(0, 4).map((wf) => (
              <div
                key={wf.id}
                className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-200 truncate">{wf.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({wf.department})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    Trigger: <span className="text-slate-300">{wf.trigger_event}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleExecute(wf)}
                  disabled={executingId === wf.id}
                  className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors disabled:opacity-50"
                >
                  <Play className="w-3 h-3 text-indigo-400" />
                  <span>{executingId === wf.id ? 'Running...' : 'Dispatch'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
