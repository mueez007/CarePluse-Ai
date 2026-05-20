// Run Supabase migration using the Supabase JS client
// Usage: node scripts/migrate-supabase.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://frdasumrdqjlsxxtbnnk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_S8s4VbVV10MfIqGXqJd7cA_xYTRNXi2';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Read the migration SQL file
const sqlPath = join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql');
const sql = readFileSync(sqlPath, 'utf-8');

// Split into individual statements (can't run multi-statement via rpc)
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`Found ${statements.length} SQL statements to execute.\n`);

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i];
  const preview = stmt.substring(0, 80).replace(/\n/g, ' ');
  console.log(`[${i + 1}/${statements.length}] ${preview}...`);
  
  const { data, error } = await supabase.rpc('', { query: stmt });
  
  if (error) {
    // Try direct fetch as fallback
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ query: stmt }),
    });
    
    if (!res.ok) {
      console.log(`   ⚠ Supabase RPC not available. Will use SQL Editor approach.`);
      break;
    }
  }
  
  console.log(`   ✓ Done`);
}

// If we couldn't run via RPC, try a simple test query to verify connection
console.log('\nTesting Supabase connection...');
const { data, error } = await supabase.from('users').select('count').limit(0);
if (error && error.code === '42P01') {
  console.log('⚠ Tables do not exist yet. Please run the migration SQL manually:');
  console.log('  1. Open https://supabase.com/dashboard/project/frdasumrdqjlsxxtbnnk/sql/new');
  console.log('  2. Paste contents of supabase/migrations/001_initial_schema.sql');
  console.log('  3. Click "Run"');
} else if (error) {
  console.log('Connection error:', error.message);
} else {
  console.log('✓ Connected to Supabase successfully! Tables exist.');
}
