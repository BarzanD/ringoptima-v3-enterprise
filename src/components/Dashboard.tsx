// ═══════════════════════════════════════════════════════════════════════════════
// RINGOPTIMA V3 ENTERPRISE - DASHBOARD ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Users,
  UserCheck,
  UserPlus,
  TrendingUp,
  Phone,
  Target,
  Activity,
  Zap,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { cn, formatNumber, formatPercent, getOperatorColor } from '../lib/utils';
import StatCard from './StatCard';
import { ChartSkeleton, StatCardSkeleton } from './LoadingStates';

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOM TOOLTIP
// ═══════════════════════════════════════════════════════════════════════════════

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

const CustomTooltip = memo(function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-slate-800/95 backdrop-blur-lg border border-slate-700/50 rounded-xl p-3 shadow-xl">
      {label && <p className="text-xs text-slate-400 mb-2">{label}</p>}
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-slate-200">
            {entry.name}: <span className="font-semibold">{formatNumber(entry.value)}</span>
          </span>
        </div>
      ))}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const Dashboard = memo(function Dashboard() {
  const contacts = useStore((state) => state.contacts);
  const getStats = useStore((state) => state.getStats);
  const getOperatorDistribution = useStore((state) => state.getOperatorDistribution);
  const isLoading = useStore((state) => state.isLoading);

  const stats = getStats();
  const operatorData = getOperatorDistribution();

  // Status distribution data
  const statusData = useMemo(() => [
    { name: 'Nya', value: stats.newCount, color: '#6b7280' },
    { name: 'Kontaktade', value: stats.contactedCount, color: '#0ea5e9' },
    { name: 'Intresserade', value: stats.interestedCount, color: '#fbbf24' },
    { name: 'Ej intresserade', value: stats.notInterestedCount, color: '#ef4444' },
    { name: 'Konverterade', value: stats.convertedCount, color: '#14b89e' },
  ], [stats]);

  // Activity trend (mock data for visualization)
  const activityData = useMemo(() => {
    const days = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];
    return days.map((day, i) => ({
      day,
      contacted: Math.floor(Math.random() * 20) + 5,
      converted: Math.floor(Math.random() * 5) + 1,
    }));
  }, []);

  // Priority distribution
  const priorityData = useMemo(() => [
    { name: 'Hög', value: stats.highPriority, color: '#ef4444' },
    { name: 'Medium', value: stats.mediumPriority, color: '#fbbf24' },
    { name: 'Låg', value: stats.lowPriority, color: '#6b7280' },
  ], [stats]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Dashboard</h2>
          <p className="text-slate-400">Översikt och statistik</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Totalt antal"
          value={stats.totalContacts}
          icon={<Users className="w-5 h-5" />}
          color="brand"
          delay={0}
        />
        <StatCard
          title="Kontaktade"
          value={stats.contactedCount + stats.interestedCount}
          icon={<Phone className="w-5 h-5" />}
          trend={12.5}
          trendLabel="senaste veckan"
          color="sky"
          delay={1}
        />
        <StatCard
          title="Konverteringsgrad"
          value={stats.conversionRate}
          suffix="%"
          icon={<Target className="w-5 h-5" />}
          trend={stats.conversionRate > 5 ? 8.2 : -2.1}
          color="amber"
          delay={2}
        />
        <StatCard
          title="Konverterade"
          value={stats.convertedCount}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={15.3}
          trendLabel="denna månad"
          color="brand"
          delay={3}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-400" />
            Aktivitet denna vecka
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="colorContacted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorConverted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b89e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#14b89e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="contacted"
                name="Kontaktade"
                stroke="#0ea5e9"
                strokeWidth={2}
                fill="url(#colorContacted)"
              />
              <Area
                type="monotone"
                dataKey="converted"
                name="Konverterade"
                stroke="#14b89e"
                strokeWidth={2}
                fill="url(#colorConverted)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Statusfördelning
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#64748b" fontSize={12} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#64748b"
                fontSize={12}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Antal" radius={[0, 4, 4, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operator Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="glass-card p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2">
            <Phone className="w-5 h-5 text-sky-400" />
            Operatörsfördelning
          </h3>
          <div className="flex items-center">
            <ResponsiveContainer width="50%" height={240}>
              <PieChart>
                <Pie
                  data={operatorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {operatorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {operatorData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-slate-300">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-200">
                    {formatNumber(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Priority Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-red-400" />
            Prioritet
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {priorityData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-400">{item.name}</span>
                </div>
                <span className="font-medium text-slate-200">{formatNumber(item.value)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-slate-100 mb-6">
          Nyckeltal
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-brand-400">
              {formatPercent(stats.engagementRate)}
            </p>
            <p className="text-sm text-slate-400 mt-1">Engagemangsgrad</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-sky-400">
              {formatNumber(stats.contactedCount)}
            </p>
            <p className="text-sm text-slate-400 mt-1">Samtal gjorda</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-400">
              {formatNumber(stats.interestedCount)}
            </p>
            <p className="text-sm text-slate-400 mt-1">Intresserade leads</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-400">
              {formatNumber(stats.highPriority)}
            </p>
            <p className="text-sm text-slate-400 mt-1">Hög prioritet</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

export default Dashboard;

