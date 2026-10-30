import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Send,
  Bot,
  User as UserIcon,
  Sparkles,
  Terminal,
  Database,
  ArrowRight,
  Shield,
  Layers,
  Cpu,
  RefreshCw,
  Code2,
  FileCheck2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  intent?: string;
  timestamp: string;
}

export function CopilotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      content: `Hello ${user?.name}. I am **Nexus-Core**, your Enterprise AI Architect and Senior Operations Analyst.

I have synchronized live telemetry across **Sales**, **HR**, **Operations**, **Finance**, and **IT Support**.

How can I assist your operational decisions today?
- **Text-to-SQL**: Query enterprise PostgreSQL tables
- **Bottleneck Analysis**: Isolate operational friction points
- **Workflow Synthesis**: Formulate automated cross-departmental rules
- **Document Ingestion**: Review parsed risk scores and actionable entities`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    {
      title: 'Text-to-SQL Query',
      prompt: 'Write a PostgreSQL query to retrieve all pending invoices with riskScore > 20 and total amount > $25,000, joined with the users table.',
      icon: Database,
    },
    {
      title: 'Bottleneck Triage',
      prompt: 'Analyze current operational bottlenecks across Finance and IT Support. What automated workflows will yield the highest ROI?',
      icon: Layers,
    },
    {
      title: 'Incident Response Playbook',
      prompt: 'Formulate an autonomous playbook for Cloud Gateway latency alerts: trigger condition, verification checks, and escalation steps.',
      icon: Terminal,
    },
    {
      title: 'HR Screening Velocity',
      prompt: 'Review candidate ingestion pipeline. How can Gemini structured extraction reduce time-to-hire for engineering candidates?',
      icon: FileCheck2,
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.queryCopilot(textToSend, historyPayload);

      const aiMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        role: 'model',
        content: res.reply,
        intent: res.intent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        role: 'model',
        content: `Error communicating with Nexus-Core: ${err.message || 'Service temporarily unreachable.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
      {/* Copilot Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">Nexus-Core AI Copilot</h2>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Online
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Enterprise reasoning engine · gemini-3.8-flash · Department: {user?.department}
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'reset-1',
                role: 'model',
                content: `Session context refreshed. Ready for enterprise queries.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
          className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Clear Context</span>
        </button>
      </div>

      {/* Messages Stream Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            )}

            <div className={`max-w-3xl ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div
                className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                }`}
              >
                {/* Intent label if present */}
                {msg.intent && (
                  <div className="mb-2 pb-2 border-b border-slate-800 flex items-center gap-1.5 text-[10px] font-mono text-indigo-300 uppercase tracking-wider">
                    <Code2 className="w-3 h-3" />
                    <span>Intent: {msg.intent.replace(/_/g, ' ')}</span>
                  </div>
                )}

                {/* Body formatting */}
                <div className="space-y-2 whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>
              </div>

              <span className="text-[10px] font-mono text-slate-400 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3.5 justify-start">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>Nexus-Core analyzing enterprise databases and workflow chains...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Pill Cards */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900/40 overflow-x-auto flex items-center gap-2 shrink-0">
        <span className="text-[11px] font-medium text-slate-400 shrink-0 mr-1">Quick Inquiries:</span>
        {quickPrompts.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(item.prompt)}
            disabled={loading}
            className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <item.icon className="w-3 h-3 text-indigo-400" />
            <span>{item.title}</span>
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask Nexus-Core (e.g. 'Write SQL for pending invoices', 'Suggest a workflow for ticket triage')..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Submit</span>
          </button>
        </form>
      </div>
    </div>
  );
}
