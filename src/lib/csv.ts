// ═══════════════════════════════════════════════════════════════════════════════
// RINGOPTIMA V3 ENTERPRISE - CSV PARSING & EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

import type { Contact, NewContact } from '../types';

/** Parsar CSV-text till 2D-array med korrekt hantering av citattecken */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // Escaped quote
        currentCell += '"';
        i++; // Skip next quote
      } else if (char === '"') {
        // End of quoted section
        inQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        // Start of quoted section
        inQuotes = true;
      } else if (char === ',' || char === ';') {
        // Cell delimiter
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        // Row delimiter
        currentRow.push(currentCell.trim());
        if (currentRow.some(cell => cell !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
        if (char === '\r') i++; // Skip \n in \r\n
      } else if (char !== '\r') {
        currentCell += char;
      }
    }
  }
  
  // Push last cell and row
  currentRow.push(currentCell.trim());
  if (currentRow.some(cell => cell !== '')) {
    rows.push(currentRow);
  }
  
  return rows;
}

/** Extrahera telefon, användare och operatörsdata */
export function extractPhoneData(
  simplePhone: string,
  phoneData: string,
  styrelseData: string
): { phones: string; users: string; operators: string } {
  const phones: string[] = [];
  const users: string[] = [];
  const operators: string[] = [];
  const seenPhones = new Set<string>();
  
  // Normalisera telefonnummer (ta bort alla icke-siffror utom +)
  const normalizePhone = (phone: string): string => {
    return phone.replace(/[^\d+]/g, '');
  };
  
  // Validera telefonnummer (minst 7 siffror)
  const isValidPhone = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 7;
  };
  
  // Regex för att matcha telefonnummer i olika format
  const phonePatterns = [
    /(\d{2,3}[\s-]?\d{2,3}[\s-]?\d{2,3}[\s-]?\d{2,3})/g, // 070-123 45 67, 0152-154 23
    /(\+\d{10,})/g, // +46701234567
    /(\d{8,})/g, // 701234567
  ];
  
  const operatorRegex = /(Telia|Tele2|Tre|HI3G|Telenor|Comviq|TeliaSonera|Telness|Advoco|HI3G Access)/gi;
  
  // Enkel telefon från Telefonnummer-kolumnen
  if (simplePhone && simplePhone.trim()) {
    const normalized = normalizePhone(simplePhone);
    if (isValidPhone(normalized) && !seenPhones.has(normalized)) {
      phones.push(normalized);
      seenPhones.add(normalized);
    }
  }
  
  // Komplex telefondata från Operatör-kolumnen
  if (phoneData) {
    // Försök hitta telefonnummer i strukturerad form
    // Format: "0152-154 23 Skaldjur AB Telia Sverige AB"
    const lines = phoneData.split(/\n/);
    
    for (const line of lines) {
      // Hitta telefonnummer i början av raden
      for (const pattern of phonePatterns) {
        const matches = line.matchAll(pattern);
        for (const match of matches) {
          const phoneStr = match[1];
          const normalized = normalizePhone(phoneStr);
          
          if (isValidPhone(normalized) && !seenPhones.has(normalized)) {
            phones.push(normalized);
            seenPhones.add(normalized);
            
            // Extrahera användare (text mellan telefonnummer och operatör)
            const afterPhone = line.substring(match.index! + match[0].length);
            const operatorMatch = afterPhone.match(operatorRegex);
            if (operatorMatch) {
              const userText = afterPhone.substring(0, operatorMatch.index).trim();
              if (userText && userText.length > 2 && !userText.match(/^(Kontakta|Info|Är|Andra|Information)/i)) {
                users.push(userText);
              }
              
              // Extrahera operatör
              const operatorName = operatorMatch[0];
              if (!operators.includes(operatorName)) {
                operators.push(operatorName);
              }
            }
          }
        }
      }
    }
  }
  
  // Styrelsedata
  if (styrelseData) {
    const lines = styrelseData.split(/[;\n]/);
    for (const line of lines) {
      // Hitta telefonnummer
      for (const pattern of phonePatterns) {
        const matches = line.matchAll(pattern);
        for (const match of matches) {
          const phoneStr = match[1];
          const normalized = normalizePhone(phoneStr);
          
          if (isValidPhone(normalized) && !seenPhones.has(normalized)) {
            phones.push(normalized);
            seenPhones.add(normalized);
            
            // Försök extrahera namn före telefon
            const beforePhone = line.substring(0, match.index);
            const nameMatch = beforePhone.match(/([A-ZÅÄÖ][a-zåäö]+(?:\s+[A-ZÅÄÖ][a-zåäö]+)*)/);
            if (nameMatch) {
              const name = nameMatch[1].trim();
              if (name.length > 2 && !name.match(/^(Org|Ordförande|Verkställande|Extern|E-post|Hemsida)/i)) {
                users.push(name);
              }
            }
            
            // Operatör från rad
            const opMatch = line.match(operatorRegex);
            if (opMatch && !operators.includes(opMatch[0])) {
              operators.push(opMatch[0]);
            }
          }
        }
      }
    }
  }
  
  // Om inga telefonnummer hittades, returnera tom sträng
  if (phones.length === 0) {
    return {
      phones: '',
      users: '',
      operators: '',
    };
  }
  
  return {
    phones: phones.join('\n'),
    users: users.join('\n'),
    operators: operators.join('\n'),
  };
}

/** Transformera CSV-rader till Contact-objekt */
export function transformCSV(rows: string[][], batchId: number): NewContact[] {
  if (rows.length < 2) return [];
  
  const headers = rows[0].map(h => h.toLowerCase().trim());
  const contacts: NewContact[] = [];
  
  // Hitta kolumnindex
  const findColumn = (...names: string[]): number => {
    for (const name of names) {
      const idx = headers.findIndex(h => 
        h.includes(name) || name.includes(h)
      );
      if (idx !== -1) return idx;
    }
    return -1;
  };
  
  const colName = findColumn('företagsnamn', 'företag', 'namn', 'name', 'bolag');
  const colOrg = findColumn('org', 'organisationsnummer', 'orgnr');
  const colAddress = findColumn('adress', 'address', 'gatuadress');
  const colCity = findColumn('ort', 'stad', 'city', 'postort');
  const colPhone = findColumn('telefonnummer', 'telefon', 'phone', 'tel');
  const colPhoneData = findColumn('operatör', 'telefondata', 'phonedata', 'teldata');
  const colStyrelse = findColumn('styrelse', 'board', 'ledning');
  const colContact = findColumn('kontaktperson', 'kontakt', 'contact');
  const colRole = findColumn('roll', 'titel', 'role', 'position', 'befattning');
  
  // Validera att vi har minst namn-kolumn
  if (colName === -1) {
    console.error('CSV saknar företagsnamn-kolumn');
    return [];
  }
  
  // Transformera rader
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    
    const name = row[colName]?.trim() || '';
    if (!name) continue;
    
    const phoneExtract = extractPhoneData(
      colPhone !== -1 ? row[colPhone] || '' : '',
      colPhoneData !== -1 ? row[colPhoneData] || '' : '',
      colStyrelse !== -1 ? row[colStyrelse] || '' : ''
    );
    
    // Skippa om inga telefonnummer
    if (!phoneExtract.phones) continue;
    
    contacts.push({
      batchId,
      name,
      org: colOrg !== -1 ? row[colOrg]?.trim() || '' : '',
      address: colAddress !== -1 ? row[colAddress]?.trim() || '' : '',
      city: colCity !== -1 ? row[colCity]?.trim() || '' : '',
      phones: phoneExtract.phones,
      users: phoneExtract.users,
      operators: phoneExtract.operators,
      contact: colContact !== -1 ? row[colContact]?.trim() || '' : '',
      role: colRole !== -1 ? row[colRole]?.trim() || '' : '',
      notes: '',
      priority: 'medium',
      status: 'new',
    });
  }
  
  return contacts;
}

/** Exportera kontakter till CSV med UTF-8 BOM */
export function exportToCSV(contacts: Contact[]): string {
  // UTF-8 BOM för korrekt visning i Excel
  const BOM = '\uFEFF';
  
  const headers = [
    'Företagsnamn',
    'Organisationsnummer',
    'Adress',
    'Ort',
    'Telefon',
    'Kontaktperson',
    'Roll',
    'Operatör',
    'Status',
    'Prioritet',
    'Anteckningar',
    'Senast ringd',
    'Skapad',
  ];
  
  const rows = contacts.map(c => [
    escapeCSV(c.name),
    escapeCSV(c.org),
    escapeCSV(c.address),
    escapeCSV(c.city),
    escapeCSV(c.phones.replace(/\n/g, '; ')),
    escapeCSV(c.contact),
    escapeCSV(c.role),
    escapeCSV(c.operators.replace(/\n/g, '; ')),
    escapeCSV(c.status),
    escapeCSV(c.priority),
    escapeCSV(c.notes.replace(/\n/g, ' ')),
    escapeCSV(c.lastCalled || ''),
    escapeCSV(c.createdAt),
  ]);
  
  const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  
  return BOM + csv;
}

/** Escape CSV-värde */
function escapeCSV(value: string): string {
  if (!value) return '';
  
  // Om värdet innehåller specialtecken, wrap i quotes
  if (value.includes(';') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  
  return value;
}

/** Ladda ner CSV-fil */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/** Läs CSV-fil från File-objekt */
export function readCSVFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Kunde inte läsa filen'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Fel vid läsning av fil'));
    };
    
    // Försök läsa som UTF-8 först, sedan ISO-8859-1
    reader.readAsText(file, 'UTF-8');
  });
}

