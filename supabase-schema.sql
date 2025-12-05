-- ═══════════════════════════════════════════════════════════════════════════════
-- RINGOPTIMA V3 ENTERPRISE - DATABASE SCHEMA
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- ⚠️ KRITISKT: Kör detta i ETT NYTT Supabase-projekt!
-- ANVÄND ALDRIG en befintlig databas - skapa alltid nytt projekt.
--
-- Instruktioner:
-- 1. Gå till https://supabase.com och skapa nytt projekt
-- 2. Öppna SQL Editor i Supabase Dashboard
-- 3. Kopiera och kör hela detta script
-- 4. Verifiera att tabellerna skapats under "Table Editor"
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- BATCHES TABLE - Importerade kontaktlistor
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS batches (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index för snabbare sortering
CREATE INDEX IF NOT EXISTS idx_batches_created_at ON batches(created_at DESC);

-- Row Level Security
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "batches_select" ON batches FOR SELECT USING (true);
CREATE POLICY "batches_insert" ON batches FOR INSERT WITH CHECK (true);
CREATE POLICY "batches_update" ON batches FOR UPDATE USING (true);
CREATE POLICY "batches_delete" ON batches FOR DELETE USING (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- CONTACTS TABLE - Huvudtabell för alla kontakter
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS contacts (
  id BIGSERIAL PRIMARY KEY,
  batch_id BIGINT REFERENCES batches(id) ON DELETE CASCADE,
  
  -- Företagsinformation
  name TEXT NOT NULL,
  org TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  
  -- Kontaktinformation (newline-separerade för multipla värden)
  phones TEXT DEFAULT '',
  users TEXT DEFAULT '',
  operators TEXT DEFAULT '',
  contact TEXT DEFAULT '',
  role TEXT DEFAULT '',
  
  -- Arbetsflöde
  notes TEXT DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'not_interested', 'converted')),
  
  -- Metadata
  last_called TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optimerade index för vanliga frågor
CREATE INDEX IF NOT EXISTS idx_contacts_batch_id ON contacts(batch_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_priority ON contacts(priority);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_updated_at ON contacts(updated_at DESC);

-- Fulltext-sökning för snabbare textsökning
CREATE INDEX IF NOT EXISTS idx_contacts_name_gin ON contacts USING gin(to_tsvector('swedish', name));
CREATE INDEX IF NOT EXISTS idx_contacts_city_gin ON contacts USING gin(to_tsvector('swedish', city));

-- Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contacts_select" ON contacts FOR SELECT USING (true);
CREATE POLICY "contacts_insert" ON contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "contacts_update" ON contacts FOR UPDATE USING (true);
CREATE POLICY "contacts_delete" ON contacts FOR DELETE USING (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SAVED_FILTERS TABLE - Sparade filterinställningar
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS saved_filters (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  filter JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_filters_select" ON saved_filters FOR SELECT USING (true);
CREATE POLICY "saved_filters_insert" ON saved_filters FOR INSERT WITH CHECK (true);
CREATE POLICY "saved_filters_update" ON saved_filters FOR UPDATE USING (true);
CREATE POLICY "saved_filters_delete" ON saved_filters FOR DELETE USING (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- CALL_LOG TABLE - Samtalshistorik (ny tabell för enterprise)
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS call_log (
  id BIGSERIAL PRIMARY KEY,
  contact_id BIGINT REFERENCES contacts(id) ON DELETE CASCADE,
  note TEXT DEFAULT '',
  outcome TEXT CHECK (outcome IN ('answered', 'no_answer', 'voicemail', 'callback', 'wrong_number')),
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_log_contact_id ON call_log(contact_id);
CREATE INDEX IF NOT EXISTS idx_call_log_created_at ON call_log(created_at DESC);

ALTER TABLE call_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "call_log_select" ON call_log FOR SELECT USING (true);
CREATE POLICY "call_log_insert" ON call_log FOR INSERT WITH CHECK (true);
CREATE POLICY "call_log_delete" ON call_log FOR DELETE USING (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- TRIGGERS - Automatisk uppdatering av timestamps
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- VIEWS - Förberäknade vyer för Dashboard
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE VIEW contact_stats AS
SELECT 
  COUNT(*) as total_contacts,
  COUNT(*) FILTER (WHERE status = 'new') as new_count,
  COUNT(*) FILTER (WHERE status = 'contacted') as contacted_count,
  COUNT(*) FILTER (WHERE status = 'interested') as interested_count,
  COUNT(*) FILTER (WHERE status = 'not_interested') as not_interested_count,
  COUNT(*) FILTER (WHERE status = 'converted') as converted_count,
  COUNT(*) FILTER (WHERE priority = 'high') as high_priority,
  COUNT(*) FILTER (WHERE priority = 'medium') as medium_priority,
  COUNT(*) FILTER (WHERE priority = 'low') as low_priority,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'converted')::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as conversion_rate
FROM contacts;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SLUTFÖRT! Verifiera att allt skapades korrekt under "Table Editor"
-- ═══════════════════════════════════════════════════════════════════════════════

