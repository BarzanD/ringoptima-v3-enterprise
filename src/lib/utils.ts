// ═══════════════════════════════════════════════════════════════════════════════
// RINGOPTIMA V3 ENTERPRISE - UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Contact, Operator, ContactStatus, Priority } from '../types';

/** Kombinera Tailwind-klasser säkert */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Formatera datum till svenskt format */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Formatera datum med tid */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Relativ tid (t.ex. "2 timmar sedan") */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just nu';
  if (diffMins < 60) return `${diffMins} min sedan`;
  if (diffHours < 24) return `${diffHours} tim sedan`;
  if (diffDays < 7) return `${diffDays} dagar sedan`;
  
  return formatDate(dateString);
}

/** Räkna telefonnummer i en kontakt */
export function countPhones(phones: string): number {
  if (!phones || phones.trim() === '') return 0;
  return phones.split('\n').filter(p => p.trim()).length;
}

/** Extrahera första telefonnumret */
export function getFirstPhone(phones: string): string {
  if (!phones) return '';
  const first = phones.split('\n')[0]?.trim();
  return first || '';
}

/** Detektera operatör från telefonnummer */
export function detectOperator(phone: string): Operator {
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Svenska mobilprefix
  const teliaPrefix = ['070', '072', '076'];
  const tele2Prefix = ['070', '073', '076'];
  const trePrefix = ['073', '076'];
  const telenorPrefix = ['070', '079'];
  
  const prefix = cleanPhone.slice(0, 3);
  
  // Förenklad logik - i verkligheten behövs portabilitetskontroll
  if (teliaPrefix.includes(prefix)) return 'telia';
  if (tele2Prefix.includes(prefix)) return 'tele2';
  if (trePrefix.includes(prefix)) return 'tre';
  if (telenorPrefix.includes(prefix)) return 'telenor';
  
  return 'other';
}

/** Status till svenska */
export function getStatusLabel(status: ContactStatus): string {
  const labels: Record<ContactStatus, string> = {
    new: 'Ny',
    contacted: 'Kontaktad',
    interested: 'Intresserad',
    not_interested: 'Ej intresserad',
    converted: 'Konverterad',
  };
  return labels[status];
}

/** Status färg */
export function getStatusColor(status: ContactStatus): string {
  const colors: Record<ContactStatus, string> = {
    new: 'bg-slate-500',
    contacted: 'bg-sky-500',
    interested: 'bg-amber-500',
    not_interested: 'bg-red-500',
    converted: 'bg-brand-500',
  };
  return colors[status];
}

/** Prioritet till svenska */
export function getPriorityLabel(priority: Priority): string {
  const labels: Record<Priority, string> = {
    high: 'Hög',
    medium: 'Medium',
    low: 'Låg',
  };
  return labels[priority];
}

/** Prioritet färg */
export function getPriorityColor(priority: Priority): string {
  const colors: Record<Priority, string> = {
    high: 'text-red-500',
    medium: 'text-amber-500',
    low: 'text-slate-400',
  };
  return colors[priority];
}

/** Operatör till visningsnamn */
export function getOperatorLabel(operator: Operator): string {
  const labels: Record<Operator, string> = {
    telia: 'Telia',
    tele2: 'Tele2',
    tre: 'Tre',
    telenor: 'Telenor',
    other: 'Övrig',
    '': 'Alla',
  };
  return labels[operator];
}

/** Operatör färg för diagram */
export function getOperatorColor(operator: string): string {
  const colors: Record<string, string> = {
    telia: '#7B2D8E',   // Telia lila
    tele2: '#00A0D1',   // Tele2 blå
    tre: '#E4002B',     // Tre röd
    telenor: '#00B0B9', // Telenor turkos
    other: '#6B7280',   // Grå
  };
  return colors[operator] || colors.other;
}

/** Generera unik ID */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Debounce funktion */
export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/** Throttle funktion */
export function throttle<T extends (...args: Parameters<T>) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

/** Formatera nummer med tusentalsavgränsare */
export function formatNumber(num: number): string {
  return num.toLocaleString('sv-SE');
}

/** Formatera procent */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/** Kopiera text till urklipp */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Kontrollera om enheten är mobil */
export function isMobileDevice(): boolean {
  return window.innerWidth < 768;
}

/** Kontrollera om PWA är installerad */
export function isPWAInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

/** Filtrera kontakter baserat på sökterm */
export function filterContactsBySearch(contacts: Contact[], search: string): Contact[] {
  if (!search.trim()) return contacts;
  
  const term = search.toLowerCase();
  return contacts.filter(c => 
    c.name.toLowerCase().includes(term) ||
    c.city.toLowerCase().includes(term) ||
    c.contact.toLowerCase().includes(term) ||
    c.phones.includes(term) ||
    c.org.includes(term)
  );
}

/** Sortera kontakter */
export function sortContacts(
  contacts: Contact[],
  sort: string
): Contact[] {
  const sorted = [...contacts];
  
  switch (sort) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'sv'));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name, 'sv'));
    case 'phones-desc':
      return sorted.sort((a, b) => countPhones(b.phones) - countPhones(a.phones));
    case 'phones-asc':
      return sorted.sort((a, b) => countPhones(a.phones) - countPhones(b.phones));
    case 'recent':
      return sorted.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case 'updated':
      return sorted.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    default:
      return sorted;
  }
}

/** Beräkna operatörsfördelning */
export function calculateOperatorDistribution(contacts: Contact[]): Record<string, number> {
  const distribution: Record<string, number> = {
    telia: 0,
    tele2: 0,
    tre: 0,
    telenor: 0,
    other: 0,
  };
  
  contacts.forEach(contact => {
    const ops = contact.operators.toLowerCase();
    if (ops.includes('telia')) distribution.telia++;
    else if (ops.includes('tele2')) distribution.tele2++;
    else if (ops.includes('tre') || ops.includes('hi3g')) distribution.tre++;
    else if (ops.includes('telenor')) distribution.telenor++;
    else distribution.other++;
  });
  
  return distribution;
}

