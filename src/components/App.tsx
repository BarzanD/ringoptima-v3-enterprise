// ═══════════════════════════════════════════════════════════════════════════════
// RINGOPTIMA V3 ENTERPRISE - MAIN APPLICATION
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect, useRef, lazy, Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Upload,
  Download,
  Users,
  FolderOpen,
  BarChart3,
  RefreshCw,
  ChevronLeft,
  X,
  Command as CommandIcon,
  Menu,
} from 'lucide-react';

// Lib imports
import { useStore } from '../lib/store';
import { db } from '../lib/db';
import { toast } from '../lib/toast';
import { parseCSV, transformCSV, exportToCSV, downloadCSV, readCSVFile } from '../lib/csv';
import { cn, formatNumber } from '../lib/utils';

// Hook imports
import { useDebounce, useKeyboardShortcut, useIsMobile, useOnlineStatus } from '../hooks/usePerformance';

// Component imports
import ToastContainer from './Toast';
import ContactCard, { MobileContactCard } from './ContactCard';
import { PageLoading, EmptyState, OfflineIndicator } from './LoadingStates';
import { MiniStatCard } from './StatCard';
import MobileNav, { MobileHeader, MobileSearch, MobileFilterBar, MobileFilterChip } from './MobileNav';
import SavedFiltersPanel from './SavedFiltersPanel';

// Lazy loaded components
const Dashboard = lazy(() => import('./Dashboard'));
const ContactDetailModal = lazy(() => import('./ContactDetailModal'));
const CommandPalette = lazy(() => import('./CommandPalette'));

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const STATUS_OPTIONS = [
  { value: '', label: 'Alla' },
  { value: 'new', label: 'Ny' },
  { value: 'contacted', label: 'Kontaktad' },
  { value: 'interested', label: 'Intresserad' },
  { value: 'not_interested', label: 'Ej intresserad' },
  { value: 'converted', label: 'Konverterad' },
] as const;

const PRIORITY_OPTIONS = [
  { value: '', label: 'Alla' },
  { value: 'high', label: 'Hög' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Låg' },
] as const;

const OPERATOR_OPTIONS = [
  { value: '', label: 'Alla' },
  { value: 'telia', label: 'Telia' },
  { value: 'tele2', label: 'Tele2' },
  { value: 'tre', label: 'Tre' },
  { value: 'telenor', label: 'Telenor' },
  { value: 'other', label: 'Övrig' },
] as const;

const SORT_OPTIONS = [
  { value: 'recent', label: 'Senaste först' },
  { value: 'updated', label: 'Senast uppdaterad' },
  { value: 'name-asc', label: 'Namn A-Ö' },
  { value: 'name-desc', label: 'Namn Ö-A' },
  { value: 'phones-desc', label: 'Flest telefonnummer' },
  { value: 'phones-asc', label: 'Färst telefonnummer' },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function App() {
  // Store
  const {
    contacts,
    batches,
    savedFilters,
    filter,
    activeTab,
    isLoading,
    selectedContactId,
    isCommandPaletteOpen,
    isSidebarOpen,
    setContacts,
    setBatches,
    setSavedFilters,
    removeBatch,
    removeContact,
    removeSavedFilter,
    setFilter,
    resetFilter,
    loadSavedFilter,
    setActiveTab,
    setSelectedContactId,
    setIsLoading,
    setIsCommandPaletteOpen,
    toggleSidebar,
    getFilteredContacts,
    getStats,
  } = useStore();

  // Local state
  const [searchInput, setSearchInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Hooks
  const isMobile = useIsMobile();
  const isOnline = useOnlineStatus();
  const debouncedSearch = useDebounce(searchInput, 300);

  // Computed
  const filteredContacts = getFilteredContacts();
  const stats = getStats();
  const selectedContact = useMemo(
    () => contacts.find((c) => c.id === selectedContactId),
    [contacts, selectedContactId]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════════════════════════

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      try {
        const [contactsData, batchesData, filtersData] = await Promise.all([
          db.getAllContacts(),
          db.getAllBatches(),
          db.getAllSavedFilters(),
        ]);
        setContacts(contactsData);
        setBatches(batchesData);
        setSavedFilters(filtersData);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Kunde inte ladda data. Kontrollera din Supabase-konfiguration.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [setContacts, setBatches, setSavedFilters, setIsLoading]);

  // Update filter when search changes
  useEffect(() => {
    setFilter({ search: debouncedSearch });
  }, [debouncedSearch, setFilter]);

  // Keyboard shortcuts
  useKeyboardShortcut({ key: 'k', meta: true }, () => setIsCommandPaletteOpen(true));
  useKeyboardShortcut({ key: 'i', meta: true }, () => fileInputRef.current?.click());
  useKeyboardShortcut({ key: 'e', meta: true }, handleExport);
  useKeyboardShortcut({ key: '1' }, () => setActiveTab('contacts'));
  useKeyboardShortcut({ key: '2' }, () => setActiveTab('search'));
  useKeyboardShortcut({ key: '3' }, () => setActiveTab('batches'));
  useKeyboardShortcut({ key: '4' }, () => setActiveTab('dashboard'));

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await readCSVFile(file);
      const rows = parseCSV(text);
      
      if (rows.length < 2) {
        throw new Error('CSV-filen är tom eller har fel format');
      }

      // Create batch
      const batchName = file.name.replace(/\.[^/.]+$/, '');
      const batchId = await db.addBatch({
        name: batchName,
        fileName: file.name,
        count: 0,
      });

      // Transform and insert contacts
      const newContacts = transformCSV(rows, batchId);
      
      if (newContacts.length === 0) {
        throw new Error('Inga giltiga kontakter hittades i CSV-filen');
      }

      await db.addContacts(newContacts);
      await db.updateBatchCount(batchId, newContacts.length);

      // Reload data
      const [contactsData, batchesData] = await Promise.all([
        db.getAllContacts(),
        db.getAllBatches(),
      ]);
      setContacts(contactsData);
      setBatches(batchesData);

      toast.success(`Importerade ${newContacts.length} kontakter från "${batchName}"`);
    } catch (error) {
      console.error('Import failed:', error);
      toast.error(error instanceof Error ? error.message : 'Import misslyckades');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [setContacts, setBatches]);

  function handleExport() {
    if (filteredContacts.length === 0) {
      toast.warning('Inga kontakter att exportera');
      return;
    }

    const csv = exportToCSV(filteredContacts);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `ringoptima-export-${timestamp}.csv`);
    toast.success(`Exporterade ${filteredContacts.length} kontakter`);
  }

  const handleDeleteBatch = useCallback(async (batchId: number) => {
    if (!confirm('Är du säker på att du vill radera hela listan och alla kontakter?')) {
      return;
    }

    try {
      await db.deleteBatch(batchId);
      removeBatch(batchId);
      toast.success('Lista raderad');
    } catch (error) {
      toast.error('Kunde inte radera listan');
      console.error(error);
    }
  }, [removeBatch]);

  const handleRefreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [contactsData, batchesData] = await Promise.all([
        db.getAllContacts(),
        db.getAllBatches(),
      ]);
      setContacts(contactsData);
      setBatches(batchesData);
      toast.success('Data uppdaterad');
    } catch (error) {
      toast.error('Kunde inte uppdatera data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [setContacts, setBatches, setIsLoading]);

  const handleContactClick = useCallback((contact: { id?: number }) => {
    if (contact.id) {
      setSelectedContactId(contact.id);
    }
  }, [setSelectedContactId]);

  const handleCall = useCallback((phone: string) => {
    window.location.href = `tel:${phone.replace(/\D/g, '')}`;
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  const hasActiveFilters = Boolean(
    filter.search || filter.operator || filter.status || filter.priority
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════════════════════

  if (isLoading) {
    return <PageLoading />;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MOBILE LAYOUT
  // ═══════════════════════════════════════════════════════════════════════════

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-950">
        {/* Offline indicator */}
        {!isOnline && <OfflineIndicator />}

        {/* Header */}
        <MobileHeader
          title="Ringoptima"
          subtitle={`${formatNumber(filteredContacts.length)} kontakter`}
          showFilter
          filterActive={hasActiveFilters}
          onFilterClick={() => setShowFilters(!showFilters)}
        />

        {/* Search */}
        {activeTab === 'search' && (
          <MobileSearch
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Sök företag, kontakt, stad..."
          />
        )}

        {/* Filter bar */}
        {showFilters && (
          <MobileFilterBar>
            {STATUS_OPTIONS.slice(1).map((opt) => (
              <MobileFilterChip
                key={opt.value}
                label={opt.label}
                active={filter.status === opt.value}
                onClick={() => setFilter({ status: filter.status === opt.value ? '' : opt.value as any })}
              />
            ))}
          </MobileFilterBar>
        )}

        {/* Content */}
        <main className="pb-24">
          {activeTab === 'contacts' && (
            <div>
              {filteredContacts.length === 0 ? (
                <EmptyState
                  icon={<Users className="w-12 h-12" />}
                  title="Inga kontakter"
                  description="Importera en CSV-fil för att komma igång"
                  action={
                    <button onClick={() => fileInputRef.current?.click()} className="btn-primary">
                      <Upload className="w-4 h-4" />
                      Importera CSV
                    </button>
                  }
                />
              ) : (
                filteredContacts.map((contact) => (
                  <MobileContactCard
                    key={contact.id}
                    contact={contact}
                    onClick={handleContactClick}
                    onCall={handleCall}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'search' && (
            <div>
              {filteredContacts.map((contact) => (
                <MobileContactCard
                  key={contact.id}
                  contact={contact}
                  onClick={handleContactClick}
                  onCall={handleCall}
                />
              ))}
            </div>
          )}

          {activeTab === 'batches' && (
            <div className="p-4 space-y-3">
              {batches.length === 0 ? (
                <EmptyState
                  icon={<FolderOpen className="w-12 h-12" />}
                  title="Inga listor"
                  description="Importera en CSV-fil för att skapa din första lista"
                />
              ) : (
                batches.map((batch) => (
                  <div
                    key={batch.id}
                    className="glass-card p-4 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-200">{batch.name}</h3>
                      <p className="text-sm text-slate-400">{formatNumber(batch.count)} kontakter</p>
                    </div>
                    <button
                      onClick={() => batch.id && handleDeleteBatch(batch.id)}
                      className="btn-icon text-slate-400 hover:text-red-400"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'dashboard' && (
            <Suspense fallback={<PageLoading />}>
              <Dashboard />
            </Suspense>
          )}
        </main>

        {/* Navigation */}
        <MobileNav onUpload={() => fileInputRef.current?.click()} />

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleImport}
          className="hidden"
        />

        {/* Modals */}
        {selectedContact && (
          <Suspense fallback={null}>
            <ContactDetailModal
              contact={selectedContact}
              onClose={() => setSelectedContactId(null)}
              onDelete={removeContact}
            />
          </Suspense>
        )}

        <ToastContainer />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DESKTOP LAYOUT
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen flex bg-white">
      {/* Offline indicator */}
      {!isOnline && <OfflineIndicator />}

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-screen sticky top-0 flex flex-col border-r border-[rgba(37,150,190,0.2)] glass-card overflow-hidden"
          >
            {/* Logo */}
            <div className="p-6 border-b border-[rgba(37,150,190,0.2)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2596be] to-[#1e7a9c] flex items-center justify-center shadow-lg shadow-[rgba(37,150,190,0.2)]">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <div>
                  <h1 className="font-bold text-lg text-[#2596be]">Ringoptima</h1>
                  <p className="text-xs text-[rgba(60,60,67,0.6)]">Enterprise v3</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1">
              {[
                { id: 'contacts', icon: Users, label: 'Kontakter', count: contacts.length },
                { id: 'batches', icon: FolderOpen, label: 'Listor', count: batches.length },
                { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                    activeTab === item.id
                      ? 'bg-[rgba(37,150,190,0.1)] text-[#2596be]'
                      : 'text-[rgba(60,60,67,0.6)] hover:text-[#000000] hover:bg-[rgba(37,150,190,0.05)]'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  {item.count !== undefined && (
                    <span className="text-xs bg-[rgba(37,150,190,0.1)] text-[#2596be] px-2 py-0.5 rounded-full">
                      {formatNumber(item.count)}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="divider mx-4 border-[rgba(37,150,190,0.2)]" />

            {/* Quick Stats */}
            <div className="p-4 space-y-2">
              <h3 className="text-xs font-semibold text-[#2596be] uppercase tracking-wider mb-3">
                Snabbstatistik
              </h3>
              <MiniStatCard label="Nya" value={stats.newCount} color="#6b7280" />
              <MiniStatCard label="Kontaktade" value={stats.contactedCount} color="#0ea5e9" />
              <MiniStatCard label="Intresserade" value={stats.interestedCount} color="#fbbf24" />
              <MiniStatCard label="Konverterade" value={stats.convertedCount} color="#2596be" />
            </div>

            {/* Saved Filters */}
            <div className="flex-1 overflow-y-auto p-4">
              <SavedFiltersPanel
                savedFilters={savedFilters}
                currentFilter={filter}
                onLoadFilter={loadSavedFilter}
                onDeleteFilter={removeSavedFilter}
              />
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-[rgba(37,150,190,0.2)]">
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[rgba(60,60,67,0.6)] hover:text-[#000000] hover:bg-[rgba(37,150,190,0.05)] transition-colors"
              >
                <CommandIcon className="w-4 h-4" />
                <span className="flex-1 text-left text-sm">Sök kommando</span>
                <kbd className="text-xs bg-[rgba(37,150,190,0.1)] text-[#2596be] px-2 py-0.5 rounded">⌘K</kbd>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="filter-bar">
          <div className="flex items-center gap-4 px-6 py-4 max-w-[1440px] mx-auto">
            {/* Sidebar toggle */}
            <button
              onClick={toggleSidebar}
              className="btn-icon"
              aria-label={isSidebarOpen ? 'Stäng sidopanel' : 'Öppna sidopanel'}
            >
              {isSidebarOpen ? <ChevronLeft className="w-5 h-5 text-[#2596be]" /> : <Menu className="w-5 h-5 text-[#2596be]" />}
            </button>

            {/* Search */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(60,60,67,0.6)]" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Sök kontakter, företag, stad..."
                className="search-input w-full pl-11 pr-4 py-2.5"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-[rgba(37,150,190,0.1)] text-[rgba(60,60,67,0.6)]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <select
                value={filter.status}
                onChange={(e) => setFilter({ status: e.target.value as any })}
                className="select-field py-2.5 w-auto min-w-[140px]"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    Status: {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={filter.priority}
                onChange={(e) => setFilter({ priority: e.target.value as any })}
                className="select-field py-2.5 w-auto min-w-[140px]"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    Prioritet: {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={filter.operator}
                onChange={(e) => setFilter({ operator: e.target.value as any })}
                className="select-field py-2.5 w-auto min-w-[140px]"
              >
                {OPERATOR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    Operatör: {opt.label}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  onClick={resetFilter}
                  className="btn-ghost text-sm"
                >
                  <X className="w-4 h-4" />
                  Rensa
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleRefreshData}
                className="btn-icon"
                aria-label="Uppdatera"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={handleExport}
                disabled={filteredContacts.length === 0}
                className="btn-secondary"
              >
                <Download className="w-4 h-4" />
                Exportera
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="btn-primary"
              >
                <Upload className="w-4 h-4" />
                {isUploading ? 'Importerar...' : 'Importera CSV'}
              </button>
            </div>
          </div>

          {/* Results bar */}
          <div className="flex items-center justify-between px-6 py-2 bg-[rgba(255,255,255,0.6)] backdrop-blur-[10px] text-sm border-t border-[rgba(37,150,190,0.2)]">
            <span className="text-[rgba(60,60,67,0.6)]">
              Visar <span className="text-[#000000] font-medium">{formatNumber(filteredContacts.length)}</span> av {formatNumber(contacts.length)} kontakter
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[rgba(60,60,67,0.6)]">Sortering:</span>
              <select
                value={filter.sort}
                onChange={(e) => setFilter({ sort: e.target.value as any })}
                className="bg-transparent text-[#000000] border-none focus:outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-white">
          {activeTab === 'dashboard' ? (
            <Suspense fallback={<PageLoading />}>
              <Dashboard />
            </Suspense>
          ) : activeTab === 'batches' ? (
            <div className="p-6 max-w-[1440px] mx-auto">
              <h2 className="text-xl font-bold text-[#2596be] mb-6">Importerade listor</h2>
              {batches.length === 0 ? (
                <EmptyState
                  icon={<FolderOpen className="w-12 h-12" />}
                  title="Inga listor"
                  description="Importera en CSV-fil för att skapa din första lista"
                  action={
                    <button onClick={() => fileInputRef.current?.click()} className="btn-primary">
                      <Upload className="w-4 h-4" />
                      Importera CSV
                    </button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {batches.map((batch) => (
                    <motion.div
                      key={batch.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card glass-card-hover p-5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-xl bg-[rgba(118,93,182,0.15)] text-[#765db6]">
                            <FolderOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#000000]">{batch.name}</h3>
                            <p className="text-sm text-[rgba(60,60,67,0.6)]">{batch.fileName}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => batch.id && handleDeleteBatch(batch.id)}
                          className="btn-icon text-[rgba(60,60,67,0.6)] hover:text-[#ef4444]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-4 pt-4 border-t border-[rgba(37,150,190,0.2)] flex items-center justify-between">
                        <span className="text-2xl font-bold text-[#2596be]">
                          {formatNumber(batch.count)}
                        </span>
                        <span className="text-sm text-[rgba(60,60,67,0.6)]">kontakter</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : filteredContacts.length === 0 ? (
            <EmptyState
              icon={<Users className="w-12 h-12" />}
              title={hasActiveFilters ? 'Inga matchande kontakter' : 'Inga kontakter'}
              description={
                hasActiveFilters
                  ? 'Prova att ändra dina filter för att se fler resultat'
                  : 'Importera en CSV-fil för att komma igång'
              }
              action={
                hasActiveFilters ? (
                  <button onClick={resetFilter} className="btn-secondary">
                    <X className="w-4 h-4" />
                    Rensa filter
                  </button>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} className="btn-primary">
                    <Upload className="w-4 h-4" />
                    Importera CSV
                  </button>
                )
              }
            />
          ) : (
            <div className="p-6 max-w-[1440px] mx-auto">
              {/* Column Headers */}
              <div className="contact-card-grid mb-4 pb-3 border-b border-[rgba(37,150,190,0.2)]">
                <div className="contact-card-column">
                  <div className="column-header">Företag</div>
                </div>
                <div className="contact-card-column">
                  <div className="column-header">Kontakt</div>
                </div>
                <div className="contact-card-column">
                  <div className="column-header">Telefon</div>
                </div>
                <div className="contact-card-column">
                  <div className="column-header">Användare</div>
                </div>
                <div className="contact-card-column">
                  <div className="column-header">Operatör</div>
                </div>
                <div className="contact-card-column">
                  <div className="column-header">Status</div>
                </div>
                <div className="contact-card-column">
                  <div className="column-header">Åtgärder</div>
                </div>
              </div>
              
              {/* Contact Cards */}
              {filteredContacts.map((contact, i) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onClick={handleContactClick}
                  onCall={handleCall}
                  onEdit={handleContactClick}
                  onDelete={removeContact}
                  delay={i < 20 ? i : 0}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleImport}
        className="hidden"
      />

      {/* Modals & Overlays */}
      {selectedContact && (
        <Suspense fallback={null}>
          <ContactDetailModal
            contact={selectedContact}
            onClose={() => setSelectedContactId(null)}
            onDelete={removeContact}
          />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onImport={() => fileInputRef.current?.click()}
          onExport={handleExport}
          onClearFilters={resetFilter}
          onRefreshData={handleRefreshData}
        />
      </Suspense>

      <ToastContainer />
    </div>
  );
}

