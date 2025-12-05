// ═══════════════════════════════════════════════════════════════════════════════
// RINGOPTIMA V3 ENTERPRISE - CONTACT CARD (Liquid Glass Design)
// ═══════════════════════════════════════════════════════════════════════════════

import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  MapPin, 
  User, 
  Clock,
  Edit3,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import type { Contact } from '../types';
import { 
  cn, 
  getStatusLabel, 
  formatRelativeTime,
  countPhones,
  getFirstPhone,
} from '../lib/utils';

interface ContactCardProps {
  contact: Contact;
  onClick: (contact: Contact) => void;
  onCall?: (phone: string) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (id: number) => void;
  delay?: number;
}

const ContactCard = memo(function ContactCard({
  contact,
  onClick,
  onCall,
  onEdit,
  onDelete,
  delay = 0,
}: ContactCardProps) {
  const phoneCount = countPhones(contact.phones);
  const firstPhone = getFirstPhone(contact.phones);
  const phones = contact.phones.split('\n').filter(Boolean);
  const users = contact.users.split('\n').filter(Boolean);
  const operators = contact.operators.split('\n').filter(Boolean);

  const handleCall = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (firstPhone && onCall) {
      onCall(firstPhone);
    }
  }, [firstPhone, onCall]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(contact);
    }
  }, [contact, onEdit]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (contact.id && onDelete) {
      onDelete(contact.id);
    }
  }, [contact.id, onDelete]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.05 }}
      onClick={() => onClick(contact)}
      className="contact-card"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(contact)}
      aria-label={`Visa ${contact.name}`}
    >
      {/* 7-Kolumns Grid Layout */}
      <div className="contact-card-grid">
        {/* Kolumn 1: Företag + Adress */}
        <div className="contact-card-column">
          <div className="contact-company-name">{contact.name}</div>
          {(contact.address || contact.city) && (
            <div className="contact-secondary-info">
              {contact.address}
              {contact.address && contact.city && ', '}
              {contact.city}
            </div>
          )}
        </div>

        {/* Kolumn 2: Kontakt + Roll */}
        <div className="contact-card-column">
          {contact.contact && (
            <div className="contact-name">{contact.contact}</div>
          )}
          {contact.role && (
            <div className="contact-secondary-info">{contact.role}</div>
          )}
        </div>

        {/* Kolumn 3: Telefonnummer + metadata */}
        <div className="contact-card-column">
          {phones.length > 0 ? (
            <>
              <div className="contact-primary-info">
                <Phone className="contact-icon" />
                {phones[0]}
              </div>
              {phoneCount > 1 && (
                <div className="contact-secondary-info">
                  +{phoneCount - 1} till
                </div>
              )}
            </>
          ) : (
            <div className="contact-secondary-info">—</div>
          )}
        </div>

        {/* Kolumn 4: Användare + metadata */}
        <div className="contact-card-column">
          {users.length > 0 ? (
            <>
              <div className="contact-primary-info">
                <User className="contact-icon" />
                {users[0]}
              </div>
              {users.length > 1 && (
                <div className="contact-secondary-info">
                  +{users.length - 1} till
                </div>
              )}
            </>
          ) : (
            <div className="contact-secondary-info">—</div>
          )}
        </div>

        {/* Kolumn 5: Operatör + metadata */}
        <div className="contact-card-column">
          {operators.length > 0 ? (
            <>
              <div className="contact-primary-info">{operators[0]}</div>
              {operators.length > 1 && (
                <div className="contact-secondary-info">
                  +{operators.length - 1} till
                </div>
              )}
            </>
          ) : (
            <div className="contact-secondary-info">—</div>
          )}
        </div>

        {/* Kolumn 6: Status badge */}
        <div className="contact-card-column">
          <span className={cn('status-badge', `status-${contact.status.replace('_', '-')}`)}>
            {getStatusLabel(contact.status)}
          </span>
        </div>

        {/* Kolumn 7: Action buttons */}
        <div className="contact-card-column contact-actions">
          {firstPhone && (
            <button
              onClick={handleCall}
              className="action-button"
              aria-label={`Ring ${contact.name}`}
            >
              <Phone className="action-icon" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={handleEdit}
              className="action-button"
              aria-label="Redigera"
            >
              <Edit3 className="action-icon" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="action-button action-button-danger"
              aria-label="Radera"
            >
              <Trash2 className="action-icon" />
            </button>
          )}
        </div>
      </div>
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
}: Omit<ContactCardProps, 'delay' | 'onEdit' | 'onDelete'>) {
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
