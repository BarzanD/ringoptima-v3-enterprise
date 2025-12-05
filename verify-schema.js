// ═══════════════════════════════════════════════════════════════════════════════
// Script för att verifiera att SQL-schemat körts korrekt
// ═══════════════════════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oyfncmnlmxlwpswbsgwb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_sugSI9yHvELgUZ0wcx5Wmw_bUmzeWbV';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TABLES_TO_CHECK = [
  { name: 'batches', description: 'Importerade kontaktlistor' },
  { name: 'contacts', description: 'Huvudtabell för kontakter' },
  { name: 'saved_filters', description: 'Sparade filterinställningar' },
  { name: 'call_log', description: 'Samtalshistorik' },
];

async function verifySchema() {
  console.log('🔍 Kontrollerar SQL-schema i Supabase...\n');
  
  let allTablesExist = true;
  const results = [];

  for (const table of TABLES_TO_CHECK) {
    try {
      // Försök hämta data från tabellen (SELECT med LIMIT 0 för att bara testa att tabellen finns)
      const { data, error } = await supabase
        .from(table.name)
        .select('*')
        .limit(0);

      if (error) {
        // Om felet är att tabellen inte finns
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.log(`❌ ${table.name} - Tabellen finns INTE`);
          results.push({ table: table.name, exists: false, error: error.message });
          allTablesExist = false;
        } else {
          // Annat fel (t.ex. RLS policy) - tabellen finns men vi kan inte komma åt den
          console.log(`⚠️  ${table.name} - Tabellen finns men kan inte verifieras: ${error.message}`);
          results.push({ table: table.name, exists: true, warning: error.message });
        }
      } else {
        console.log(`✅ ${table.name} - Tabellen finns! (${table.description})`);
        results.push({ table: table.name, exists: true });
      }
    } catch (err) {
      console.log(`❌ ${table.name} - Fel vid kontroll: ${err.message}`);
      results.push({ table: table.name, exists: false, error: err.message });
      allTablesExist = false;
    }
  }

  // Kontrollera view
  console.log('\n📊 Kontrollerar view...');
  try {
    const { data, error } = await supabase
      .from('contact_stats')
      .select('*')
      .limit(1);

    if (error) {
      console.log(`⚠️  contact_stats view - ${error.message}`);
    } else {
      console.log(`✅ contact_stats view - Finns!`);
    }
  } catch (err) {
    console.log(`⚠️  contact_stats view - ${err.message}`);
  }

  // Sammanfattning
  console.log('\n' + '═'.repeat(60));
  if (allTablesExist) {
    console.log('✅ ALLA TABELLER FINNS! SQL-schemat är korrekt installerat.');
    console.log('\n🎉 Du kan nu använda Ringoptima V3 Enterprise!');
    console.log('🔗 Öppna: http://localhost:5173/ringoptima-v3-enterprise/');
  } else {
    console.log('❌ NÅGRA TABELLER SAKNAS!');
    console.log('\n📋 Gör följande:');
    console.log('   1. Gå till: https://supabase.com/dashboard/project/oyfncmnlmxlwpswbsgwb/sql');
    console.log('   2. Klicka "New Query"');
    console.log('   3. Kopiera innehållet från supabase-schema.sql');
    console.log('   4. Klicka "Run"');
    console.log('\n💡 SQL-fil finns här: supabase-schema.sql');
  }
  console.log('═'.repeat(60) + '\n');

  return allTablesExist;
}

verifySchema().catch(console.error);

