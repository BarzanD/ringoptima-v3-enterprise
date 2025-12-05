// ═══════════════════════════════════════════════════════════════════════════════
// RINGOPTIMA V3 ENTERPRISE - SAVED FILTERS PANEL
// ═══════════════════════════════════════════════════════════════════════════════

import { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark,
  Plus,
  Trash2,
  Check,
  X,
  Filter,
  ChevronDown,
} from 'lucide-react';
import type { SavedFilter, Filter as FilterType } from '../types';
import { useStore } from '../lib/store';
import { db } from '../lib/db';
import { toast } from '../lib/toast';
import { cn, formatDate } from '../lib/utils';

interface SavedFiltersPanelProps {
  savedFilters: SavedFilter[];
  currentFilter: FilterType;
  onLoadFilter: (filter: FilterType) => void;
  onDeleteFilter: (id: number) => void;
}

const SavedFiltersPanel = memo(function SavedFiltersPanel({
  savedFilters,
  currentFilter,
  onLoadFilter,
  onDeleteFilter,
}: SavedFiltersPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const addSavedFilter = useStore((state) => state.addSavedFilter);

  const hasActiveFilter = Boolean(
    currentFilter.search ||
    currentFilter.operator ||
    currentFilter.status ||
    currentFilter.priority ||
    currentFilter.city
  );

  const handleSaveFilter = useCallback(async () => {
    if (!newFilterName.trim()) {
      toast.error('Ange ett namn för filtret');
      return;
    }

    try {
      const id = await db.addSavedFilter(newFilterName.trim(), currentFilter);
      addSavedFilter({
        id,
        name: newFilterName.trim(),
        filter: currentFilter,
        createdAt: new Date().toISOString(),
      });
      setNewFilterName('');
      setIsCreating(false);
      toast.success('Filter sparat');
    } catch (error) {
      toast.error('Kunde inte spara filter');
      console.error(error);
    }
  }, [newFilterName, currentFilter, addSavedFilter]);

  const handleDeleteFilter = useCallback(async (id: number) => {
    try {
      await db.deleteSavedFilter(id);
      onDeleteFilter(id);
      toast.success('Filter raderat');
    } catch (error) {
      toast.error('Kunde inte radera filter');
      console.error(error);
    }
  }, [onDeleteFilter]);

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[rgba(118,93,182,0.15)] text-[#765db6]">
            <Bookmark className="w-4 h-4" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-[#000000]">Sparade filter</h3>
            <p className="text-xs text-[rgba(60,60,67,0.6)]">
              {savedFilters.length} {savedFilters.length === 1 ? 'filter' : 'filter'}
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-[rgba(60,60,67,0.6)] transition-transform',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Save current filter */}
              {hasActiveFilter && !isCreating && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-[rgba(37,150,190,0.3)] text-[rgba(60,60,67,0.6)] hover:border-[#2596be] hover:text-[#2596be] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Spara nuvarande filter
                </button>
              )}

              {/* Create new filter form */}
              <AnimatePresence>
                {isCreating && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 rounded-xl bg-[rgba(255,255,255,0.6)] backdrop-blur-[10px] border border-[rgba(37,150,190,0.2)] space-y-3"
                  >
                    <input
                      type="text"
                      value={newFilterName}
                      onChange={(e) => setNewFilterName(e.target.value)}
                      placeholder="Namn på filter..."
                      className="input-field"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveFilter();
                        if (e.key === 'Escape') setIsCreating(false);
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveFilter}
                        className="btn-primary flex-1"
                      >
                        <Check className="w-4 h-4" />
                        Spara
                      </button>
                      <button
                        onClick={() => {
                          setIsCreating(false);
                          setNewFilterName('');
                        }}
                        className="btn-secondary"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Saved filters list */}
              {savedFilters.length === 0 ? (
                <p className="text-center text-sm text-[rgba(60,60,67,0.6)] py-4">
                  Inga sparade filter ännu
                </p>
              ) : (
                <div className="space-y-2">
                  {savedFilters.map((saved) => (
                    <motion.div
                      key={saved.id}
                      layout
                      className="group flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.6)] backdrop-blur-[10px] hover:bg-[rgba(255,255,255,0.8)] transition-colors border border-[rgba(37,150,190,0.1)]"
                    >
                      <button
                        onClick={() => onLoadFilter(saved.filter)}
                        className="flex-1 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <Filter className="w-3.5 h-3.5 text-[rgba(60,60,67,0.6)]" />
                          <span className="font-medium text-[#000000] text-sm">
                            {saved.name}
                          </span>
                        </div>
                        <p className="text-xs text-[rgba(60,60,67,0.6)] mt-1">
                          {formatDate(saved.createdAt)}
                        </p>
                      </button>
                      <button
                        onClick={() => saved.id && handleDeleteFilter(saved.id)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[rgba(239,68,68,0.1)] text-[rgba(60,60,67,0.6)] hover:text-[#ef4444] transition-all"
                        aria-label="Radera filter"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default SavedFiltersPanel;

