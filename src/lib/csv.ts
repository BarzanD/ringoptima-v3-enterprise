// ═══════════════════════════════════════════════════════════════════════════════
// RINGOPTIMA V3 ENTERPRISE - CSV PARSING & EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

import type { Contact, NewContact } from '../types';

/** Parsar CSV-text till 2D-array med korrekt hantering av citattecken och multiline cells */
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
        // Inuti citerad cell, behåll newlines som del av cellen
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
        // Row delimiter - endast när vi INTE är inne i en citerad cell
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
  if (currentCell.trim() || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(cell => cell !== '')) {
      rows.push(currentRow);
    }
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
    /(\d{2,4}[\s-]?\d{2,3}[\s-]?\d{2,3}[\s-]?\d{0,3})/g, // 070-123 45 67, 0152-154 23, 0383-46 47 27
    /(\+\d{10,})/g, // +46701234567
    /(\d{7,})/g, // 701234567 (minst 7 siffror)
  ];
  
  const operatorRegex = /(Telia|Tele2|Tre|HI3G|Telenor|Comviq|TeliaSonera|Telness|Advoco|HI3G Access)/gi;
  
  // Enkel telefon från Telefonnummer-kolumnen
  if (simplePhone && simplePhone.trim()) {
    // Försök hitta alla telefonnummer i strängen (kan vara flera)
    for (const pattern of phonePatterns) {
      const matches = simplePhone.matchAll(pattern);
      for (const match of matches) {
        const phoneStr = match[1];
        const normalized = normalizePhone(phoneStr);
        if (isValidPhone(normalized) && !seenPhones.has(normalized)) {
          phones.push(normalized);
          seenPhones.add(normalized);
        }
      }
    }
    
    // Om inga telefonnummer hittades med pattern, försök normalisera hela strängen
    if (phones.length === 0) {
      const normalized = normalizePhone(simplePhone);
      if (isValidPhone(normalized) && !seenPhones.has(normalized)) {
        phones.push(normalized);
        seenPhones.add(normalized);
      }
    }
  }
  
  // Komplex telefondata från Operatör-kolumnen
  if (phoneData) {
    // Försök hitta telefonnummer i strukturerad form
    // Format: "0152-154 23 Skaldjur AB Telia Sverige AB"
    // Dela upp i rader, men hantera även telefonnummer som inte är på egen rad
    const lines = phoneData.split(/\n/);
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Hoppa över tomma rader
      if (!trimmedLine) continue;
      
      // Hoppa över header-rader och info-text
      if (trimmedLine.match(/^(Telefonnummer|Användare|Operatör|Senaste|Tidigare|Typ|Är|Info|Information|Andra|Föregående|Nästa|Kontakta|Lås|Köp|Hittar|har|Med|tjänsten|Nummer|Plus|Lås|Swish|se|alla|nummer|direkt|Köp|för|kr|med)/i)) {
        continue;
      }
      
      // Hitta telefonnummer i början av raden (format: "0152-154 23" eller "070-123 45 67")
      // Först försök hitta telefonnummer i början av raden
      const leadingPhoneMatch = trimmedLine.match(/^[\s]*(\d{2,4}[\s-]?\d{2,3}[\s-]?\d{2,3}[\s-]?\d{0,3})/);
      if (leadingPhoneMatch) {
        const phoneStr = leadingPhoneMatch[1];
        const normalized = normalizePhone(phoneStr);
        
        if (isValidPhone(normalized) && !seenPhones.has(normalized)) {
          phones.push(normalized);
          seenPhones.add(normalized);
          
          // Extrahera användare (text efter telefonnummer, före operatör)
          const afterPhone = trimmedLine.substring(leadingPhoneMatch[0].length);
          const operatorMatch = afterPhone.match(operatorRegex);
          if (operatorMatch) {
            const userText = afterPhone.substring(0, operatorMatch.index).trim();
            if (userText && userText.length > 2 && !userText.match(/^(Kontakta|Info|Är|Andra|Information|Mobil|Fast|Växel|AB|Aktiebolag)/i)) {
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
      
      // Sök även efter telefonnummer med andra mönster i hela raden (för att hitta fler telefonnummer)
      for (const pattern of phonePatterns) {
        const matches = trimmedLine.matchAll(pattern);
        for (const match of matches) {
          // Hoppa över om vi redan hittade detta nummer i början av raden
          if (leadingPhoneMatch && match.index === leadingPhoneMatch.index) {
            continue;
          }
          
          const phoneStr = match[1];
          const normalized = normalizePhone(phoneStr);
          
          if (isValidPhone(normalized) && !seenPhones.has(normalized)) {
            phones.push(normalized);
            seenPhones.add(normalized);
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
  let skippedCount = 0;
  let skippedReasons: Record<string, number> = {
    noName: 0,
    noPhone: 0,
    invalidFormat: 0,
  };
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    
    // Kontrollera att raden har rätt antal kolumner (minst 3 för att vara en giltig rad)
    if (row.length < 3) {
      skippedCount++;
      skippedReasons.invalidFormat++;
      continue;
    }
    
    const name = row[colName]?.trim() || '';
    if (!name) {
      skippedCount++;
      skippedReasons.noName++;
      continue;
    }
    
    // Extrahera telefonnummer från alla relevanta kolumner
    const phoneExtract = extractPhoneData(
      colPhone !== -1 ? row[colPhone] || '' : '',
      colPhoneData !== -1 ? row[colPhoneData] || '' : '',
      colStyrelse !== -1 ? row[colStyrelse] || '' : ''
    );
    
    // Skippa om inga telefonnummer
    if (!phoneExtract.phones || phoneExtract.phones.trim() === '') {
      skippedCount++;
      skippedReasons.noPhone++;
      continue;
    }
    
    // Säkerställ att vi har minst ett telefonnummer
    const phoneList = phoneExtract.phones.split('\n').filter(p => p.trim());
    if (phoneList.length === 0) {
      skippedCount++;
      skippedReasons.noPhone++;
      continue;
    }
    
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
  
  // Logga statistik
  if (skippedCount > 0) {
    console.log(`CSV Import: ${contacts.length} kontakter importerade, ${skippedCount} rader hoppades över`, skippedReasons);
  }
  
  // Logga statistik om önskat
  if (skippedCount > 0) {
    console.log(`CSV Import: ${contacts.length} kontakter importerade, ${skippedCount} rader hoppades över`);
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

