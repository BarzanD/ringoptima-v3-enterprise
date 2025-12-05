// ═══════════════════════════════════════════════════════════════════════════════
// RINGOPTIMA V3 ENTERPRISE - SUPABASE CLIENT
// ═══════════════════════════════════════════════════════════════════════════════
//
// ⚠️ KRITISKT: Skapa NYTT Supabase-projekt och använd EGNA credentials!
// 1. Gå till https://supabase.com → New Project
// 2. Kopiera Project URL och anon key från Settings → API
// 3. Skapa .env fil med VITE_SUPABASE_URL och VITE_SUPABASE_ANON_KEY
//
// ═══════════════════════════════════════════════════════════════════════════════

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Hämta credentials från environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validera att credentials finns
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(`
╔════════════════════════════════════════════════════════════════════╗
║  ⚠️  SUPABASE CREDENTIALS SAKNAS                                   ║
╠════════════════════════════════════════════════════════════════════╣
║  Skapa en .env fil i projektets rot med:                           ║
║                                                                    ║
║  VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co               ║
║  VITE_SUPABASE_ANON_KEY=your-anon-key                             ║
║                                                                    ║
║  Instruktioner:                                                    ║
║  1. Skapa nytt projekt på https://supabase.com                    ║
║  2. Gå till Settings → API                                        ║
║  3. Kopiera Project URL och anon/public key                       ║
║  4. Kör SQL-schemat från supabase-schema.sql                      ║
╚════════════════════════════════════════════════════════════════════╝
  `);
}

// Skapa Supabase-klient med optimerade inställningar
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: false, // Ingen autentisering krävs
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-application-name': 'ringoptima-v3-enterprise',
      },
    },
  }
);

// Export för enkel åtkomst till credentials-status
export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Typ-export för databas
export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: number;
          batch_id: number | null;
          name: string;
          org: string;
          address: string;
          city: string;
          phones: string;
          users: string;
          operators: string;
          contact: string;
          role: string;
          notes: string;
          priority: string;
          status: string;
          last_called: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['contacts']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['contacts']['Insert']>;
      };
      batches: {
        Row: {
          id: number;
          name: string;
          file_name: string;
          count: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['batches']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['batches']['Insert']>;
      };
      saved_filters: {
        Row: {
          id: number;
          name: string;
          filter: Record<string, unknown>;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['saved_filters']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['saved_filters']['Insert']>;
      };
      call_log: {
        Row: {
          id: number;
          contact_id: number;
          note: string;
          outcome: string;
          duration_seconds: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['call_log']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['call_log']['Insert']>;
      };
    };
  };
};

