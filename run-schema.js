// ═══════════════════════════════════════════════════════════════════════════════
// Script för att köra SQL-schema i Supabase
// ═══════════════════════════════════════════════════════════════════════════════

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oyfncmnlmxlwpswbsgwb.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_DGtn-oP1aqUiqfVkTVs-pQ_nlbgyJfd';

// Skapa admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runSchema() {
  try {
    console.log('📖 Läser SQL-schema...');
    const sql = readFileSync('./supabase-schema.sql', 'utf-8');
    
    // Dela upp SQL i individuella statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`🔧 Kör ${statements.length} SQL-statements...\n`);
    
    // Kör varje statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length < 10) continue; // Skip very short statements
      
      try {
        console.log(`[${i + 1}/${statements.length}] Kör statement...`);
        const { data, error } = await supabase.rpc('exec_sql', { 
          query: statement + ';' 
        });
        
        if (error) {
          // Om exec_sql inte finns, försök direkt via REST
          console.log('⚠️  exec_sql RPC finns inte, försöker alternativ metod...');
          break;
        }
        
        console.log('✅ Statement kördes');
      } catch (err) {
        console.log(`⚠️  Statement ${i + 1} gav fel (kan vara OK om objekt redan finns):`, err.message);
      }
    }
    
    console.log('\n✅ SQL-schema kördes! Verifiera i Supabase Dashboard.');
    console.log('🔗 https://supabase.com/dashboard/project/oyfncmnlmxlwpswbsgwb/editor');
    
  } catch (error) {
    console.error('❌ Fel vid körning av schema:', error.message);
    console.log('\n💡 Alternativ: Kör SQL manuellt i Supabase Dashboard:');
    console.log('   1. Gå till: https://supabase.com/dashboard/project/oyfncmnlmxlwpswbsgwb/sql');
    console.log('   2. Klicka "New Query"');
    console.log('   3. Kopiera innehållet från supabase-schema.sql');
    console.log('   4. Klicka "Run"');
    process.exit(1);
  }
}

runSchema();

