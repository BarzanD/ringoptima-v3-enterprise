// ═══════════════════════════════════════════════════════════════════════════════
// RINGOPTIMA V3 ENTERPRISE - TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToastStore } from '../lib/toast';
import { cn } from '../lib/utils';
import type { ToastType } from '../types';

const toastConfig: Record<ToastType, { icon: typeof CheckCircle; className: string }> = {
  success: {
    icon: CheckCircle,
    className: 'bg-brand-500/20 border-brand-500/30 text-brand-400',
  },
  error: {
    icon: XCircle,
    className: 'bg-red-500/20 border-red-500/30 text-red-400',
  },
  info: {
    icon: Info,
    className: 'bg-sky-500/20 border-sky-500/30 text-sky-400',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
  },
};

const ToastItem = memo(function ToastItem({
  id,
  type,
  message,
}: {
  id: string;
  type: ToastType;
  message: string;
}) {
  const removeToast = useToastStore((state) => state.removeToast);
  const config = toastConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-lg',
        'shadow-lg max-w-sm',
        config.className
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium text-slate-100">{message}</p>
      <button
        onClick={() => removeToast(id)}
        className="p-1 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Stäng notifikation"
      >
        <X className="w-4 h-4 text-slate-400" />
      </button>
    </motion.div>
  );
});

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none md:bottom-6 md:right-6"
      aria-label="Notifikationer"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem {...toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

