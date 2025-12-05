// ═══════════════════════════════════════════════════════════════════════════════
// RINGOPTIMA V3 ENTERPRISE - CONTACT CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  MapPin, 
  Building2, 
  User, 
  Clock,
  ChevronRight,
  Star,
} from 'lucide-react';
import type { Contact } from '../types';
import { 
  cn, 
  getStatusLabel, 
  getStatusColor, 
  getPriorityLabel,
  formatRelativeTime,
  countPhones,
  getFirstPhone,
} from '../lib/utils';
import { PhoneBadge } from './MultiValueCell';

interface ContactCardProps {
  contact: Contact;
  onClick: (contact: Contact) => void;
  onCall?: (phone: string) => void;
  delay?: number;
}

const ContactCard = memo(function ContactCard({
  contact,
  onClick,
  onCall,
  delay = 0,
}: ContactCardProps) {
  const phoneCount = countPhones(contact.phones);
  const firstPhone = getFirstPhone(contact.phones);
  const initials = contact.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleCall = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (firstPhone && onCall) {
      onCall(firstPhone);
    }
  }, [firstPhone, onCall]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.05 }}
      onClick={() => onClick(contact)}
      className={cn(
        'group relative flex items-start gap-4 p-4',
        'bg-slate-900/40 hover:bg-slate-800/60',
        'border-b border-slate-800/50 last:border-b-0',
        'cursor-pointer transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(contact)}
      aria-label={`Visa ${contact.name}`}
    >
      {/* Avatar */}
      <div className={cn(
        'relative w-12 h-12 flex-shrink-0',
        'flex items-center justify-center',
        'rounded-xl font-bold text-sm text-white',
        'bg-gradient-to-br from-brand-500 to-brand-700',
        'shadow-lg shadow-brand-500/20'
      )}>
        {initials}
        {contact.priority === 'high' && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center shadow">
            <Star className="w-2.5 h-2.5 text-amber-900" fill="currentColor" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-slate-100 truncate group-hover:text-brand-400 transition-colors">
            {contact.name}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={cn(
              'status-dot',
              `status-${contact.status.replace('_', '-')}`
            )} />
            <span className="text-xs text-slate-400">
              {getStatusLabel(contact.status)}
            </span>
          </div>
        </div>

        {/* Meta Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
          {contact.city && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {contact.city}
            </span>
          )}
          {contact.contact && (
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {contact.contact}
            </span>
          )}
          {phoneCount > 0 && (
            <PhoneBadge count={phoneCount} />
          )}
        </div>

        {/* Notes preview */}
        {contact.notes && (
          <p className="mt-2 text-xs text-slate-500 line-clamp-1">
            {contact.notes}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        {firstPhone && (
          <button
            onClick={handleCall}
            className={cn(
              'w-10 h-10 flex items-center justify-center',
              'rounded-full bg-brand-500 hover:bg-brand-400',
              'text-white shadow-lg shadow-brand-500/30',
              'transition-all duration-200 hover:scale-105',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400'
            )}
            aria-label={`Ring ${contact.name}`}
          >
            <Phone className="w-4 h-4" />
          </button>
        )}
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatRelativeTime(contact.updatedAt)}
        </span>
      </div>

      {/* Hover indicator */}
      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.article>
  );
});

export default ContactCard;

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILE CONTACT CARD - Compact version
// ═══════════════════════════════════════════════════════════════════════════════

export const MobileContactCard = memo(function MobileContactCard({
  contact,
  onClick,
  onCall,
}: Omit<ContactCardProps, 'delay'>) {
  const phoneCount = countPhones(contact.phones);
  const firstPhone = getFirstPhone(contact.phones);
  const initials = contact.name.slice(0, 2).toUpperCase();

  const handleCall = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (firstPhone && onCall) {
      onCall(firstPhone);
    }
  }, [firstPhone, onCall]);

  return (
    <div
      onClick={() => onClick(contact)}
      className="mobile-contact-card"
      role="button"
      tabIndex={0}
    >
      <div className="mobile-contact-avatar">{initials}</div>
      
      <div className="mobile-contact-content">
        <div className="mobile-contact-header">
          <h3 className="mobile-contact-name">{contact.name}</h3>
          <div className="mobile-contact-status">
            <span className={cn('status-dot', `status-${contact.status.replace('_', '-')}`)} />
          </div>
        </div>
        <div className="mobile-contact-meta">
          {contact.city && (
            <span className="mobile-contact-meta-item">
              <MapPin className="mobile-contact-meta-icon" />
              {contact.city}
            </span>
          )}
          {phoneCount > 0 && (
            <span className="mobile-contact-meta-item">
              <Phone className="mobile-contact-meta-icon" />
              {phoneCount}
            </span>
          )}
        </div>
      </div>

      {firstPhone && (
        <button
          onClick={handleCall}
          className="mobile-contact-call-btn"
          aria-label="Ring"
        >
          <Phone className="w-4 h-4" />
        </button>
      )}
    </div>
  );
});

