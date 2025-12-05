// ═══════════════════════════════════════════════════════════════════════════════
// RINGOPTIMA V3 ENTERPRISE - MULTI VALUE CELL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

import { memo, useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, Phone, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, copyToClipboard } from '../lib/utils';

interface MultiValueCellProps {
  values: string;
  maxVisible?: number;
  type?: 'phone' | 'text';
  className?: string;
}

const MultiValueCell = memo(function MultiValueCell({
  values,
  maxVisible = 2,
  type = 'text',
  className,
}: MultiValueCellProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const items = values
    .split('\n')
    .map((v) => v.trim())
    .filter(Boolean);
  
  const hasMore = items.length > maxVisible;
  const visibleItems = isExpanded ? items : items.slice(0, maxVisible);
  const remaining = items.length - maxVisible;

  const handleCopy = useCallback(async (value: string, index: number) => {
    const success = await copyToClipboard(value);
    if (success) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  }, []);

  if (items.length === 0) {
    return <span className="text-slate-500">—</span>;
  }

  return (
    <div className={cn('space-y-1', className)}>
      <AnimatePresence mode="popLayout">
        {visibleItems.map((item, index) => (
          <motion.div
            key={`${item}-${index}`}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="group flex items-center gap-2"
          >
            {type === 'phone' && (
              <Phone className="w-3 h-3 text-slate-500 flex-shrink-0" />
            )}
            <span className="text-sm text-slate-300 truncate flex-1">
              {item}
            </span>
            {type === 'phone' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(item, index);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-700/50 transition-all"
                aria-label={`Kopiera ${item}`}
              >
                {copiedIndex === index ? (
                  <Check className="w-3 h-3 text-brand-400" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400" />
                )}
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      
      {hasMore && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className={cn(
            'flex items-center gap-1 text-xs font-medium transition-colors',
            isExpanded
              ? 'text-slate-400 hover:text-slate-300'
              : 'text-brand-400 hover:text-brand-300'
          )}
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3 h-3" />
              Visa färre
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              +{remaining} till
            </>
          )}
        </button>
      )}
    </div>
  );
});

export default MultiValueCell;

// ═══════════════════════════════════════════════════════════════════════════════
// PHONE BADGE - Compact phone count display
// ═══════════════════════════════════════════════════════════════════════════════

interface PhoneBadgeProps {
  count: number;
  className?: string;
}

export const PhoneBadge = memo(function PhoneBadge({ count, className }: PhoneBadgeProps) {
  if (count === 0) return null;
  
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        'bg-slate-800/80 text-slate-300',
        className
      )}
    >
      <Phone className="w-3 h-3" />
      <span>{count}</span>
    </div>
  );
});

