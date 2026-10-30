import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  helperText?: string;
}

export function MetricCard({
  label,
  value,
  subValue,
  change,
  isPositive = true,
  icon: Icon,
  helperText,
}: MetricCardProps) {
  return (
    <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700/80 transition-colors">
      <div className="flex items-center justify-between gap-4 mb-3">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-300">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
          {value}
        </span>
        {subValue && (
          <span className="text-xs text-slate-400 font-mono">
            {subValue}
          </span>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between text-xs pt-2.5 border-t border-slate-800/60">
        {change ? (
          <div className="flex items-center gap-1 font-mono tabular-nums">
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>{change}</span>
            <span className="text-slate-400">vs last month</span>
          </div>
        ) : (
          <span className="text-slate-400 text-[11px]">{helperText || 'Nominal velocity'}</span>
        )}
      </div>
    </div>
  );
}
