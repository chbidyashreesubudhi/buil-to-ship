import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { executeQuery, isPostgresReady, testPostgresConnection, initPostgresSchema } from './postgres.js';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'manager' | 'employee';
  department: string;
  created_at: string;
  updated_at: string;
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

const DB_FILE = path.resolve(process.cwd(), '.nexus_data.json');

function generateInitialData() {
  const adminId = 'd8f075d9-0b1a-4c2f-b4c1-654a8b792a01';
  const managerFinanceId = 'a1e490fc-238d-4e9b-90f7-124b89dc1202';
  const managerOpsId = 'b2c581ad-349e-4f0c-a1e8-235c90ed2303';
  const employeeSalesId = 'c3d692be-450f-5a1d-b2f9-346d01fe3404';

  const defaultPasswordHash = bcrypt.hashSync('Password123!', 10);

  const users: User[] = [
    {
      id: adminId,
      name: 'Victoria Vance',
      email: 'admin@nexus.ai',
      password_hash: defaultPasswordHash,
      role: 'admin',
      department: 'Executive',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: managerFinanceId,
      name: 'Sarah Chen',
      email: 'sarah.chen@nexus.ai',
      password_hash: defaultPasswordHash,
      role: 'manager',
      department: 'Finance',
      created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: managerOpsId,
      name: 'David O’Connor',
      email: 'david.oc@nexus.ai',
      password_hash: defaultPasswordHash,
      role: 'manager',
      department: 'Operations',
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: employeeSalesId,
      name: 'Elena Rostova',
      email: 'elena.rostova@nexus.ai',
      password_hash: defaultPasswordHash,
      role: 'employee',
      department: 'Sales',
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const workflows: Workflow[] = [
    {
      id: 'wf-101',
      name: 'High-Value Invoice Risk Triangulation',
      description: 'Automatically routes invoices over $25,000 to CFO queue and triggers 3-way vendor verification.',
      trigger_event: 'Invoice Created > $25k',
      action_type: 'Risk Triage & Slack Notification',
      is_active: true,
      department: 'Finance',
      created_by: managerFinanceId,
      created_by_name: 'Sarah Chen',
      created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
      last_executed: new Date(Date.now() - 35 * 60000).toISOString(),
      execution_count: 148,
    },
    {
      id: 'wf-102',
      name: 'Automated Tier-1 Support Incident Escalation',
      description: 'Classifies customer ticket sentiment and escalates P1 tickets to on-call engineering within 90s.',
      trigger_event: 'Support Ticket Urgent / Negative Sentiment',
      action_type: 'Incident Response Playbook Trigger',
      is_active: true,
      department: 'Operations',
      created_by: managerOpsId,
      created_by_name: 'David O’Connor',
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      last_executed: new Date(Date.now() - 120 * 60000).toISOString(),
      execution_count: 512,
    },
    {
      id: 'wf-103',
      name: 'Candidate Technical Resume Screen & Ranking',
      description: 'Parses engineering candidates, assesses tech stack alignment, and generates interview rubric.',
      trigger_event: 'Resume Ingestion Portal',
      action_type: 'Candidate Scorecard Generation',
      is_active: true,
      department: 'HR',
      created_by: adminId,
      created_by_name: 'Victoria Vance',
      created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
      last_executed: new Date(Date.now() - 240 * 60000).toISOString(),
      execution_count: 94,
    },
    {
      id: 'wf-104',
      name: 'Enterprise Contract Anomaly Scanner',
      description: 'Scans non-standard indemnification clauses and flags legal risks prior to executive sign-off.',
      trigger_event: 'MSA / NDA Uploaded',
      action_type: 'Legal Risk Extraction & Flagging',
      is_active: true,
      department: 'Executive',
      created_by: adminId,
      created_by_name: 'Victoria Vance',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      last_executed: new Date(Date.now() - 600 * 60000).toISOString(),
      execution_count: 67,
    },
    {
      id: 'wf-105',
      name: 'Inbound Enterprise Lead Routing & Enrichment',
      description: 'Enriches inbound enterprise leads with firmographic intelligence and notifies regional director.',
      trigger_event: 'Lead Form Submitted (ARR > $100k)',
      action_type: 'CRM Account Sync & Notification',
      is_active: false,
      department: 'Sales',
      created_by: employeeSalesId,
      created_by_name: 'Elena Rostova',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      last_executed: new Date(Date.now() - 1440 * 60000).toISOString(),
      execution_count: 32,
    },
  ];

  const documents: DocumentRecord[] = [
    {
      id: 'doc-201',
      title: 'Q3_Global_Server_Fleet_Invoice_#4891.pdf',
      file_type: 'application/pdf',
      storage_url: '/storage/finance/invoices/inv_4891.pdf',
      extracted_data: {
        documentType: 'Vendor Commercial Invoice',
        entities: [
          { key: 'Vendor Name', value: 'Equinix Global Infrastructure' },
          { key: 'Total Amount', value: '$84,350.00 USD' },
          { key: 'Due Date', value: '2026-11-15' },
          { key: 'Payment Terms', value: 'Net 30' },
          { key: 'Tax ID', value: 'US-94-3829104' },
        ],
        riskScore: 8,
        actionableSummary: 'Standard high-volume infrastructure invoice. No anomaly detected. Matched with PO #9942.',
      },
      status: 'processed',
      uploaded_by: managerFinanceId,
      uploaded_by_name: 'Sarah Chen',
      department: 'Finance',
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      id: 'doc-202',
      title: 'Senior_Staff_AI_Engineer_Alex_Kowalski.pdf',
      file_type: 'application/pdf',
      storage_url: '/storage/hr/resumes/resume_kowalski.pdf',
      extracted_data: {
        documentType: 'Candidate Resume',
        entities: [
          { key: 'Candidate Name', value: 'Alex Kowalski' },
          { key: 'Years Experience', value: '9+ Years' },
          { key: 'Core Competencies', value: 'PyTorch, Distributed Training, TypeScript, System Architecture' },
          { key: 'Previous Role', value: 'Lead AI Engineer at Anthropic/Google partner' },
        ],
        riskScore: 5,
        actionableSummary: 'High-caliber technical candidate. Recommending immediate 45-minute architectural interview.',
      },
      status: 'processed',
      uploaded_by: adminId,
      uploaded_by_name: 'Victoria Vance',
      department: 'Executive',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'doc-203',
      title: 'Incident_Report_APAC_Database_Replication_Lag.txt',
      file_type: 'text/plain',
      storage_url: '/storage/ops/incidents/inc_apac_0912.txt',
      extracted_data: {
        documentType: 'Operational Post-Mortem',
        entities: [
          { key: 'Incident Severity', value: 'P2 - High Degradation' },
          { key: 'Root Cause', value: 'Cross-region network partition during transit migration' },
          { key: 'MTTR', value: '23 Minutes' },
          { key: 'Impacted Tenants', value: '14 Enterprise accounts' },
        ],
        riskScore: 42,
        actionableSummary: 'Network failover succeeded with 0 data loss. Requires updating DNS TTL to 60 seconds.',
      },
      status: 'processed',
      uploaded_by: managerOpsId,
      uploaded_by_name: 'David O’Connor',
      department: 'Operations',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'log-301',
      user_id: adminId,
      user_name: 'Victoria Vance',
      department: 'Executive',
      action: 'SYSTEM_POLICY_UPDATE',
      module: 'Security & Compliance',
      details: { policy: 'JWT_LIFETIME_SET_8H', rls_enforced: true },
      ip_address: '192.168.1.10',
      created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    {
      id: 'log-302',
      user_id: managerFinanceId,
      user_name: 'Sarah Chen',
      department: 'Finance',
      action: 'WORKFLOW_EXECUTE',
      module: 'Workflows',
      details: { workflow_id: 'wf-101', trigger: 'manual_verification', outcome: 'PASSED' },
      ip_address: '192.168.1.45',
      created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
    {
      id: 'log-303',
      user_id: managerOpsId,
      user_name: 'David O’Connor',
      department: 'Operations',
      action: 'DOCUMENT_UPLOAD',
      module: 'Documents',
      details: { doc_id: 'doc-203', file_type: 'text/plain', parsed: true },
      ip_address: '192.168.2.14',
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
  ];

  return { users, workflows, documents, auditLogs };
}

class DatabaseManager {
  private data: {
    users: User[];
    workflows: Workflow[];
    documents: DocumentRecord[];
    auditLogs: AuditLog[];
  };

  constructor() {
    this.data = this.loadData();
    this.tryInitPostgres();
  }

  private async tryInitPostgres() {
    if (process.env.DATABASE_URL) {
      try {
        const status = await testPostgresConnection();
        if (status.connected) {
          console.log('[PostgreSQL]: Connection verified to external database.');
          await initPostgresSchema();
          await this.syncToPostgresIfEmpty();
        } else {
          console.warn('[PostgreSQL]: External database unavailable. Operating via persistent storage engine.');
        }
      } catch (err: any) {
        console.warn('[PostgreSQL]: Notice on connection check:', err.message);
      }
    }
  }

  private async syncToPostgresIfEmpty() {
    try {
      const res = await executeQuery('SELECT COUNT(*) as count FROM users');
      if (res && parseInt(res.rows[0].count, 10) === 0) {
        console.log('[PostgreSQL]: Populating initial enterprise entities...');
        for (const u of this.data.users) {
          await executeQuery(
            'INSERT INTO users (id, name, email, password_hash, role, department, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (email) DO NOTHING',
            [u.id, u.name, u.email, u.password_hash, u.role, u.department, u.created_at, u.updated_at]
          );
        }
        for (const w of this.data.workflows) {
          await executeQuery(
            'INSERT INTO workflows (id, name, description, trigger_event, action_type, is_active, department, created_by, created_by_name, created_at, execution_count, last_executed) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
            [w.id, w.name, w.description, w.trigger_event, w.action_type, w.is_active, w.department, w.created_by, w.created_by_name, w.created_at, w.execution_count || 0, w.last_executed || null]
          );
        }
        for (const d of this.data.documents) {
          await executeQuery(
            'INSERT INTO documents (id, title, file_type, storage_url, extracted_data, status, uploaded_by, uploaded_by_name, department, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
            [d.id, d.title, d.file_type, d.storage_url, JSON.stringify(d.extracted_data), d.status, d.uploaded_by, d.uploaded_by_name, d.department, d.created_at]
          );
        }
        for (const l of this.data.auditLogs) {
          await executeQuery(
            'INSERT INTO audit_logs (id, user_id, user_name, department, action, module, details, ip_address, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [l.id, l.user_id, l.user_name, l.department, l.action, l.module, JSON.stringify(l.details), l.ip_address, l.created_at]
          );
        }
        console.log('[PostgreSQL]: Initial data populated successfully.');
      }
    } catch (e: any) {
      console.warn('[PostgreSQL Sync Warning]:', e.message);
    }
  }

  private loadData() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not read existing db file, initializing fresh store:', err);
    }
    const initial = generateInitialData();
    this.persist(initial);
    return initial;
  }

  private persist(data: any) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist db file:', err);
    }
  }

  private save() {
    this.persist(this.data);
  }

  // --- Users ---
  async findUserByEmailAsync(email: string): Promise<User | undefined> {
    if (isPostgresReady()) {
      try {
        const res = await executeQuery<User>('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
        if (res && res.rows.length > 0) return res.rows[0];
      } catch (err) {
        console.warn('[PostgreSQL query failed, using local store]:', err);
      }
    }
    return this.findUserByEmail(email);
  }

  findUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  async findUserByIdAsync(id: string): Promise<User | undefined> {
    if (isPostgresReady()) {
      try {
        const res = await executeQuery<User>('SELECT * FROM users WHERE id = $1', [id]);
        if (res && res.rows.length > 0) return res.rows[0];
      } catch (err) {
        console.warn('[PostgreSQL query failed, using local store]:', err);
      }
    }
    return this.findUserById(id);
  }

  findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  async createUserAsync(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const newUser = this.createUser(userData);
    if (isPostgresReady()) {
      try {
        await executeQuery(
          'INSERT INTO users (id, name, email, password_hash, role, department, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [newUser.id, newUser.name, newUser.email, newUser.password_hash, newUser.role, newUser.department, newUser.created_at, newUser.updated_at]
        );
      } catch (err) {
        console.warn('[PostgreSQL Insert User warning]:', err);
      }
    }
    return newUser;
  }

  createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
    const newUser: User = {
      ...userData,
      id: 'd8f075d9-' + Math.random().toString(36).substring(2, 6) + '-4c2f-b4c1-' + Math.random().toString(36).substring(2, 14),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  getAllUsers(): Omit<User, 'password_hash'>[] {
    return this.data.users.map(({ password_hash, ...rest }) => rest);
  }

  // --- Workflows (with RLS) ---
  async getWorkflowsAsync(user: User): Promise<Workflow[]> {
    if (isPostgresReady()) {
      try {
        let res;
        if (user.role === 'admin') {
          res = await executeQuery<Workflow>('SELECT * FROM workflows ORDER BY created_at DESC');
        } else {
          res = await executeQuery<Workflow>('SELECT * FROM workflows WHERE LOWER(department) = LOWER($1) ORDER BY created_at DESC', [user.department]);
        }
        if (res) return res.rows;
      } catch (err) {
        console.warn('[PostgreSQL getWorkflows failed]:', err);
      }
    }
    return this.getWorkflows(user);
  }

  getWorkflows(user: User): Workflow[] {
    if (user.role === 'admin') {
      return this.data.workflows;
    }
    return this.data.workflows.filter((w) => w.department.toLowerCase() === user.department.toLowerCase());
  }

  async createWorkflowAsync(workflowData: {
    name: string;
    description?: string;
    trigger_event: string;
    action_type: string;
    is_active?: boolean;
    department?: string;
    user: User;
  }): Promise<Workflow> {
    const newWorkflow = this.createWorkflow(workflowData);
    if (isPostgresReady()) {
      try {
        await executeQuery(
          'INSERT INTO workflows (id, name, description, trigger_event, action_type, is_active, department, created_by, created_by_name, created_at, execution_count) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0)',
          [
            newWorkflow.id,
            newWorkflow.name,
            newWorkflow.description,
            newWorkflow.trigger_event,
            newWorkflow.action_type,
            newWorkflow.is_active,
            newWorkflow.department,
            newWorkflow.created_by,
            newWorkflow.created_by_name,
            newWorkflow.created_at,
          ]
        );
      } catch (err) {
        console.warn('[PostgreSQL createWorkflow warning]:', err);
      }
    }
    return newWorkflow;
  }

  createWorkflow(workflowData: {
    name: string;
    description?: string;
    trigger_event: string;
    action_type: string;
    is_active?: boolean;
    department?: string;
    user: User;
  }): Workflow {
    const newWorkflow: Workflow = {
      id: 'a1e490fc-' + Math.random().toString(36).substring(2, 6) + '-4e9b-90f7-' + Math.random().toString(36).substring(2, 14),
      name: workflowData.name,
      description: workflowData.description || '',
      trigger_event: workflowData.trigger_event,
      action_type: workflowData.action_type,
      is_active: workflowData.is_active !== undefined ? workflowData.is_active : true,
      department: workflowData.department || workflowData.user.department,
      created_by: workflowData.user.id,
      created_by_name: workflowData.user.name,
      created_at: new Date().toISOString(),
      execution_count: 0,
    };
    this.data.workflows.unshift(newWorkflow);
    this.save();
    return newWorkflow;
  }

  async toggleWorkflowAsync(id: string, user: User): Promise<Workflow | null> {
    const wf = this.toggleWorkflow(id, user);
    if (wf && isPostgresReady()) {
      try {
        await executeQuery('UPDATE workflows SET is_active = $1 WHERE id = $2', [wf.is_active, id]);
      } catch (err) {
        console.warn('[PostgreSQL toggleWorkflow warning]:', err);
      }
    }
    return wf;
  }

  toggleWorkflow(id: string, user: User): Workflow | null {
    const wf = this.data.workflows.find((w) => w.id === id);
    if (!wf) return null;
    if (user.role !== 'admin' && user.department.toLowerCase() !== wf.department.toLowerCase()) {
      return null;
    }
    wf.is_active = !wf.is_active;
    this.save();
    return wf;
  }

  async deleteWorkflowAsync(id: string, user: User): Promise<boolean> {
    const success = this.deleteWorkflow(id, user);
    if (success && isPostgresReady()) {
      try {
        await executeQuery('DELETE FROM workflows WHERE id = $1', [id]);
      } catch (err) {
        console.warn('[PostgreSQL deleteWorkflow warning]:', err);
      }
    }
    return success;
  }

  deleteWorkflow(id: string, user: User): boolean {
    const index = this.data.workflows.findIndex((w) => w.id === id);
    if (index === -1) return false;
    const wf = this.data.workflows[index];
    if (user.role !== 'admin' && (user.role !== 'manager' || user.department.toLowerCase() !== wf.department.toLowerCase())) {
      return false;
    }
    this.data.workflows.splice(index, 1);
    this.save();
    return true;
  }

  executeWorkflow(id: string, user: User, inputPayload?: any): Workflow | null {
    const wf = this.data.workflows.find((w) => w.id === id);
    if (!wf) return null;
    wf.last_executed = new Date().toISOString();
    wf.execution_count = (wf.execution_count || 0) + 1;
    this.save();

    if (isPostgresReady()) {
      executeQuery('UPDATE workflows SET last_executed = $1, execution_count = execution_count + 1 WHERE id = $2', [wf.last_executed, id]).catch(() => {});
    }

    this.recordAuditLog({
      user_id: user.id,
      user_name: user.name,
      department: user.department,
      action: 'WORKFLOW_EXECUTE',
      module: 'Workflows',
      details: { workflow_id: wf.id, name: wf.name, payload: inputPayload || {} },
      ip_address: '127.0.0.1',
    });
    return wf;
  }

  // --- Documents (with RLS) ---
  async getDocumentsAsync(user: User): Promise<DocumentRecord[]> {
    if (isPostgresReady()) {
      try {
        let res;
        if (user.role === 'admin') {
          res = await executeQuery<DocumentRecord>('SELECT * FROM documents ORDER BY created_at DESC');
        } else {
          res = await executeQuery<DocumentRecord>('SELECT * FROM documents WHERE LOWER(department) = LOWER($1) ORDER BY created_at DESC', [user.department]);
        }
        if (res) return res.rows;
      } catch (err) {
        console.warn('[PostgreSQL getDocuments failed]:', err);
      }
    }
    return this.getDocuments(user);
  }

  getDocuments(user: User): DocumentRecord[] {
    if (user.role === 'admin') {
      return this.data.documents;
    }
    return this.data.documents.filter((d) => d.department.toLowerCase() === user.department.toLowerCase());
  }

  async createDocumentAsync(doc: {
    title: string;
    file_type: string;
    storage_url: string;
    extracted_data: DocumentRecord['extracted_data'];
    status: DocumentRecord['status'];
    user: User;
  }): Promise<DocumentRecord> {
    const newDoc = this.createDocument(doc);
    if (isPostgresReady()) {
      try {
        await executeQuery(
          'INSERT INTO documents (id, title, file_type, storage_url, extracted_data, status, uploaded_by, uploaded_by_name, department, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
          [
            newDoc.id,
            newDoc.title,
            newDoc.file_type,
            newDoc.storage_url,
            JSON.stringify(newDoc.extracted_data),
            newDoc.status,
            newDoc.uploaded_by,
            newDoc.uploaded_by_name,
            newDoc.department,
            newDoc.created_at,
          ]
        );
      } catch (err) {
        console.warn('[PostgreSQL createDocument warning]:', err);
      }
    }
    return newDoc;
  }

  createDocument(doc: {
    title: string;
    file_type: string;
    storage_url: string;
    extracted_data: DocumentRecord['extracted_data'];
    status: DocumentRecord['status'];
    user: User;
  }): DocumentRecord {
    const newDoc: DocumentRecord = {
      id: 'b2c581ad-' + Math.random().toString(36).substring(2, 6) + '-4f0c-a1e8-' + Math.random().toString(36).substring(2, 14),
      title: doc.title,
      file_type: doc.file_type,
      storage_url: doc.storage_url,
      extracted_data: doc.extracted_data,
      status: doc.status,
      uploaded_by: doc.user.id,
      uploaded_by_name: doc.user.name,
      department: doc.user.department,
      created_at: new Date().toISOString(),
    };
    this.data.documents.unshift(newDoc);
    this.save();

    this.recordAuditLog({
      user_id: doc.user.id,
      user_name: doc.user.name,
      department: doc.user.department,
      action: 'DOCUMENT_INGEST',
      module: 'Documents',
      details: {
        doc_id: newDoc.id,
        title: newDoc.title,
        documentType: doc.extracted_data?.documentType,
        riskScore: doc.extracted_data?.riskScore,
      },
      ip_address: '127.0.0.1',
    });

    return newDoc;
  }

  // --- Audit Logs ---
  async getAuditLogsAsync(user: User): Promise<AuditLog[]> {
    if (isPostgresReady()) {
      try {
        let res;
        if (user.role === 'admin') {
          res = await executeQuery<AuditLog>('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100');
        } else {
          res = await executeQuery<AuditLog>('SELECT * FROM audit_logs WHERE LOWER(department) = LOWER($1) ORDER BY created_at DESC LIMIT 100', [user.department]);
        }
        if (res) return res.rows;
      } catch (err) {
        console.warn('[PostgreSQL getAuditLogs failed]:', err);
      }
    }
    return this.getAuditLogs(user);
  }

  getAuditLogs(user: User): AuditLog[] {
    if (user.role === 'admin') {
      return this.data.auditLogs;
    }
    return this.data.auditLogs.filter((log) => log.department?.toLowerCase() === user.department.toLowerCase());
  }

  recordAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>): AuditLog {
    const newLog: AuditLog = {
      ...log,
      id: 'c3d692be-' + Math.random().toString(36).substring(2, 6) + '-5a1d-b2f9-' + Math.random().toString(36).substring(2, 14),
      created_at: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(newLog);
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs.pop();
    }
    this.save();

    if (isPostgresReady()) {
      executeQuery(
        'INSERT INTO audit_logs (id, user_id, user_name, department, action, module, details, ip_address, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [newLog.id, newLog.user_id, newLog.user_name, newLog.department, newLog.action, newLog.module, JSON.stringify(newLog.details), newLog.ip_address, newLog.created_at]
      ).catch(() => {});
    }

    return newLog;
  }

  // --- Metrics ---
  getMetrics(user: User) {
    const accessibleWorkflows = this.getWorkflows(user);
    const accessibleDocs = this.getDocuments(user);
    const accessibleLogs = this.getAuditLogs(user);

    const activeWorkflows = accessibleWorkflows.filter((w) => w.is_active).length;
    const totalExecutions = accessibleWorkflows.reduce((acc, curr) => acc + (curr.execution_count || 0), 0);
    const highRiskDocs = accessibleDocs.filter((d) => (d.extracted_data?.riskScore || 0) > 30).length;

    return {
      activeWorkflows,
      totalWorkflows: accessibleWorkflows.length,
      totalExecutions,
      documentsIngested: accessibleDocs.length,
      highRiskFlags: highRiskDocs,
      auditEventsRecorded: accessibleLogs.length,
      estimatedHoursSaved: Math.round(totalExecutions * 0.45 + accessibleDocs.length * 0.6),
      automationCostSavingsUSD: Math.round((totalExecutions * 0.45 + accessibleDocs.length * 0.6) * 78),
      operationalVelocityIndex: 96.4,
      tokenUsageSummary: {
        totalTokensProcessed: 2489000,
        averageLatencyMs: 240,
        monthlyQuotaUsedPercent: 34.2,
      },
      departmentDistribution: [
        { department: 'Finance', count: this.data.workflows.filter((w) => w.department === 'Finance').length, throughput: 94 },
        { department: 'Operations', count: this.data.workflows.filter((w) => w.department === 'Operations').length, throughput: 98 },
        { department: 'HR', count: this.data.workflows.filter((w) => w.department === 'HR').length, throughput: 89 },
        { department: 'Sales', count: this.data.workflows.filter((w) => w.department === 'Sales').length, throughput: 91 },
        { department: 'Executive', count: this.data.workflows.filter((w) => w.department === 'Executive').length, throughput: 99 },
      ],
      bottlenecks: [
        {
          id: 'bn-1',
          department: 'Finance',
          title: 'Manual Vendor Re-authentication Delay',
          severity: 'medium',
          impactHours: 14.5,
          recommendation: 'Enable auto-matching for vendors with > 12 month clean audit trail.',
        },
        {
          id: 'bn-2',
          department: 'IT Support',
          title: 'Off-hours Ticket Triage Queue Overflow',
          severity: 'high',
          impactHours: 28.0,
          recommendation: 'Deploy Gemini automated response agent for Tier-1 connectivity queries.',
        },
      ],
    };
  }
}

export const db = new DatabaseManager();
