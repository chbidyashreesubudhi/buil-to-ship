import React, { useState, useEffect } from 'react';
import { api, DocumentRecord } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  UploadCloud,
  CheckCircle,
  AlertOctagon,
  Sparkles,
  FileCheck,
  Eye,
  FileSpreadsheet,
  Clock,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';

export function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);

  // Ingestion form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fileType, setFileType] = useState('application/pdf');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [user]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.getDocuments();
      setDocuments(res.documents);
      if (res.documents.length > 0 && !selectedDoc) {
        setSelectedDoc(res.documents[0]);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setIsProcessing(true);
    setError(null);
    try {
      const res = await api.uploadDocument({ title, content, fileType });
      setTitle('');
      setContent('');
      await loadDocuments();
      setSelectedDoc(res.document);
    } catch (err: any) {
      setError(err.message || 'Ingestion failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadSample = (sampleType: 'invoice' | 'resume' | 'incident' | 'expense') => {
    if (sampleType === 'invoice') {
      setTitle('Vertex_Systems_Q3_Enterprise_Cloud_License_#8892.pdf');
      setFileType('application/pdf');
      setContent(`TAX INVOICE
Invoice Number: INV-8892-US
Date: October 28, 2026
Vendor: Vertex Systems Inc, 500 Delaware Ave, Wilmington, DE
Customer: Acme Global Enterprise Corp
PO Reference: PO-GLOBAL-44120

ITEMS:
1. Enterprise Cloud Orchestrator Annual Tier (500 seats): $72,000.00
2. Dedicated AI Microservices Transit Bandwidth (10 Gbps): $16,500.00
3. Premium 24/7 SLA Support Tier: $6,500.00

Subtotal: $95,000.00
Tax (0% Foreign exempt): $0.00
TOTAL DUE: $95,000.00 USD
Payment Terms: Net 15 days via ACH/Wire
Payment Account: J.P. Morgan Chase Routing #021000021 Acc #884920194

Authorized Signature: Marcus Sterling, VP Global Finance`);
    } else if (sampleType === 'resume') {
      setTitle('Staff_Distributed_Systems_Architect_Maya_Lin.pdf');
      setFileType('application/pdf');
      setContent(`MAYA LIN, M.Sc. Computer Science (Stanford University)
Email: maya.lin@alumni.stanford.edu | Location: Seattle, WA

EXECUTIVE SUMMARY:
Principal Infrastructure & Distributed Systems Engineer with 11+ years leading high-throughput low-latency computing platforms at scale. Proven track record managing Kubernetes clusters handling 4M QPS.

EXPERIENCE:
Staff Distributed Systems Engineer - CloudScale Technologies (2022 - Present)
- Architected multi-region consensus protocol lowering synchronization jitter by 42%.
- Lead architect for internal LLM inference gateway serving 150B daily token requests.

Senior Systems Engineer - Datacenter Core Inc. (2018 - 2022)
- Replaced legacy C++ RPC pipeline with Rust & gRPC, cutting memory footprint by 65%.

SKILLS:
Rust, Go, TypeScript, Distributed Consensus (Raft), PostgreSQL, Kafka, eBPF, Kubernetes`);
    } else if (sampleType === 'incident') {
      setTitle('Incident_Postmortem_EMEA_Gateway_TLS_Degradation.txt');
      setFileType('text/plain');
      setContent(`INCIDENT POST-MORTEM REPORT
Incident ID: INC-2026-10-30-EMEA
Severity: P1 - Critical Customer Latency
Duration: 41 minutes (14:10 UTC - 14:51 UTC)
Impact: 18% of European traffic experienced 504 Gateway Timeouts.

TIMELINE:
14:10 UTC - Automated synthetic prober flags TLS handshake latency spike to 4,200ms.
14:15 UTC - On-call engineer paged. Nexus-AI auto-triage suggests certificate revocation check storm.
14:28 UTC - Mitigation: Switched OCSP stapling cache to fallback secondary responder.
14:51 UTC - Latency normalized to 18ms.

ROOT CAUSE:
Third-party OCSP authority suffered DNS routing loop, blocking real-time certificate validation for edge proxies.`);
    } else if (sampleType === 'expense') {
      setTitle('Executive_Expense_Audit_Q3_Zurich_Summit.csv');
      setFileType('text/csv');
      setContent(`TransactionID,Date,Merchant,Category,AmountUSD,PolicyStatus,Notes
TX-901,2026-10-12,Swiss Air,Travel,4200.00,Approved,Business class international
TX-902,2026-10-14,The Dolder Grand,Lodging,2850.00,Flagged,Exceeds cap by $450/night
TX-903,2026-10-15,Kronenhalle Zurich,Meals & Ent,1620.00,Flagged,Client dinner without attendee roster
TX-904,2026-10-16,SBB Railway,Local Transit,84.00,Approved,Airport rail express`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Intelligent Document Ingestion Engine</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated entity parsing, risk scoring, and structured extraction powered by Google Gemini
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          <span>Tenant Document Vault Active</span>
        </div>
      </div>

      {/* Upload and Ingest Section */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">Ingest New Enterprise File</h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Load Enterprise Sample:</span>
            <button
              onClick={() => loadSample('invoice')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px]"
            >
              Invoice
            </button>
            <button
              onClick={() => loadSample('resume')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px]"
            >
              Resume
            </button>
            <button
              onClick={() => loadSample('incident')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px]"
            >
              Incident
            </button>
            <button
              onClick={() => loadSample('expense')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px]"
            >
              Expense CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleIngest} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">Document Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q3_Contract_Master_Services_Agreement.pdf"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">MIME Type</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="application/pdf">PDF Document</option>
                <option value="text/csv">CSV Table</option>
                <option value="text/plain">Text / Log File</option>
                <option value="application/json">JSON Payload</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Document Content / Raw Text</label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste raw text, table data, or click one of the pre-loaded enterprise samples above..."
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white font-mono text-xs focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isProcessing || !title || !content}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Gemini Extracting Entities...' : 'Run Gemini Extraction'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Main Content Split: Document List & Extracted Insights Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document List */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 mb-1">
            <span>Repository Files ({documents.length})</span>
            <span>Department: {user?.department}</span>
          </div>

          <div className="space-y-2">
            {documents.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              const risk = doc.extracted_data?.riskScore || 0;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-500/50 bg-slate-900 shadow-md'
                      : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="font-medium text-slate-200 truncate">{doc.title}</span>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0 ${
                        risk > 40
                          ? 'bg-rose-500/20 text-rose-300'
                          : risk > 20
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      Risk: {risk}/100
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{doc.extracted_data?.documentType || 'Enterprise Doc'}</span>
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Extracted Insights Viewer */}
        <div className="lg:col-span-7">
          {selectedDoc ? (
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-400">
                    Extracted Intelligence
                  </span>
                  <h2 className="text-base font-bold text-white break-all">{selectedDoc.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950 font-mono text-xs text-slate-300">
                    Risk Score:{' '}
                    <span
                      className={
                        (selectedDoc.extracted_data?.riskScore || 0) > 30
                          ? 'text-rose-400 font-bold'
                          : 'text-emerald-400 font-bold'
                      }
                    >
                      {selectedDoc.extracted_data?.riskScore || 0}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Actionable Executive Summary */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Actionable Executive Summary
                </h3>
                <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950 text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {selectedDoc.extracted_data?.actionableSummary || 'No summary available.'}
                </div>
              </div>

              {/* Structured Extracted Entities Table */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Extracted Entities &amp; Metadata
                </h3>
                <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-medium">
                        <th className="py-2.5 px-3 w-1/3">Key Attribute</th>
                        <th className="py-2.5 px-3">Extracted Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {selectedDoc.extracted_data?.entities &&
                      selectedDoc.extracted_data.entities.length > 0 ? (
                        selectedDoc.extracted_data.entities.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/40">
                            <td className="py-2.5 px-3 font-medium text-slate-300 font-mono">
                              {item.key}
                            </td>
                            <td className="py-2.5 px-3 text-slate-200 font-mono">
                              {item.value}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="py-4 text-center text-slate-500">
                            No entities identified.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 font-mono">
                <span>Storage URL: {selectedDoc.storage_url}</span>
                <span>Uploaded by: {selectedDoc.uploaded_by_name || 'System Admin'}</span>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
              Select or ingest a document to review Gemini structured extraction.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
