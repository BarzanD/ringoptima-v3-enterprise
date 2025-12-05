// ═══════════════════════════════════════════════════════════════════════════════
// RINGOPTIMA V3 ENTERPRISE - MOBILE NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════════

import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Upload,
  FolderOpen,
  BarChart3,
  Menu,
  Bell,
  Filter,
  X,
} from 'lucide-react';
import type { Tab } from '../types';
import { cn } from '../lib/utils';
import { useStore } from '../lib/store';

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILE NAVIGATION BAR
// ═══════════════════════════════════════════════════════════════════════════════

interface MobileNavProps {
  onUpload: () => void;
}

const navItems: { id: Tab; icon: typeof Users; label: string }[] = [
  { id: 'contacts', icon: Users, label: 'Kontakter' },
  { id: 'search', icon: Search, label: 'Sök' },
  { id: 'batches', icon: FolderOpen, label: 'Listor' },
  { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
];

const MobileNav = memo(function MobileNav({ onUpload }: MobileNavProps) {
  const activeTab = useStore((state) => state.activeTab);
  const setActiveTab = useStore((state) => state.setActiveTab);

  return (
    <nav className="mobile-nav" role="navigation" aria-label="Huvudnavigering">
      <div className="mobile-nav-inner">
        {navItems.slice(0, 2).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn('mobile-nav-item', activeTab === item.id && 'active')}
            aria-label={item.label}
            aria-current={activeTab === item.id ? 'page' : undefined}
          >
            <item.icon className="mobile-nav-icon" />
            <span className="mobile-nav-label">{item.label}</span>
          </button>
        ))}

        {/* FAB - Upload */}
        <button
          onClick={onUpload}
          className="mobile-nav-fab"
          aria-label="Ladda upp CSV"
        >
          <Upload className="mobile-nav-fab-icon" />
        </button>

        {navItems.slice(2).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn('mobile-nav-item', activeTab === item.id && 'active')}
            aria-label={item.label}
            aria-current={activeTab === item.id ? 'page' : undefined}
          >
            <item.icon className="mobile-nav-icon" />
            <span className="mobile-nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
});

export default MobileNav;

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILE HEADER
// ═══════════════════════════════════════════════════════════════════════════════

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  onFilterClick?: () => void;
  showFilter?: boolean;
  filterActive?: boolean;
}

export const MobileHeader = memo(function MobileHeader({
  title,
  subtitle,
  onMenuClick,
  onFilterClick,
  showFilter = false,
  filterActive = false,
}: MobileHeaderProps) {
  return (
    <header className="mobile-header">
      <div className="mobile-header-inner">
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="btn-icon"
              aria-label="Meny"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="mobile-header-title">{title}</h1>
            {subtitle && (
              <p className="mobile-header-subtitle">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="mobile-header-actions">
          {showFilter && (
            <button
              onClick={onFilterClick}
              className={cn(
                'btn-icon relative',
                filterActive && 'text-brand-400'
              )}
              aria-label="Filter"
            >
              <Filter className="w-5 h-5" />
              {filterActive && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-500" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILE SEARCH BAR
// ═══════════════════════════════════════════════════════════════════════════════

interface MobileSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const MobileSearch = memo(function MobileSearch({
  value,
  onChange,
  placeholder = 'Sök kontakter...',
}: MobileSearchProps) {
  return (
    <div className="mobile-search-container">
      <div className="mobile-search-input-wrapper">
        <Search className="mobile-search-icon" />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mobile-search-input"
          aria-label="Sök"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="mobile-search-clear"
            aria-label="Rensa sökning"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILE FILTER CHIPS
// ═══════════════════════════════════════════════════════════════════════════════

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

export const MobileFilterChip = memo(function MobileFilterChip({
  label,
  active,
  onClick,
  icon,
}: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn('mobile-filter-chip', active && 'active')}
      aria-pressed={active}
    >
      {icon}
      {label}
    </button>
  );
});

interface MobileFilterBarProps {
  children: React.ReactNode;
}

export const MobileFilterBar = memo(function MobileFilterBar({ children }: MobileFilterBarProps) {
  return (
    <div className="mobile-filter-bar" role="toolbar" aria-label="Filtrera">
      <div className="mobile-filter-chips">
        {children}
      </div>
    </div>
  );
});

