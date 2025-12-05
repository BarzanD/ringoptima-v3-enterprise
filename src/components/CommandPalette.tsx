// ═══════════════════════════════════════════════════════════════════════════════
// RINGOPTIMA V3 ENTERPRISE - COMMAND PALETTE (CMD+K)
// ═══════════════════════════════════════════════════════════════════════════════

import { memo, useCallback, useEffect, useState, useMemo } from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Upload,
  Download,
  BarChart3,
  Users,
  Filter,
  Trash2,
  Settings,
  Moon,
  Sun,
  FolderOpen,
  RefreshCw,
  Keyboard,
  HelpCircle,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { cn } from '../lib/utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: () => void;
  onExport: () => void;
  onClearFilters: () => void;
  onRefreshData: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  icon: typeof Search;
  shortcut?: string;
  action: () => void;
  group: string;
}

const CommandPalette = memo(function CommandPalette({
  isOpen,
  onClose,
  onImport,
  onExport,
  onClearFilters,
  onRefreshData,
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const setActiveTab = useStore((state) => state.setActiveTab);
  const contacts = useStore((state) => state.contacts);

  // Reset search when opening
  useEffect(() => {
    if (isOpen) setSearch('');
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    {
      id: 'nav-contacts',
      label: 'Gå till Kontakter',
      icon: Users,
      shortcut: '1',
      action: () => { setActiveTab('contacts'); onClose(); },
      group: 'Navigering',
    },
    {
      id: 'nav-search',
      label: 'Gå till Sök',
      icon: Search,
      shortcut: '2',
      action: () => { setActiveTab('search'); onClose(); },
      group: 'Navigering',
    },
    {
      id: 'nav-batches',
      label: 'Gå till Listor',
      icon: FolderOpen,
      shortcut: '3',
      action: () => { setActiveTab('batches'); onClose(); },
      group: 'Navigering',
    },
    {
      id: 'nav-dashboard',
      label: 'Gå till Dashboard',
      icon: BarChart3,
      shortcut: '4',
      action: () => { setActiveTab('dashboard'); onClose(); },
      group: 'Navigering',
    },
    
    // Actions
    {
      id: 'import-csv',
      label: 'Importera CSV',
      icon: Upload,
      shortcut: '⌘I',
      action: () => { onImport(); onClose(); },
      group: 'Åtgärder',
    },
    {
      id: 'export-csv',
      label: `Exportera ${contacts.length} kontakter`,
      icon: Download,
      shortcut: '⌘E',
      action: () => { onExport(); onClose(); },
      group: 'Åtgärder',
    },
    {
      id: 'clear-filters',
      label: 'Rensa alla filter',
      icon: Filter,
      action: () => { onClearFilters(); onClose(); },
      group: 'Åtgärder',
    },
    {
      id: 'refresh',
      label: 'Uppdatera data',
      icon: RefreshCw,
      shortcut: '⌘R',
      action: () => { onRefreshData(); onClose(); },
      group: 'Åtgärder',
    },
    
    // Help
    {
      id: 'shortcuts',
      label: 'Visa kortkommandon',
      icon: Keyboard,
      shortcut: '?',
      action: () => { /* Show shortcuts modal */ onClose(); },
      group: 'Hjälp',
    },
  ], [contacts.length, setActiveTab, onClose, onImport, onExport, onClearFilters, onRefreshData]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    commands.forEach(cmd => {
      if (!groups[cmd.group]) groups[cmd.group] = [];
      groups[cmd.group].push(cmd);
    });
    return groups;
  }, [commands]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Command Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="absolute left-1/2 top-[20%] -translate-x-1/2 w-full max-w-xl"
        >
          <Command
            className="glass-card overflow-hidden shadow-2xl"
            loop
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800/50">
              <Search className="w-5 h-5 text-slate-400" />
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder="Sök kommando..."
                className="flex-1 bg-transparent text-slate-100 text-base placeholder:text-slate-500 focus:outline-none"
                autoFocus
              />
              <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-slate-500 bg-slate-800/50 rounded-md">
                ESC
              </kbd>
            </div>

            {/* Commands List */}
            <Command.List className="max-h-[400px] overflow-y-auto p-2">
              <Command.Empty className="py-8 text-center text-sm text-slate-500">
                Inga kommandon hittades
              </Command.Empty>

              {Object.entries(groupedCommands).map(([group, items]) => (
                <Command.Group
                  key={group}
                  heading={group}
                  className="mb-4 last:mb-0"
                >
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {group}
                  </div>
                  {items.map((cmd) => (
                    <Command.Item
                      key={cmd.id}
                      value={cmd.label}
                      onSelect={cmd.action}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer',
                        'text-slate-300 hover:text-slate-100',
                        'data-[selected=true]:bg-brand-500/20 data-[selected=true]:text-brand-400',
                        'transition-colors'
                      )}
                    >
                      <cmd.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 text-sm">{cmd.label}</span>
                      {cmd.shortcut && (
                        <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs text-slate-500 bg-slate-800/50 rounded">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800/50 bg-slate-900/50">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">↑↓</kbd>
                  navigera
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">↵</kbd>
                  välj
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">esc</kbd>
                  stäng
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Ringoptima Enterprise
              </div>
            </div>
          </Command>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});

export default CommandPalette;

