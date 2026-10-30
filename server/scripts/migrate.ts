import dotenv from 'dotenv';
dotenv.config();

import { testPostgresConnection, initPostgresSchema } from '../postgres.js';

async function main() {
  console.log('====================================================');
  console.log(' Nexus-AI: Enterprise Database Migration Runner');
  console.log('====================================================');

  const status = await testPostgresConnection();
  console.log(`DATABASE_URL configured: ${status.databaseUrlProvided}`);
  console.log(`Live Connection Status: ${status.connected ? 'ONLINE (Connected)' : 'OFFLINE'}`);

  if (!status.connected) {
    console.error('\n[Database Notice]:');
    console.error(status.error || 'Could not establish connection to PostgreSQL.');
    console.log('\nTo connect Google Cloud SQL or a managed PostgreSQL instance:');
    console.log('1. Set DATABASE_URL in your environment or Secrets panel:');
    console.log('   DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"');
    console.log('2. Re-run "npm run db:migrate" to apply table schemas.\n');
    console.log('The Nexus-AI application will run with high-availability in-memory/JSON fallback.');
    process.exit(0);
  }

  console.log(`\nExecuting database migrations from /database/schema.sql...`);
  const res = await initPostgresSchema();
  if (res.success) {
    console.log('✓ Migration executed successfully! All tables, indexes, and constraints ready.');
    process.exit(0);
  } else {
    console.error('✗ Migration failed:', res.message);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal migration script error:', err);
  process.exit(1);
});
