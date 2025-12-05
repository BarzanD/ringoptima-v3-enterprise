// ═══════════════════════════════════════════════════════════════════════════════
// RINGOPTIMA V3 ENTERPRISE - CONTACT DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════════════════

import { memo, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Phone,
  MapPin,
  Building2,
  User,
  Briefcase,
  Save,
  Trash2,
  Edit3,
  Check,
  Clock,
  MessageSquare,
  Copy,
  ExternalLink,
} from 'lucide-react';
import type { Contact, ContactStatus, Priority } from '../types';
import { useStore } from '../lib/store';
import { db } from '../lib/db';
import { toast } from '../lib/toast';
import {
  cn,
  getStatusLabel,
  getPriorityLabel,
  formatDateTime,
  copyToClipboard,
  countPhones,
} from '../lib/utils';
import { useFocusTrap, useIsMobile } from '../hooks/usePerformance';
import MultiValueCell from './MultiValueCell';

interface ContactDetailModalProps {
  contact: Contact;
  onClose: () => void;
  onDelete?: (id: number) => void;
}

const statusOptions: { value: ContactStatus; label: string; color: string }[] = [
  { value: 'new', label: 'Ny', color: 'bg-slate-500' },
  { value: 'contacted', label: 'Kontaktad', color: 'bg-sky-500' },
  { value: 'interested', label: 'Intresserad', color: 'bg-amber-500' },
  { value: 'not_interested', label: 'Ej intresserad', color: 'bg-red-500' },
  { value: 'converted', label: 'Konverterad', color: 'bg-brand-500' },
];

const priorityOptions: { value: Priority; label: string }[] = [
  { value: 'high', label: 'Hög' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Låg' },
];

const ContactDetailModal = memo(function ContactDetailModal({
  contact,
  onClose,
  onDelete,
}: ContactDetailModalProps) {
  const updateContact = useStore((state) => state.updateContact);
  const isMobile = useIsMobile();
  const focusTrapRef = useFocusTrap(true);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    status: contact.status,
    priority: contact.priority,
    notes: contact.notes,
    contact: contact.contact,
    role: contact.role,
  });

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSave = useCallback(async () => {
    if (!contact.id) return;
    
    setIsSaving(true);
    try {
      await db.updateContact(contact.id, {
        status: formData.status,
        priority: formData.priority,
        notes: formData.notes,
        contact: formData.contact,
        role: formData.role,
      });
      
      updateContact(contact.id, formData);
      setIsEditing(false);
      toast.success('Kontakt uppdaterad');
    } catch (error) {
      toast.error('Kunde inte spara ändringar');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  }, [contact.id, formData, updateContact]);

  const handleDelete = useCallback(async () => {
    if (!contact.id || !onDelete) return;
    
    if (confirm('Är du säker på att du vill radera denna kontakt?')) {
      try {
        await db.deleteContact(contact.id);
        onDelete(contact.id);
        onClose();
        toast.success('Kontakt raderad');
      } catch (error) {
        toast.error('Kunde inte radera kontakt');
        console.error(error);
      }
    }
  }, [contact.id, onDelete, onClose]);

  const handleCopyPhone = useCallback(async (phone: string) => {
    const success = await copyToClipboard(phone);
    if (success) {
      toast.success('Telefonnummer kopierat');
    }
  }, []);

  const handleCall = useCallback((phone: string) => {
    window.location.href = `tel:${phone.replace(/\D/g, '')}`;
  }, []);

  const initials = contact.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const ModalWrapper = isMobile ? 'div' : motion.div;
  const modalProps = isMobile ? {} : {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2 },
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          'fixed inset-0 z-50',
          isMobile ? 'mobile-modal-overlay' : 'bg-black/60 backdrop-blur-sm'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <ModalWrapper
        {...modalProps}
        ref={focusTrapRef as React.RefObject<HTMLDivElement>}
        className={cn(
          isMobile
            ? 'mobile-modal-sheet'
            : 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl glass-card'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Mobile handle */}
        {isMobile && (
          <div className="mobile-modal-handle">
            <div className="mobile-modal-handle-bar" />
          </div>
        )}

        {/* Header */}
        <div className={cn(
          'flex items-center gap-4 p-6 border-b border-slate-800/50',
          isMobile && 'p-4'
        )}>
          {/* Avatar */}
          <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold text-xl shadow-lg shadow-brand-500/30">
            {initials}
          </div>
          
          <div className="flex-1 min-w-0">
            <h2 id="modal-title" className="text-xl font-bold text-slate-100 truncate">
              {contact.name}
            </h2>
            <p className="text-sm text-slate-400">{contact.org || 'Inget orgnr'}</p>
          </div>

          <button
            onClick={onClose}
            className="btn-icon"
            aria-label="Stäng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className={cn(
          'overflow-y-auto p-6 space-y-6',
          isMobile && 'mobile-modal-body'
        )}>
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={cn(
                'btn-secondary flex items-center gap-2',
                isEditing && 'bg-brand-500/20 border-brand-500/50 text-brand-400'
              )}
            >
              <Edit3 className="w-4 h-4" />
              {isEditing ? 'Avbryt' : 'Redigera'}
            </button>
            {isEditing && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Sparar...' : 'Spara'}
              </button>
            )}
            <button
              onClick={handleDelete}
              className="btn-ghost text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Status
              </label>
              {isEditing ? (
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ContactStatus })}
                  className="select-field"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-2">
                  <span className={cn('status-dot', `status-${contact.status.replace('_', '-')}`)} />
                  <span className="text-slate-200">{getStatusLabel(contact.status)}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Prioritet
              </label>
              {isEditing ? (
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                  className="select-field"
                >
                  {priorityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-slate-200">{getPriorityLabel(contact.priority)}</span>
              )}
            </div>
          </div>

          {/* Contact Info Grid */}
          <div className="grid gap-4">
            {/* Location */}
            {(contact.address || contact.city) && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30">
                <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-400">Adress</p>
                  <p className="text-slate-200">
                    {contact.address}
                    {contact.address && contact.city && ', '}
                    {contact.city}
                  </p>
                </div>
              </div>
            )}

            {/* Contact Person */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30">
              <User className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-slate-400">Kontaktperson</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="input-field mt-1"
                    placeholder="Namn på kontaktperson"
                  />
                ) : (
                  <p className="text-slate-200">{contact.contact || '—'}</p>
                )}
              </div>
            </div>

            {/* Role */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30">
              <Briefcase className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-slate-400">Roll</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input-field mt-1"
                    placeholder="VD, Säljchef, etc."
                  />
                ) : (
                  <p className="text-slate-200">{contact.role || '—'}</p>
                )}
              </div>
            </div>

            {/* Phone Numbers */}
            {contact.phones && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30">
                <Phone className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-2">
                    Telefonnummer ({countPhones(contact.phones)})
                  </p>
                  <div className="space-y-2">
                    {contact.phones.split('\n').filter(Boolean).map((phone, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-slate-200 font-mono text-sm">{phone}</span>
                        <button
                          onClick={() => handleCopyPhone(phone)}
                          className="p-1 rounded hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
                          aria-label="Kopiera"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={`tel:${phone.replace(/\D/g, '')}`}
                          className="p-1 rounded hover:bg-brand-500/20 text-brand-400"
                          aria-label="Ring"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
              <MessageSquare className="w-4 h-4" />
              Anteckningar
            </label>
            {isEditing ? (
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-field min-h-[120px] resize-y"
                placeholder="Lägg till anteckningar om samtalet..."
              />
            ) : (
              <div className="p-4 rounded-xl bg-slate-800/30 min-h-[80px]">
                {contact.notes ? (
                  <p className="text-slate-200 whitespace-pre-wrap">{contact.notes}</p>
                ) : (
                  <p className="text-slate-500 italic">Inga anteckningar</p>
                )}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800/50">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Skapad: {formatDateTime(contact.createdAt)}
            </span>
            <span>
              Uppdaterad: {formatDateTime(contact.updatedAt)}
            </span>
          </div>
        </div>
      </ModalWrapper>
    </AnimatePresence>
  );
});

export default ContactDetailModal;

