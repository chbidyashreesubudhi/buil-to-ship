import React, { useState, useEffect } from 'react';
import { api, Workflow } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Workflow as WorkflowIcon,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trash2,
  Filter,
  ArrowRight,
  Clock,
  Layers,
  Activity,
  Check,
} from 'lucide-react';

export function WorkflowsPage() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // New Workflow form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerEvent, setTriggerEvent] = useState('');
  const [actionType, setActionType] = useState('');
  const [department, setDepartment] = useState('Operations');
  const [error, setError] = useState<string | null>(null);

  // AI Workflow Synthesis state
  const [aiProblem, setAiProblem] = useState('');
  const [aiSynthesizing, setAiSynthesizing] = useState(false);
  const [aiProposal, setAiProposal] = useState<any | null>(null);

  // Execution Simulator state
  const [activeExecution, setActiveExecution] = useState<{
    workflow: Workflow;
    status: 'running' | 'completed' | 'failed';
    latencyMs: number;
    steps: string[];
  } | null>(null);

  useEffect(() => {
    loadWorkflows();
  }, [user]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const res = await api.getWorkflows();
      setWorkflows(res.workflows);
    } catch (err) {
      console.error('Failed to load workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await api.toggleWorkflow(id);
      setWorkflows((prev) => prev.map((w) => (w.id === id ? res.workflow : w)));
    } catch (err: any) {
      alert(err.message || 'Cannot toggle workflow status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to decommission this automated workflow?')) return;
    try {
      await api.deleteWorkflow(id);
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete workflow');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.createWorkflow({
        name,
        description,
        triggerEvent,
        actionType,
        department: user?.role === 'admin' ? department : user?.department,
      });
      setShowCreateModal(false);
      setName('');
      setDescription('');
      setTriggerEvent('');
      setActionType('');
      loadWorkflows();
    } catch (err: any) {
      setError(err.message || 'Failed to provision workflow');
    }
  };

  const handleAiSynthesize = async () => {
    if (!aiProblem.trim()) return;
    setAiSynthesizing(true);
    setAiProposal(null);
    try {
      const res = await api.generateAiWorkflow(aiProblem, user?.department);
      setAiProposal(res.proposal);
    } catch (err: any) {
      alert('AI Synthesis error: ' + err.message);
    } finally {
      setAiSynthesizing(false);
    }
  };

  const handleApplyAiProposal = () => {
    if (!aiProposal) return;
    setName(aiProposal.name || '');
    setDescription(aiProposal.description || '');
    setTriggerEvent(aiProposal.triggerEvent || '');
    setActionType(aiProposal.actionType || '');
    setShowAiModal(false);
    setShowCreateModal(true);
  };

  const handleSimulate = async (wf: Workflow) => {
    setActiveExecution({
      workflow: wf,
      status: 'running',
      latencyMs: 140,
      steps: ['Ingesting Trigger Event Payload...', 'Evaluating Nexus Policy Rules...'],
    });

    try {
      const res = await api.executeWorkflow(wf.id, { simulation: true });
      setTimeout(() => {
        setActiveExecution({
          workflow: res.workflow,
          status: 'completed',
          latencyMs: res.executionLog?.latencyMs || 185,
          steps: [
            'Event Ingested: ' + wf.trigger_event,
            'Policy Evaluation: Passed (0 Conflicts)',
            'Action Executed: ' + wf.action_type,
            'Audit Trail Logged & Department Notified',
          ],
        });
        loadWorkflows();
      }, 700);
    } catch (err) {
      setActiveExecution((prev) =>
        prev
          ? {
              ...prev,
              status: 'failed',
              steps: [...prev.steps, 'Execution failed due to policy violation'],
            }
          : null
      );
    }
  };

  const filteredWorkflows = workflows.filter((w) => {
    if (filterDept === 'all') return true;
    return w.department.toLowerCase() === filterDept.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/60">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Automated Workflow Orchestrator</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Event-driven autonomous agents bridging Sales, HR, Operations, Finance, and IT Support
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setAiProblem('');
              setAiProposal(null);
              setShowAiModal(true);
            }}
            className="px-3 py-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Synthesizer</span>
          </button>

          {(user?.role === 'admin' || user?.role === 'manager') && (
            <button
              onClick={() => {
                setError(null);
                setShowCreateModal(true);
              }}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Workflow</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and stats row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
          <span className="px-2 text-slate-400 font-medium">Department:</span>
          {['all', 'Finance', 'Operations', 'HR', 'Sales', 'Executive'].map((dept) => (
            <button
              key={dept}
              onClick={() => setFilterDept(dept)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterDept === dept
                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {dept === 'all' ? 'All Divisions' : dept}
            </button>
          ))}
        </div>

        <div className="text-slate-400 text-xs flex items-center gap-2">
          <span>Total Workflows: <strong className="text-white font-mono">{filteredWorkflows.length}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Active: <strong className="text-emerald-400 font-mono">{filteredWorkflows.filter(w => w.is_active).length}</strong></span>
        </div>
      </div>

      {/* Execution Simulator Live Drawer / Banner */}
      {activeExecution && (
        <div className="p-4 rounded-xl border border-indigo-500/40 bg-slate-900/90 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400 animate-spin" />
              <span className="text-xs font-semibold text-white">
                Live Execution Sandbox: {activeExecution.workflow.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-400">
                Latency: <span className="text-indigo-300">{activeExecution.latencyMs}ms</span>
              </span>
              <button
                onClick={() => setActiveExecution(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
            {activeExecution.steps.map((step, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg border border-slate-800 bg-slate-950 flex items-center gap-2 text-slate-300"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-[11px] font-mono">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkflows.map((wf) => (
          <div
            key={wf.id}
            className={`p-5 rounded-xl border bg-slate-900/70 flex flex-col justify-between transition-all ${
              wf.is_active ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/40 opacity-70'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <WorkflowIcon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white leading-tight block">{wf.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{wf.department}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggle(wf.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-colors ${
                    wf.is_active
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {wf.is_active ? 'Active' : 'Paused'}
                </button>
              </div>

              <p className="text-xs text-slate-400 mt-2 leading-relaxed min-h-[38px]">
                {wf.description || 'Automated multi-step operational handler.'}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800/70 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Trigger:</span>
                  <span className="text-slate-200 font-mono truncate max-w-[170px]">{wf.trigger_event}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Action:</span>
                  <span className="text-indigo-300 font-mono truncate max-w-[170px]">{wf.action_type}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Executions:</span>
                  <span className="text-white font-mono tabular-nums">{wf.execution_count || 0} times</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleSimulate(wf)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Play className="w-3 h-3 text-indigo-400" />
                <span>Simulate Run</span>
              </button>

              {(user?.role === 'admin' || user?.role === 'manager') && (
                <button
                  onClick={() => handleDelete(wf.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Delete Workflow"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-xs">
            <h2 className="text-base font-bold text-white mb-1">Provision Autonomous Workflow</h2>
            <p className="text-slate-400 mb-4">Define trigger events and cross-system action chains.</p>

            {error && (
              <div className="mb-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Workflow Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Automated Vendor Reconciliation"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Business objective and handoff rules..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Trigger Event</label>
                <input
                  type="text"
                  required
                  value={triggerEvent}
                  onChange={(e) => setTriggerEvent(e.target.value)}
                  placeholder="e.g. Inbound Invoice > $25,000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Autonomous Action Chain</label>
                <input
                  type="text"
                  required
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  placeholder="e.g. OCR Parsing & CFO Approval Escalation"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {user?.role === 'admin' && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Assigned Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="HR">HR</option>
                    <option value="Sales">Sales</option>
                    <option value="IT Support">IT Support</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/30"
                >
                  Deploy Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Workflow Synthesizer Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-xs">
            <div className="flex items-center gap-2 mb-2 text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <h2 className="text-base font-bold text-white">Gemini Workflow Synthesizer</h2>
            </div>
            <p className="text-slate-400 mb-4">
              Describe any enterprise bottleneck or manual friction point. Gemini AI will synthesize an optimal trigger-and-action configuration.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Operational Friction Problem Statement</label>
                <textarea
                  value={aiProblem}
                  onChange={(e) => setAiProblem(e.target.value)}
                  placeholder="e.g. We spend 15 hours a week matching supplier tax IDs against government compliance registries before releasing vendor payments..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleAiSynthesize}
                  disabled={aiSynthesizing || !aiProblem.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-medium flex items-center gap-2"
                >
                  {aiSynthesizing ? 'Synthesizing...' : 'Generate Workflow Specification'}
                </button>
              </div>

              {aiProposal && (
                <div className="mt-4 p-4 rounded-xl border border-indigo-500/30 bg-slate-950 space-y-2">
                  <div className="font-semibold text-indigo-300 text-sm">{aiProposal.name}</div>
                  <p className="text-slate-300 text-xs leading-relaxed">{aiProposal.description}</p>
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono space-y-1">
                    <div>Trigger: <span className="text-slate-200">{aiProposal.triggerEvent}</span></div>
                    <div>Action: <span className="text-slate-200">{aiProposal.actionType}</span></div>
                    <div>Estimated Weekly Savings: <span className="text-emerald-400">~{aiProposal.estimatedHoursSavedWeekly || 8} hours</span></div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleApplyAiProposal}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5"
                    >
                      <span>Adopt This Workflow</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowAiModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
