// ═══════════════════════════════════════════════════════════════════════════════
// RINGOPTIMA V3 ENTERPRISE - TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

/** Prioritetsnivåer för kontakter */
export type Priority = 'high' | 'medium' | 'low';

/** Status för kontaktens säljprocess */
export type ContactStatus = 'new' | 'contacted' | 'interested' | 'not_interested' | 'converted';

/** Mobiloperatörer i Sverige */
export type Operator = 'telia' | 'tele2' | 'tre' | 'telenor' | 'other' | '';

/** Sorteringsalternativ */
export type SortOption = 'name-asc' | 'name-desc' | 'phones-desc' | 'phones-asc' | 'recent' | 'updated' | '';

/** Utfall av samtal */
export type CallOutcome = 'answered' | 'no_answer' | 'voicemail' | 'callback' | 'wrong_number';

// ═══════════════════════════════════════════════════════════════════════════════
// CORE INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

/** Huvudkontakt-interface */
export interface Contact {
  id?: number;
  batchId?: number;
  name: string;
  org: string;
  address: string;
  city: string;
  phones: string;      // Newline-separerade telefonnummer
  users: string;       // Newline-separerade användare
  operators: string;   // Newline-separerade operatörer
  contact: string;     // Kontaktperson
  role: string;        // Roll (VD, Ordförande, etc.)
  notes: string;       // Samtalsanteckningar
  priority: Priority;
  status: ContactStatus;
  lastCalled?: string;
  createdAt: string;
  updatedAt: string;
}

/** Batch/importerad lista */
export interface Batch {
  id?: number;
  name: string;
  fileName: string;
  count: number;
  createdAt: string;
}

/** Samtalslogg */
export interface CallLog {
  id?: number;
  contactId: number;
  note: string;
  outcome: CallOutcome;
  durationSeconds: number;
  createdAt: string;
}

/** Filterinställningar */
export interface Filter {
  search: string;
  operator: Operator;
  status: ContactStatus | '';
  priority: Priority | '';
  sort: SortOption;
  batchId?: number;
  city?: string;
}

/** Sparat filter */
export interface SavedFilter {
  id?: number;
  name: string;
  filter: Filter;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATISTIK & ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════

/** Dashboard-statistik */
export interface DashboardStats {
  totalContacts: number;
  newCount: number;
  contactedCount: number;
  interestedCount: number;
  notInterestedCount: number;
  convertedCount: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  conversionRate: number;
  engagementRate: number;
}

/** Operatörsfördelning */
export interface OperatorDistribution {
  name: string;
  value: number;
  color: string;
}

/** Tidsserie för aktivitet */
export interface ActivityDataPoint {
  date: string;
  new: number;
  contacted: number;
  interested: number;
  converted: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UI STATE
// ═══════════════════════════════════════════════════════════════════════════════

/** Navigeringsflikar */
export type Tab = 'contacts' | 'search' | 'batches' | 'dashboard';

/** Toast-typer */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/** Toast-meddelande */
export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

/** Applikationstillstånd */
export interface AppState {
  isLoading: boolean;
  isMobile: boolean;
  activeTab: Tab;
  selectedContactId: number | null;
  isModalOpen: boolean;
  isCommandPaletteOpen: boolean;
  isOffline: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/** Partial update för kontakt */
export type ContactUpdate = Partial<Omit<Contact, 'id' | 'createdAt'>>;

/** Nytt kontakt-input */
export type NewContact = Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>;

/** CSV-rad */
export type CSVRow = string[];

/** Kolumnmappning för CSV */
export interface CSVColumnMapping {
  name: number;
  org?: number;
  address?: number;
  city?: number;
  phone?: number;
  contact?: number;
  role?: number;
}

