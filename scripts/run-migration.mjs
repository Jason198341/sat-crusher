import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql'), 'utf-8');

// Read credentials from environment variables — NEVER hardcode secrets
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const projectRef = process.env.SUPABASE_PROJECT_REF;

if (!serviceRoleKey || !projectRef) {
  console.error('Missing required env vars: SUPABASE_SERVICE_ROLE_KEY, SUPABASE_PROJECT_REF');
  console.error('Usage: SUPABASE_SERVICE_ROLE_KEY=eyJ... SUPABASE_PROJECT_REF=abc... node scripts/run-migration.mjs');
  process.exit(1);
}

const configs = [
  {
    name: 'Pooler (Transaction mode)',
    connectionString: `postgresql://postgres.${projectRef}:${serviceRoleKey}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`,
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'Pooler (Session mode)',
    connectionString: `postgresql://postgres.${projectRef}:${serviceRoleKey}@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`,
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'Direct',
    connectionString: `postgresql://postgres:${serviceRoleKey}@db.${projectRef}.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false }
  }
];

for (const config of configs) {
  console.log(`\nTrying: ${config.name}...`);
  const client = new pg.Client({
    connectionString: config.connectionString,
    ssl: config.ssl,
    connectionTimeoutMillis: 10000
  });
  
  try {
    await client.connect();
    console.log('Connected! Running migration...');
    await client.query(sql);
    console.log('Migration complete!');
    
    // Verify
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    console.log('Tables created:', res.rows.map(r => r.table_name).join(', '));
    
    await client.end();
    process.exit(0);
  } catch (err) {
    console.log(`Failed: ${err.message}`);
    try { await client.end(); } catch {}
  }
}

console.log('\nAll connection methods failed. Please run the migration manually in SQL Editor.');
process.exit(1);
