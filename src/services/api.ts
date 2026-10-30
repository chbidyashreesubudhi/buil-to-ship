export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  department: string;
  created_at: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger_event: string;
  action_type: string;
  is_active: boolean;
  department: string;
  created_by: string;
  created_by_name?: string;
  created_at: string;
  last_executed?: string;
  execution_count?: number;
}

export interface DocumentRecord {
  id: string;
  title: string;
  file_type: string;
  storage_url: string;
  extracted_data: {
    documentType: string;
    entities: Array<{ key: string; value: string }>;
    riskScore: number;
    actionableSummary: string;
  } | null;
  status: 'pending' | 'processed' | 'failed';
  uploaded_by: string;
  uploaded_by_name?: string;
  department: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_name?: string;
  department?: string;
  action: string;
  module: string;
  details: Record<string, any>;
  ip_address: string;
  created_at: string;
}

export interface DashboardMetrics {
  activeWorkflows: number;
  totalWorkflows: number;
  totalExecutions: number;
  documentsIngested: number;
  highRiskFlags: number;
  auditEventsRecorded: number;
  estimatedHoursSaved: number;
  automationCostSavingsUSD: number;
  operationalVelocityIndex: number;
  tokenUsageSummary: {
    totalTokensProcessed: number;
    averageLatencyMs: number;
    monthlyQuotaUsedPercent: number;
  };
  departmentDistribution: Array<{ department: string; count: number; throughput: number }>;
  bottlenecks: Array<{
    id: string;
    department: string;
    title: string;
    severity: string;
    impactHours: number;
    recommendation: string;
  }>;
}

function getAuthHeaders() {
  const token = localStorage.getItem('nexus_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  async register(data: { name: string; email: string; password: string; department: string; role: string }) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async login(data: { email: string; password: string }) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Invalid credentials');
    }
    return res.json();
  },

  async getProfile() {
    const res = await fetch('/api/users/profile', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Session invalid');
    return res.json();
  },

  async getDashboardMetrics(): Promise<{ metrics: DashboardMetrics }> {
    const res = await fetch('/api/dashboard/metrics', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
    return res.json();
  },

  async getWorkflows(): Promise<{ workflows: Workflow[] }> {
    const res = await fetch('/api/workflows', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch workflows');
    return res.json();
  },

  async createWorkflow(data: {
    name: string;
    description?: string;
    triggerEvent: string;
    actionType: string;
    isActive?: boolean;
    department?: string;
  }) {
    const res = await fetch('/api/workflows', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create workflow');
    }
    return res.json();
  },

  async toggleWorkflow(id: string) {
    const res = await fetch(`/api/workflows/${id}/toggle`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to toggle workflow status');
    return res.json();
  },

  async executeWorkflow(id: string, payload?: any) {
    const res = await fetch(`/api/workflows/${id}/execute`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ payload }),
    });
    if (!res.ok) throw new Error('Failed to execute workflow');
    return res.json();
  },

  async deleteWorkflow(id: string) {
    const res = await fetch(`/api/workflows/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete workflow');
    return res.json();
  },

  async generateAiWorkflow(problemStatement: string, targetDepartment?: string) {
    const res = await fetch('/api/workflows/generate-ai', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ problemStatement, targetDepartment }),
    });
    if (!res.ok) throw new Error('Failed to synthesize workflow');
    return res.json();
  },

  async getDocuments(): Promise<{ documents: DocumentRecord[] }> {
    const res = await fetch('/api/documents', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
  },

  async uploadDocument(data: { title: string; content: string; fileType?: string }) {
    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to parse document');
    }
    return res.json();
  },

  async queryCopilot(message: string, history: Array<{ role: 'user' | 'model'; content: string }>) {
    const res = await fetch('/api/ai/copilot', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, history }),
    });
    if (!res.ok) throw new Error('Copilot response generation failed');
    return res.json();
  },

  async getAuditLogs(): Promise<{ logs: AuditLog[]; totalCount: number }> {
    const res = await fetch('/api/audit-logs', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  async getAnalyticsOverview() {
    const res = await fetch('/api/analytics/overview', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },
};
