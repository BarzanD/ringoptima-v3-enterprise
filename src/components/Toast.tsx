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
    className: 'bg-[rgba(37,150,190,0.1)] border-[rgba(37,150,190,0.3)] text-[#2596be] backdrop-blur-lg',
  },
  error: {
    icon: XCircle,
    className: 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.3)] text-[#ef4444] backdrop-blur-lg',
  },
  info: {
    icon: Info,
    className: 'bg-[rgba(14,165,233,0.1)] border-[rgba(14,165,233,0.3)] text-[#0ea5e9] backdrop-blur-lg',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-[rgba(251,191,36,0.1)] border-[rgba(251,191,36,0.3)] text-[#fbbf24] backdrop-blur-lg',
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
        'flex items-center gap-3 px-4 py-3 rounded-xl border',
        'shadow-lg max-w-sm bg-white/90',
        config.className
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium text-[#000000]">{message}</p>
      <button
        onClick={() => removeToast(id)}
        className="p-1 rounded-lg hover:bg-[rgba(37,150,190,0.1)] transition-colors"
        aria-label="Stäng notifikation"
      >
        <X className="w-4 h-4 text-[rgba(60,60,67,0.6)]" />
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

