import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Shield, ArrowRight, CheckCircle2, Lock, Mail, User as UserIcon, Building } from 'lucide-react';
import { z } from 'zod';

const loginZod = z.object({
  email: z.string().email('Please enter a valid enterprise email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerZod = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid enterprise email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  department: z.string().min(2, 'Department is required'),
  role: z.enum(['admin', 'manager', 'employee']),
});

export function LoginPage() {
  const { login, register, quickLoginAs } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Operations');
  const [role, setRole] = useState<'admin' | 'manager' | 'employee'>('employee');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const val = loginZod.safeParse({ email, password });
        if (!val.success) {
          setError(val.error.issues[0].message);
          setIsSubmitting(false);
          return;
        }
        await login(email, password);
      } else {
        const val = registerZod.safeParse({ name, email, password, department, role });
        if (!val.success) {
          setError(val.error.issues[0].message);
          setIsSubmitting(false);
          return;
        }
        await register({ name, email, password, department, role });
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (roleKey: 'admin' | 'finance_manager' | 'ops_manager' | 'sales_employee') => {
    setError(null);
    setIsSubmitting(true);
    try {
      await quickLoginAs(roleKey);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Autonomous Enterprise AI Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Nexus-AI Platform
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Autonomous intelligence and cross-departmental workflow orchestration
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Quick Demo Credentials Strip */}
          <div className="mb-6 p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>1-Click Demo Clearance</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">Instant Access</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-[11px]">Admin (Exec)</div>
                  <div className="text-[10px] text-slate-400 font-mono">admin@nexus.ai</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('finance_manager')}
                className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-[11px]">Manager (Finance)</div>
                  <div className="text-[10px] text-slate-400 font-mono">sarah.chen@...</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('ops_manager')}
                className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-[11px]">Manager (Ops)</div>
                  <div className="text-[10px] text-slate-400 font-mono">david.oc@...</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('sales_employee')}
                className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-[11px]">Employee (Sales)</div>
                  <div className="text-[10px] text-slate-400 font-mono">elena.r@...</div>
                </div>
              </button>
            </div>
          </div>

          {/* Form Tabs */}
          <div className="flex rounded-lg bg-slate-950 p-1 mb-6 border border-slate-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-md transition-colors ${
                mode === 'login' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-md transition-colors ${
                mode === 'register' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Register Enterprise Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jordan Hayes"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Department</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option value="Finance">Finance</option>
                        <option value="Operations">Operations</option>
                        <option value="HR">HR</option>
                        <option value="Sales">Sales</option>
                        <option value="IT Support">IT Support</option>
                        <option value="Executive">Executive</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Role Tier</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="employee">Standard Employee</option>
                      <option value="manager">Department Manager</option>
                      <option value="admin">Enterprise Admin</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-slate-300 font-medium mb-1">Enterprise Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <span>{mode === 'login' ? 'Authenticate' : 'Provision Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-400">
            Protected by Row Level Security (RLS) &amp; Bcrypt Encryption
          </div>
        </div>
      </div>
    </div>
  );
}
