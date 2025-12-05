# 🚀 Ringoptima V3 Enterprise

> **Nästa generation kontakthantering för professionella säljteam**

En premium, högpresterande kontakthanteringsapplikation byggd med React 19, TypeScript, och Supabase. Designad för enterprise-användning med fokus på UX, tillgänglighet, och visuell excellens.

![Version](https://img.shields.io/badge/version-3.0.0-brand)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Funktioner

### Kärnfunktionalitet
- 📥 **CSV Import** - Importera kontaktlistor med automatisk parsning
- 📤 **CSV Export** - Exportera filtrerade kontakter med UTF-8 stöd
- 🔍 **Avancerad sökning** - Sök på företag, kontaktperson, stad, telefonnummer
- 🏷️ **Status & Prioritet** - Hantera säljprocessen med tydliga statusar
- 📊 **Dashboard Analytics** - Visualisera data med interaktiva diagram

### Premium UX
- ⌨️ **Command Palette (⌘K)** - Snabb navigering och kommandon
- 💾 **Sparade filter** - Spara och återanvänd filterinställningar
- 📱 **Responsiv design** - Optimerad för desktop, tablet och mobil
- 🌙 **Modern dark theme** - Skandinavisk-inspirerad design
- ✨ **Smooth animations** - Framer Motion för polerade övergångar

### Enterprise-funktioner
- 🔄 **Real-time updates** - Supabase för molnsynkronisering
- 📶 **Offline indicator** - Tydlig status för nätverksanslutning
- ⚡ **Virtual scrolling** - Hantera tusentals kontakter smidigt
- 🎯 **Lazy loading** - Optimerad initial laddningstid
- ♿ **Tillgänglighet** - ARIA-labels, tangentbordsnavigering, fokushantering

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| **Frontend** | React 19, TypeScript 5.9 |
| **Styling** | TailwindCSS 3.4, Custom CSS Variables |
| **State** | Zustand 5.0 |
| **Animation** | Framer Motion 11 |
| **Charts** | Recharts 3.5 |
| **Database** | Supabase (PostgreSQL) |
| **Icons** | Lucide React |
| **Build** | Vite 7 |
| **Deploy** | GitHub Pages |

---

## ⚠️ KRITISKT: Skapa eget projekt

> **ANVÄND ALDRIG befintliga credentials eller databaser!**

Denna blueprint ska användas för att skapa en **helt ny, fristående version**.

---

## 🚀 Snabbstart

### Steg 1: Klona och installera

```bash
# Skapa nytt projekt
cd ringoptima-v3-enterprise
npm install
```

### Steg 2: Skapa Supabase-projekt

1. Gå till [supabase.com](https://supabase.com) och skapa nytt projekt
2. Öppna **SQL Editor** och kör innehållet i `supabase-schema.sql`
3. Gå till **Settings → API** och kopiera:
   - Project URL
   - anon/public key

### Steg 3: Konfigurera environment

Skapa `.env` i projektets rot:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### Steg 4: Starta utvecklingsserver

```bash
npm run dev
```

Öppna [http://localhost:5173](http://localhost:5173) i webbläsaren.

---

## 📦 Deployment till GitHub Pages

### Steg 1: Uppdatera konfiguration

I `vite.config.ts`:
```typescript
base: '/DITT-REPO-NAMN/',
```

I `package.json`:
```json
"homepage": "https://DITT-USERNAME.github.io/DITT-REPO-NAMN"
```

### Steg 2: Bygg och deploya

```bash
npm run build
npx gh-pages -d dist
```

Din app är nu live på: `https://DITT-USERNAME.github.io/DITT-REPO-NAMN/`

---

## ⌨️ Kortkommandon

| Kommando | Åtgärd |
|----------|--------|
| `⌘ + K` | Öppna Command Palette |
| `⌘ + I` | Importera CSV |
| `⌘ + E` | Exportera kontakter |
| `1-4` | Navigera mellan flikar |
| `ESC` | Stäng modaler |

---

## 📁 Projektstruktur

```
ringoptima-v3-enterprise/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── icons/
│       └── icon.svg           # App icon
├── src/
│   ├── components/
│   │   ├── App.tsx            # Huvudapplikation
│   │   ├── CommandPalette.tsx # ⌘K command palette
│   │   ├── ContactCard.tsx    # Kontaktkort
│   │   ├── ContactDetailModal.tsx
│   │   ├── Dashboard.tsx      # Analytics dashboard
│   │   ├── LoadingStates.tsx  # Skeleton loaders
│   │   ├── MobileNav.tsx      # Mobilnavigering
│   │   ├── MultiValueCell.tsx # Expanderbara celler
│   │   ├── SavedFiltersPanel.tsx
│   │   ├── StatCard.tsx       # Statistikkort
│   │   └── Toast.tsx          # Notifikationer
│   ├── hooks/
│   │   └── usePerformance.ts  # Performance hooks
│   ├── lib/
│   │   ├── csv.ts             # CSV parsing
│   │   ├── db.ts              # Database layer
│   │   ├── store.ts           # Zustand state
│   │   ├── supabase.ts        # Supabase client
│   │   ├── toast.ts           # Toast store
│   │   └── utils.ts           # Utilities
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   ├── index.css              # Global styles
│   ├── mobile.css             # Mobile styles
│   └── main.tsx               # Entry point
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── supabase-schema.sql
```

---

## 🎨 Design System

### Färgpalett

| Variabel | Värde | Användning |
|----------|-------|------------|
| `--color-brand-500` | `#14b89e` | Primärfärg |
| `--color-bg-primary` | `#0b1121` | Huvudbakgrund |
| `--color-text-primary` | `#f9fafb` | Primär text |
| `--color-border` | `rgba(255,255,255,0.08)` | Kantlinjer |

### Typografi

- **Display**: Clash Display
- **Body**: DM Sans
- **Mono**: JetBrains Mono

---

## 📊 CSV-format

Applikationen förväntar sig CSV med följande kolumner:

| Kolumn | Obligatorisk | Beskrivning |
|--------|--------------|-------------|
| `Företagsnamn` | ✅ | Namn på företaget |
| `Organisationsnummer` | ❌ | Svenskt orgnr |
| `Adress` | ❌ | Gatuadress |
| `Ort` | ❌ | Stad/ort |
| `Telefon` | ✅ | Telefonnummer |
| `Kontaktperson` | ❌ | Namn |
| `Roll` | ❌ | VD, Säljchef, etc. |

---

## 🔧 Konfiguration

### Environment Variables

| Variabel | Beskrivning |
|----------|-------------|
| `VITE_SUPABASE_URL` | Din Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Din Supabase anon key |

### Viktiga konstanter

```typescript
// src/lib/utils.ts
const DEBOUNCE_DELAY = 300;    // Sökfördröjning
const BATCH_SIZE = 500;         // Import batch size
const PAGE_SIZE = 1000;         // Pagination size
```

---

## 🧪 Testning

```bash
# Typkontroll
npm run typecheck

# Bygg för produktion
npm run build

# Förhandsgranska produktion
npm run preview
```

---

## 📈 Performance

- **Initial load**: < 2s (lazy loading)
- **Search response**: < 100ms (debounced)
- **Scroll performance**: 60fps (virtual scrolling)
- **Bundle size**: ~180KB gzipped

---

## 🤝 Bidra

1. Fork projektet
2. Skapa en feature branch (`git checkout -b feature/amazing`)
3. Commit dina ändringar (`git commit -m 'Add amazing feature'`)
4. Push till branchen (`git push origin feature/amazing`)
5. Öppna en Pull Request

---

## 📄 Licens

MIT © 2024

---

## 🙏 Tack till

- [React](https://react.dev)
- [Supabase](https://supabase.com)
- [TailwindCSS](https://tailwindcss.com)
- [Framer Motion](https://framer.com/motion)
- [Lucide Icons](https://lucide.dev)

---

<p align="center">
  <strong>Byggd med ❤️ för enterprise-team</strong>
</p>

