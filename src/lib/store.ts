// ═══════════════════════════════════════════════════════════════════════════════
// RINGOPTIMA V3 ENTERPRISE - ZUSTAND STATE STORE
// ═══════════════════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Contact, Batch, Filter, SavedFilter, Tab, DashboardStats } from '../types';
import { filterContactsBySearch, sortContacts, calculateOperatorDistribution } from './utils';

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════════════════

const defaultFilter: Filter = {
  search: '',
  operator: '',
  status: '',
  priority: '',
  sort: 'recent',
  batchId: undefined,
  city: undefined,
};

// ═══════════════════════════════════════════════════════════════════════════════
// STORE INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════

interface RingoptimaStore {
  // Data
  contacts: Contact[];
  batches: Batch[];
  savedFilters: SavedFilter[];
  
  // Filter & UI state
  filter: Filter;
  activeTab: Tab;
  selectedContactId: number | null;
  isLoading: boolean;
  isModalOpen: boolean;
  isCommandPaletteOpen: boolean;
  isSidebarOpen: boolean;
  isOffline: boolean;
  
  // Computed (cached)
  _filteredContactsCache: Contact[] | null;
  _statsCache: DashboardStats | null;
  
  // Actions - Data
  setContacts: (contacts: Contact[]) => void;
  addContact: (contact: Contact) => void;
  updateContact: (id: number, updates: Partial<Contact>) => void;
  removeContact: (id: number) => void;
  
  setBatches: (batches: Batch[]) => void;
  addBatch: (batch: Batch) => void;
  removeBatch: (id: number) => void;
  
  setSavedFilters: (filters: SavedFilter[]) => void;
  addSavedFilter: (filter: SavedFilter) => void;
  removeSavedFilter: (id: number) => void;
  
  // Actions - Filter
  setFilter: (filter: Partial<Filter>) => void;
  resetFilter: () => void;
  loadSavedFilter: (filter: Filter) => void;
  
  // Actions - UI
  setActiveTab: (tab: Tab) => void;
  setSelectedContactId: (id: number | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsModalOpen: (open: boolean) => void;
  setIsCommandPaletteOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setIsOffline: (offline: boolean) => void;
  
  // Getters (computed values)
  getFilteredContacts: () => Contact[];
  getStats: () => DashboardStats;
  getOperatorDistribution: () => { name: string; value: number; color: string }[];
  getContactById: (id: number) => Contact | undefined;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STORE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

export const useStore = create<RingoptimaStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    contacts: [],
    batches: [],
    savedFilters: [],
    filter: defaultFilter,
    activeTab: 'contacts',
    selectedContactId: null,
    isLoading: true,
    isModalOpen: false,
    isCommandPaletteOpen: false,
    isSidebarOpen: true,
    isOffline: !navigator.onLine,
    _filteredContactsCache: null,
    _statsCache: null,
    
    // ═══════════════════════════════════════════════════════════════════════════
    // DATA ACTIONS
    // ═══════════════════════════════════════════════════════════════════════════
    
    setContacts: (contacts) => set({ 
      contacts, 
      _filteredContactsCache: null,
      _statsCache: null,
    }),
    
    addContact: (contact) => set((state) => ({ 
      contacts: [contact, ...state.contacts],
      _filteredContactsCache: null,
      _statsCache: null,
    })),
    
    updateContact: (id, updates) => set((state) => ({
      contacts: state.contacts.map((c) => 
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      ),
      _filteredContactsCache: null,
      _statsCache: null,
    })),
    
    removeContact: (id) => set((state) => ({
      contacts: state.contacts.filter((c) => c.id !== id),
      _filteredContactsCache: null,
      _statsCache: null,
    })),
    
    setBatches: (batches) => set({ batches }),
    
    addBatch: (batch) => set((state) => ({
      batches: [batch, ...state.batches],
    })),
    
    removeBatch: (id) => set((state) => ({
      batches: state.batches.filter((b) => b.id !== id),
      contacts: state.contacts.filter((c) => c.batchId !== id),
      _filteredContactsCache: null,
      _statsCache: null,
    })),
    
    setSavedFilters: (savedFilters) => set({ savedFilters }),
    
    addSavedFilter: (filter) => set((state) => ({
      savedFilters: [filter, ...state.savedFilters],
    })),
    
    removeSavedFilter: (id) => set((state) => ({
      savedFilters: state.savedFilters.filter((f) => f.id !== id),
    })),
    
    // ═══════════════════════════════════════════════════════════════════════════
    // FILTER ACTIONS
    // ═══════════════════════════════════════════════════════════════════════════
    
    setFilter: (filterUpdate) => set((state) => ({
      filter: { ...state.filter, ...filterUpdate },
      _filteredContactsCache: null,
    })),
    
    resetFilter: () => set({ 
      filter: defaultFilter,
      _filteredContactsCache: null,
    }),
    
    loadSavedFilter: (filter) => set({ 
      filter,
      _filteredContactsCache: null,
    }),
    
    // ═══════════════════════════════════════════════════════════════════════════
    // UI ACTIONS
    // ═══════════════════════════════════════════════════════════════════════════
    
    setActiveTab: (activeTab) => set({ activeTab }),
    
    setSelectedContactId: (selectedContactId) => set({ 
      selectedContactId,
      isModalOpen: selectedContactId !== null,
    }),
    
    setIsLoading: (isLoading) => set({ isLoading }),
    
    setIsModalOpen: (isModalOpen) => set({ 
      isModalOpen,
      selectedContactId: isModalOpen ? get().selectedContactId : null,
    }),
    
    setIsCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),
    
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    
    setIsOffline: (isOffline) => set({ isOffline }),
    
    // ═══════════════════════════════════════════════════════════════════════════
    // COMPUTED GETTERS
    // ═══════════════════════════════════════════════════════════════════════════
    
    getFilteredContacts: () => {
      const state = get();
      
      // Return cache if available
      if (state._filteredContactsCache) {
        return state._filteredContactsCache;
      }
      
      let filtered = [...state.contacts];
      const { search, operator, status, priority, sort, batchId, city } = state.filter;
      
      // Sök
      if (search) {
        filtered = filterContactsBySearch(filtered, search);
      }
      
      // Operatör
      if (operator) {
        filtered = filtered.filter((c) => 
          c.operators.toLowerCase().includes(operator.toLowerCase())
        );
      }
      
      // Status
      if (status) {
        filtered = filtered.filter((c) => c.status === status);
      }
      
      // Prioritet
      if (priority) {
        filtered = filtered.filter((c) => c.priority === priority);
      }
      
      // Batch
      if (batchId !== undefined) {
        filtered = filtered.filter((c) => c.batchId === batchId);
      }
      
      // Stad
      if (city) {
        filtered = filtered.filter((c) => 
          c.city.toLowerCase().includes(city.toLowerCase())
        );
      }
      
      // Sortering
      if (sort) {
        filtered = sortContacts(filtered, sort);
      }
      
      // Cache result
      set({ _filteredContactsCache: filtered });
      
      return filtered;
    },
    
    getStats: () => {
      const state = get();
      
      // Return cache if available
      if (state._statsCache) {
        return state._statsCache;
      }
      
      const contacts = state.contacts;
      const total = contacts.length;
      
      const statusCounts = {
        new: 0,
        contacted: 0,
        interested: 0,
        not_interested: 0,
        converted: 0,
      };
      
      const priorityCounts = {
        high: 0,
        medium: 0,
        low: 0,
      };
      
      contacts.forEach((c) => {
        statusCounts[c.status]++;
        priorityCounts[c.priority]++;
      });
      
      const engaged = statusCounts.contacted + statusCounts.interested + statusCounts.converted;
      const conversionRate = total > 0 ? (statusCounts.converted / total) * 100 : 0;
      const engagementRate = total > 0 ? (engaged / total) * 100 : 0;
      
      const stats: DashboardStats = {
        totalContacts: total,
        newCount: statusCounts.new,
        contactedCount: statusCounts.contacted,
        interestedCount: statusCounts.interested,
        notInterestedCount: statusCounts.not_interested,
        convertedCount: statusCounts.converted,
        highPriority: priorityCounts.high,
        mediumPriority: priorityCounts.medium,
        lowPriority: priorityCounts.low,
        conversionRate,
        engagementRate,
      };
      
      // Cache result
      set({ _statsCache: stats });
      
      return stats;
    },
    
    getOperatorDistribution: () => {
      const contacts = get().contacts;
      const dist = calculateOperatorDistribution(contacts);
      
      const colors: Record<string, string> = {
        telia: '#7B2D8E',
        tele2: '#00A0D1',
        tre: '#E4002B',
        telenor: '#00B0B9',
        other: '#6B7280',
      };
      
      return Object.entries(dist)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
          color: colors[name] || colors.other,
        }));
    },
    
    getContactById: (id) => {
      return get().contacts.find((c) => c.id === id);
    },
  }))
);

// ═══════════════════════════════════════════════════════════════════════════════
// SELECTORS
// ═══════════════════════════════════════════════════════════════════════════════

export const selectContacts = (state: RingoptimaStore) => state.contacts;
export const selectBatches = (state: RingoptimaStore) => state.batches;
export const selectFilter = (state: RingoptimaStore) => state.filter;
export const selectActiveTab = (state: RingoptimaStore) => state.activeTab;
export const selectIsLoading = (state: RingoptimaStore) => state.isLoading;
export const selectSelectedContactId = (state: RingoptimaStore) => state.selectedContactId;

