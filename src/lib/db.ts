// ═══════════════════════════════════════════════════════════════════════════════
// RINGOPTIMA V3 ENTERPRISE - DATABASE LAYER
// ═══════════════════════════════════════════════════════════════════════════════

import { supabase, isConfigured } from './supabase';
import type { Contact, Batch, SavedFilter, CallLog, Filter, NewContact, ContactUpdate } from '../types';

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER: Konvertera snake_case till camelCase
// ═══════════════════════════════════════════════════════════════════════════════

function toSnakeCase<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`);
    result[snakeKey] = obj[key];
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class RingoptimaDB {
  private checkConfig(): void {
    if (!isConfigured) {
      throw new Error('Supabase är inte konfigurerad. Skapa .env fil med credentials.');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  async addBatch(batch: Omit<Batch, 'id' | 'createdAt'>): Promise<number> {
    this.checkConfig();
    
    const { data, error } = await supabase
      .from('batches')
      .insert({
        name: batch.name,
        file_name: batch.fileName,
        count: batch.count,
      })
      .select('id')
      .single();

    if (error) throw new Error(`Kunde inte skapa batch: ${error.message}`);
    return data.id;
  }

  async getAllBatches(): Promise<Batch[]> {
    this.checkConfig();
    
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Kunde inte hämta batchar: ${error.message}`);
    
    return (data || []).map(b => ({
      id: b.id,
      name: b.name,
      fileName: b.file_name,
      count: b.count,
      createdAt: b.created_at,
    }));
  }

  async updateBatchCount(id: number, count: number): Promise<void> {
    this.checkConfig();
    
    const { error } = await supabase
      .from('batches')
      .update({ count })
      .eq('id', id);

    if (error) throw new Error(`Kunde inte uppdatera batch: ${error.message}`);
  }

  async deleteBatch(id: number): Promise<void> {
    this.checkConfig();
    
    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Kunde inte radera batch: ${error.message}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTACT OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  async addContacts(contacts: NewContact[]): Promise<void> {
    this.checkConfig();
    
    // Batch insert i grupper om 500 för prestanda
    const BATCH_SIZE = 500;
    
    for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
      const batch = contacts.slice(i, i + BATCH_SIZE);
      
      const rows = batch.map(c => ({
        batch_id: c.batchId,
        name: c.name,
        org: c.org,
        address: c.address,
        city: c.city,
        phones: c.phones,
        users: c.users,
        operators: c.operators,
        contact: c.contact,
        role: c.role,
        notes: c.notes,
        priority: c.priority,
        status: c.status,
      }));

      const { error } = await supabase
        .from('contacts')
        .insert(rows);

      if (error) throw new Error(`Kunde inte lägga till kontakter: ${error.message}`);
    }
  }

  async getAllContacts(): Promise<Contact[]> {
    this.checkConfig();
    
    // Paginerad hämtning för stora dataset
    const PAGE_SIZE = 1000;
    const allContacts: Contact[] = [];
    let page = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (error) throw new Error(`Kunde inte hämta kontakter: ${error.message}`);
      
      if (!data || data.length === 0) {
        hasMore = false;
      } else {
        const mapped = data.map(c => this.mapContact(c));
        allContacts.push(...mapped);
        hasMore = data.length === PAGE_SIZE;
        page++;
      }
    }

    return allContacts;
  }

  async getContactsByBatch(batchId: number): Promise<Contact[]> {
    this.checkConfig();
    
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('batch_id', batchId)
      .order('name', { ascending: true });

    if (error) throw new Error(`Kunde inte hämta kontakter: ${error.message}`);
    
    return (data || []).map(c => this.mapContact(c));
  }

  async getContact(id: number): Promise<Contact | undefined> {
    this.checkConfig();
    
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return undefined;
    return this.mapContact(data);
  }

  async updateContact(id: number, updates: ContactUpdate): Promise<void> {
    this.checkConfig();
    
    const snakeUpdates = toSnakeCase(updates as Record<string, unknown>);
    
    const { error } = await supabase
      .from('contacts')
      .update(snakeUpdates)
      .eq('id', id);

    if (error) throw new Error(`Kunde inte uppdatera kontakt: ${error.message}`);
  }

  async deleteContact(id: number): Promise<void> {
    this.checkConfig();
    
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Kunde inte radera kontakt: ${error.message}`);
  }

  async deleteContactsByBatch(batchId: number): Promise<void> {
    this.checkConfig();
    
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('batch_id', batchId);

    if (error) throw new Error(`Kunde inte radera kontakter: ${error.message}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SAVED FILTERS
  // ═══════════════════════════════════════════════════════════════════════════

  async addSavedFilter(name: string, filter: Filter): Promise<number> {
    this.checkConfig();
    
    const { data, error } = await supabase
      .from('saved_filters')
      .insert({ name, filter })
      .select('id')
      .single();

    if (error) throw new Error(`Kunde inte spara filter: ${error.message}`);
    return data.id;
  }

  async getAllSavedFilters(): Promise<SavedFilter[]> {
    this.checkConfig();
    
    const { data, error } = await supabase
      .from('saved_filters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Kunde inte hämta filter: ${error.message}`);
    
    return (data || []).map(f => ({
      id: f.id,
      name: f.name,
      filter: f.filter as Filter,
      createdAt: f.created_at,
    }));
  }

  async deleteSavedFilter(id: number): Promise<void> {
    this.checkConfig();
    
    const { error } = await supabase
      .from('saved_filters')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Kunde inte radera filter: ${error.message}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CALL LOG
  // ═══════════════════════════════════════════════════════════════════════════

  async addCallLog(log: Omit<CallLog, 'id' | 'createdAt'>): Promise<number> {
    this.checkConfig();
    
    const { data, error } = await supabase
      .from('call_log')
      .insert({
        contact_id: log.contactId,
        note: log.note,
        outcome: log.outcome,
        duration_seconds: log.durationSeconds,
      })
      .select('id')
      .single();

    if (error) throw new Error(`Kunde inte logga samtal: ${error.message}`);
    return data.id;
  }

  async getCallLogs(contactId: number): Promise<CallLog[]> {
    this.checkConfig();
    
    const { data, error } = await supabase
      .from('call_log')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Kunde inte hämta samtalslogg: ${error.message}`);
    
    return (data || []).map(l => ({
      id: l.id,
      contactId: l.contact_id,
      note: l.note,
      outcome: l.outcome,
      durationSeconds: l.duration_seconds,
      createdAt: l.created_at,
    }));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATISTICS
  // ═══════════════════════════════════════════════════════════════════════════

  async getStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    this.checkConfig();
    
    // Använd view om den finns, annars räkna manuellt
    const { data, error } = await supabase
      .from('contact_stats')
      .select('*')
      .single();

    if (error || !data) {
      // Fallback: räkna manuellt
      const { count } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true });

      return {
        total: count || 0,
        byStatus: {},
        byPriority: {},
      };
    }

    return {
      total: data.total_contacts,
      byStatus: {
        new: data.new_count,
        contacted: data.contacted_count,
        interested: data.interested_count,
        not_interested: data.not_interested_count,
        converted: data.converted_count,
      },
      byPriority: {
        high: data.high_priority,
        medium: data.medium_priority,
        low: data.low_priority,
      },
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  private mapContact(row: Record<string, unknown>): Contact {
    return {
      id: row.id as number,
      batchId: row.batch_id as number | undefined,
      name: row.name as string,
      org: row.org as string,
      address: row.address as string,
      city: row.city as string,
      phones: row.phones as string,
      users: row.users as string,
      operators: row.operators as string,
      contact: row.contact as string,
      role: row.role as string,
      notes: row.notes as string,
      priority: row.priority as Contact['priority'],
      status: row.status as Contact['status'],
      lastCalled: row.last_called as string | undefined,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }
}

// Export singleton instance
export const db = new RingoptimaDB();

