import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

export interface PostgresStatus {
  connected: boolean;
  configured: boolean;
  databaseUrlProvided: boolean;
  activeClientCount: number;
  totalClientCount: number;
  idleClientCount: number;
  latencyMs?: number;
  error?: string;
  provider: 'Cloud SQL / PostgreSQL' | 'Local Persistent Store (Fallback)';
}

let pool: pg.Pool | null = null;
let isPostgresOperational = false;
let lastConnectionAttempt: Date | null = null;
let lastErrorMessage: string | null = null;

export function getPostgresPool(): pg.Pool | null {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return null;
  }

  if (!pool) {
    const isLocalhost = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
    pool = new Pool({
      connectionString: dbUrl,
      // For managed Cloud SQL, Neon, Supabase, or AWS RDS, enable SSL with rejectUnauthorized: false
      ssl: isLocalhost
        ? false
        : {
            rejectUnauthorized: false,
          },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('[PostgreSQL Pool Error]:', err.message);
      isPostgresOperational = false;
      lastErrorMessage = err.message;
    });
  }

  return pool;
}

/**
 * Verifies live connection to the configured PostgreSQL instance.
 * Returns detailed telemetry without crashing the process if offline.
 */
export async function testPostgresConnection(): Promise<PostgresStatus> {
  lastConnectionAttempt = new Date();
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    isPostgresOperational = false;
    return {
      connected: false,
      configured: false,
      databaseUrlProvided: false,
      activeClientCount: 0,
      totalClientCount: 0,
      idleClientCount: 0,
      provider: 'Local Persistent Store (Fallback)',
      error: 'DATABASE_URL environment variable is not defined in the environment.',
    };
  }

  const p = getPostgresPool();
  if (!p) {
    isPostgresOperational = false;
    return {
      connected: false,
      configured: true,
      databaseUrlProvided: true,
      activeClientCount: 0,
      totalClientCount: 0,
      idleClientCount: 0,
      provider: 'Local Persistent Store (Fallback)',
      error: 'Unable to initialize PostgreSQL pool.',
    };
  }

  const start = Date.now();
  try {
    const client = await p.connect();
    try {
      await client.query('SELECT 1 as health_check');
      const latencyMs = Date.now() - start;
      isPostgresOperational = true;
      lastErrorMessage = null;

      return {
        connected: true,
        configured: true,
        databaseUrlProvided: true,
        activeClientCount: p.totalCount - p.idleCount,
        totalClientCount: p.totalCount,
        idleClientCount: p.idleCount,
        latencyMs,
        provider: 'Cloud SQL / PostgreSQL',
      };
    } finally {
      client.release();
    }
  } catch (err: any) {
    isPostgresOperational = false;
    lastErrorMessage = err.message;
    return {
      connected: false,
      configured: true,
      databaseUrlProvided: true,
      activeClientCount: p.totalCount - p.idleCount,
      totalClientCount: p.totalCount,
      idleClientCount: p.idleCount,
      provider: 'Local Persistent Store (Fallback)',
      error: `PostgreSQL connection failed: ${err.message}`,
    };
  }
}

/**
 * Initializes database tables from database/schema.sql
 */
export async function initPostgresSchema(): Promise<{ success: boolean; message: string }> {
  const p = getPostgresPool();
  if (!p) {
    return { success: false, message: 'DATABASE_URL not configured' };
  }

  try {
    const schemaPath = path.resolve(process.cwd(), 'database/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      return { success: false, message: 'schema.sql not found at ' + schemaPath };
    }
    const sql = fs.readFileSync(schemaPath, 'utf-8');

    const client = await p.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      return { success: true, message: 'PostgreSQL schema initialized successfully' };
    } catch (err: any) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('[PostgreSQL Schema Init Error]:', err.message);
    return { success: false, message: err.message };
  }
}

/**
 * Parameterized Query helper with automatic client acquisition and release
 */
export async function executeQuery<T extends pg.QueryResultRow = any>(
  text: string,
  params: any[] = []
): Promise<pg.QueryResult<T> | null> {
  const p = getPostgresPool();
  if (!p || !isPostgresOperational) {
    return null;
  }

  const client = await p.connect();
  try {
    return await client.query<T>(text, params);
  } finally {
    client.release();
  }
}

export function isPostgresReady(): boolean {
  return isPostgresOperational;
}
