// Execute migration SQL against Supabase PostgreSQL
// Usage: node scripts/run-migration.mjs

import pg from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new pg.Client({
  host: 'db.frdasumrdqjlsxxtbnnk.supabase.co',
  port: 5432,
  user: 'postgres',
  password: 'hfZY&/fNxFE6.xx',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

try {
  console.log('Connecting to Supabase PostgreSQL...');
  await client.connect();
  console.log('✓ Connected!\n');

  const sqlPath = join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql');
  const sql = readFileSync(sqlPath, 'utf-8');

  console.log('Running migration...');
  await client.query(sql);
  console.log('✓ Migration completed successfully!\n');

  // Verify tables exist
  const result = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('users', 'sessions', 'user_profiles')
    ORDER BY table_name;
  `);

  console.log('Verified tables:');
  result.rows.forEach(row => console.log(`  ✓ ${row.table_name}`));

} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
