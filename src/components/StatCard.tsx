// ═══════════════════════════════════════════════════════════════════════════════
// RINGOPTIMA V3 ENTERPRISE - STAT CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

import { memo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn, formatNumber, formatPercent } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon: ReactNode;
  trend?: number;
  trendLabel?: string;
  color?: 'brand' | 'sky' | 'amber' | 'coral' | 'violet';
  delay?: number;
}

const colorConfig = {
  brand: {
    iconBg: 'bg-[rgba(37,150,190,0.15)]',
    iconColor: 'text-[#2596be]',
    glow: 'shadow-[rgba(37,150,190,0.1)]',
  },
  sky: {
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-400',
    glow: 'shadow-sky-500/10',
  },
  amber: {
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    glow: 'shadow-amber-500/10',
  },
  coral: {
    iconBg: 'bg-red-500/15',
    iconColor: 'text-red-400',
    glow: 'shadow-red-500/10',
  },
  violet: {
    iconBg: 'bg-violet-500/15',
    iconColor: 'text-violet-400',
    glow: 'shadow-violet-500/10',
  },
};

const StatCard = memo(function StatCard({
  title,
  value,
  suffix,
  icon,
  trend,
  trendLabel,
  color = 'brand',
  delay = 0,
}: StatCardProps) {
  const config = colorConfig[color];
  
  const TrendIcon = trend === undefined || trend === 0 
    ? Minus 
    : trend > 0 
      ? TrendingUp 
      : TrendingDown;
  
  const trendColor = trend === undefined || trend === 0
    ? 'text-[rgba(60,60,67,0.6)]'
    : trend > 0
      ? 'text-[#2596be]'
      : 'text-red-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1 }}
      className={cn(
        'glass-card p-5 relative overflow-hidden',
        'hover:border-slate-700/80 transition-all duration-300',
        config.glow
      )}
    >
      {/* Background decoration */}
      <div 
        className={cn(
          'absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-[0.05]',
          config.iconBg
        )} 
      />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-[rgba(60,60,67,0.6)]">{title}</span>
          <div className={cn('p-2 rounded-xl', config.iconBg, config.iconColor)}>
            {icon}
          </div>
        </div>
        
        {/* Value */}
        <div className="mb-2">
          <span className="text-3xl font-bold text-[#000000] tabular-nums">
            {formatNumber(value)}
          </span>
          {suffix && (
            <span className="text-lg text-[rgba(60,60,67,0.6)] ml-1">{suffix}</span>
          )}
        </div>
        
        {/* Trend */}
        {(trend !== undefined || trendLabel) && (
          <div className="flex items-center gap-2">
            {trend !== undefined && (
              <div className={cn('flex items-center gap-1', trendColor)}>
                <TrendIcon className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {trend > 0 ? '+' : ''}{formatPercent(trend)}
                </span>
              </div>
            )}
            {trendLabel && (
              <span className="text-xs text-[rgba(60,60,67,0.6)]">{trendLabel}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default StatCard;

// ═══════════════════════════════════════════════════════════════════════════════
// MINI STAT CARD - For sidebar
// ═══════════════════════════════════════════════════════════════════════════════

interface MiniStatCardProps {
  label: string;
  value: number;
  color?: string; // Hex color
}

export const MiniStatCard = memo(function MiniStatCard({
  label,
  value,
  color = '#6b7280',
}: MiniStatCardProps) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[rgba(255,255,255,0.6)] backdrop-blur-[10px] hover:bg-[rgba(255,255,255,0.8)] transition-colors border border-[rgba(37,150,190,0.1)]">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm text-[rgba(60,60,67,0.6)]">{label}</span>
      </div>
      <span className="text-sm font-semibold text-[#000000] tabular-nums">
        {formatNumber(value)}
      </span>
    </div>
  );
});

