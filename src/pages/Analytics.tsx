import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, TrendingUp, Cpu, ShieldCheck, Clock, Layers } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';

export function AnalyticsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAnalyticsOverview()
      .then((res) => setData(res))
      .catch((err) => console.error('Failed to load analytics:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh] text-slate-400 text-xs font-mono">
        Loading operational analytics...
      </div>
    );
  }

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Enterprise Operational Analytics</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Velocity metrics, cost reductions, token consumption, and autonomous resolution rates
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>SLA: {data.slaCompliancePct}%</span>
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>MTTR: {data.meanTimeToResolveHours * 60}m</span>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Autonomously Resolved"
          value={data.totalAutonomouslyResolvedTickets.toLocaleString()}
          subValue="events"
          change="+31.4%"
          isPositive={true}
          icon={TrendingUp}
        />
        <MetricCard
          label="Mean Time To Resolve"
          value={`${Math.round(data.meanTimeToResolveHours * 60)} min`}
          subValue="down from 4.8h"
          change="-78.2%"
          isPositive={true}
          icon={Clock}
        />
        <MetricCard
          label="Monthly Token Consumption"
          value="2.48M"
          subValue="gemini-3.8-flash"
          change="+12.0%"
          isPositive={true}
          icon={Cpu}
        />
        <MetricCard
          label="Enterprise SLA Compliance"
          value={`${data.slaCompliancePct}%`}
          subValue="99.0% target"
          change="+0.4%"
          isPositive={true}
          icon={ShieldCheck}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual vs Automated Hours Chart */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Manual vs Automated Operations</h2>
              <p className="text-xs text-slate-400 mt-0.5">FTE hours tracked per operational month</p>
            </div>
            <span className="text-xs font-mono text-indigo-400">Shift to Autonomous</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="manualHours" name="Manual FTE Hours" fill="#475569" radius={[4, 4, 0, 0]} />
                <Bar dataKey="automatedHours" name="Autonomous AI Hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Savings Growth Chart */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Cumulative Cost Savings (USD)</h2>
              <p className="text-xs text-slate-400 mt-0.5">Estimated financial impact of workflow automation</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-semibold">$48.3k October</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`$${val.toLocaleString()}`, 'Cost Savings']}
                />
                <Line type="monotone" dataKey="costSavingsUSD" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Breakdown Table & Error Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Departmental Automation Efficiency</h2>
            <span className="text-xs font-mono text-slate-400">Benchmarked Q3</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 px-3">Department</th>
                  <th className="py-2 px-3">Automated %</th>
                  <th className="py-2 px-3">Human Review %</th>
                  <th className="py-2 px-3">Average AI Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {data.departmentEfficiency.map((item: any) => (
                  <tr key={item.department} className="hover:bg-slate-900/50">
                    <td className="py-3 px-3 font-medium text-slate-200">{item.department}</td>
                    <td className="py-3 px-3 font-mono text-indigo-400 font-semibold">{item.automatedPct}%</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{item.humanReviewPct}%</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{item.avgLatencySec}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Daily Autonomous Corrections */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white mb-1">Autonomous Self-Healing</h2>
            <p className="text-xs text-slate-400 mb-4">Daily corrections resolved without human intervention</p>

            <div className="space-y-2">
              {data.errorRateTrends.map((d: any) => (
                <div key={d.day} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400 font-medium">{d.day}</span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-emerald-400">{d.autonomousCorrections} corrections</span>
                    <span className="text-slate-500">({d.errorRate}% err)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
            Zero data drift detected across tenant partitions.
          </div>
        </div>
      </div>
    </div>
  );
}
