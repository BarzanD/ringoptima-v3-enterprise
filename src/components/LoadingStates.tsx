// ═══════════════════════════════════════════════════════════════════════════════
// RINGOPTIMA V3 ENTERPRISE - LOADING STATES & SKELETONS
// ═══════════════════════════════════════════════════════════════════════════════

import { memo } from 'react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════════
// SKELETON BASE
// ═══════════════════════════════════════════════════════════════════════════════

interface SkeletonProps {
  className?: string;
}

export const Skeleton = memo(function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'shimmer rounded-lg bg-slate-800/50',
        className
      )}
      aria-hidden="true"
    />
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE ROW SKELETON
// ═══════════════════════════════════════════════════════════════════════════════

export const TableRowSkeleton = memo(function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/50">
      <Skeleton className="w-10 h-10 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-8 w-24" />
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// CONTACT CARD SKELETON (Mobile)
// ═══════════════════════════════════════════════════════════════════════════════

export const ContactCardSkeleton = memo(function ContactCardSkeleton() {
  return (
    <div className="flex items-start gap-4 p-4 border-b border-slate-800/50">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="w-10 h-10 rounded-full" />
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// STAT CARD SKELETON
// ═══════════════════════════════════════════════════════════════════════════════

export const StatCardSkeleton = memo(function StatCardSkeleton() {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// CHART SKELETON
// ═══════════════════════════════════════════════════════════════════════════════

export const ChartSkeleton = memo(function ChartSkeleton() {
  return (
    <div className="glass-card p-6">
      <Skeleton className="h-5 w-40 mb-6" />
      <div className="flex items-end justify-between gap-2 h-48">
        {[40, 65, 45, 80, 55, 70, 50].map((height, i) => (
          <div
            key={i}
            className="w-full rounded-t"
            style={{ height: `${height}%` }}
          >
            <Skeleton className="w-full h-full" />
          </div>
        ))}
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE LOADING
// ═══════════════════════════════════════════════════════════════════════════════

export const PageLoading = memo(function PageLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-brand-500/20 animate-pulse" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-brand-500 animate-spin" />
        </div>
        <p className="text-slate-400 text-sm font-medium">Laddar Ringoptima...</p>
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// LOADING SPINNER
// ═══════════════════════════════════════════════════════════════════════════════

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner = memo(function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div
      className={cn(
        'rounded-full border-brand-500/20 border-t-brand-500 animate-spin',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Laddar"
    >
      <span className="sr-only">Laddar...</span>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// LOADING DOTS
// ═══════════════════════════════════════════════════════════════════════════════

export const LoadingDots = memo(function LoadingDots() {
  return (
    <div className="flex items-center gap-1" role="status" aria-label="Laddar">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
      <span className="sr-only">Laddar...</span>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════════════

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState = memo(function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-slate-800/50 mb-6 text-slate-500">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// OFFLINE INDICATOR
// ═══════════════════════════════════════════════════════════════════════════════

export const OfflineIndicator = memo(function OfflineIndicator() {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full backdrop-blur-lg">
      <p className="text-sm font-medium text-amber-400 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        Offline-läge
      </p>
    </div>
  );
});

