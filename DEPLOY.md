# 🚀 Deployment Guide - Ringoptima V3 Enterprise

## Steg 1: Skapa GitHub Repository

1. Gå till [github.com/new](https://github.com/new)
2. Skapa ett **nytt repository** med namnet: `ringoptima-v3-enterprise` (eller ditt eget namn)
3. **Viktigt**: Välj **Public** (för GitHub Pages)
4. Klicka **"Create repository"**

## Steg 2: Initialisera Git och Push

```bash
cd /Users/a313/Desktop/Curser/ringoptima-v3-enterprise

# Initialisera git
git init

# Lägg till remote
git remote add origin https://github.com/DITT-USERNAME/ringoptima-v3-enterprise.git

# Lägg till alla filer (utom .env)
git add .
git commit -m "Initial commit: Ringoptima V3 Enterprise"

# Push till GitHub
git branch -M main
git push -u origin main
```

## Steg 3: Uppdatera Konfiguration

**Uppdatera `vite.config.ts`:**
```typescript
base: '/DITT-REPO-NAMN/',
```

**Uppdatera `package.json`:**
```json
"homepage": "https://DITT-USERNAME.github.io/DITT-REPO-NAMN"
```

**Uppdatera `index.html` och `manifest.json`:**
- Ersätt alla `/ringoptima-v3-enterprise/` med `/DITT-REPO-NAMN/`

## Steg 4: Deploya till GitHub Pages

```bash
# Bygg projektet
npm run build

# Deploya till GitHub Pages
npx gh-pages -d dist --dotfiles

# Push ändringar
git add .
git commit -m "Deploy to GitHub Pages"
git push
```

## Steg 5: Aktivera GitHub Pages

1. Gå till ditt repo på GitHub
2. Klicka **Settings** → **Pages**
3. Under **Source**, välj **gh-pages branch**
4. Klicka **Save**

Din app är nu live på:
**https://DITT-USERNAME.github.io/DITT-REPO-NAMN/**

---

## ⚠️ Viktigt: Environment Variables

GitHub Pages kan inte läsa `.env` filer. Du behöver:

1. Gå till ditt repo → **Settings** → **Secrets and variables** → **Actions**
2. Lägg till secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

Eller använd **Supabase Dashboard** → **Settings** → **API** och kopiera värdena direkt i koden (endast för public anon key).

---

## 🔄 Automatisk Deployment (Optional)

Skapa `.github/workflows/deploy.yml` för automatisk deployment vid varje push.

