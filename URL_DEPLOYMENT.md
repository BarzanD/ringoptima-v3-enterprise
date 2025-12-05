# 🌐 Skapa Publik URL för Ringoptima V3 Enterprise

## 🎯 Snabbguide (5 minuter)

### Steg 1: Skapa GitHub Repository
1. Gå till: **https://github.com/new**
2. Repository namn: `ringoptima-v3-enterprise` (eller ditt eget)
3. Välj **Public**
4. Klicka **"Create repository"**

### Steg 2: Konfigurera Projektet
Kör setup-scriptet:
```bash
./setup-deployment.sh
```

Detta kommer fråga efter:
- Ditt GitHub username
- Repository namn

Scriptet uppdaterar automatiskt alla konfigurationsfiler!

### Steg 3: Initialisera Git och Push
```bash
# Initialisera git
git init

# Lägg till remote (ersätt med ditt username och repo-namn)
git remote add origin https://github.com/DITT-USERNAME/DITT-REPO.git

# Commit och push
git add .
git commit -m "Initial commit: Ringoptima V3 Enterprise"
git branch -M main
git push -u origin main
```

### Steg 4: Deploya till GitHub Pages
```bash
./deploy.sh
```

### Steg 5: Aktivera GitHub Pages
1. Gå till ditt repo på GitHub
2. **Settings** → **Pages**
3. Under **Source**, välj: **gh-pages** branch
4. Klicka **Save**

---

## ✅ Klart!

Din app är nu live på:
**https://DITT-USERNAME.github.io/DITT-REPO-NAMN/**

---

## 🔄 Uppdatera Appen

När du gör ändringar:
```bash
npm run build
./deploy.sh
```

Eller pusha till `main` branch om du har GitHub Actions aktiverat (automatisk deployment).

---

## ⚠️ Viktigt: Environment Variables

GitHub Pages kan inte läsa `.env` filer. Du har två alternativ:

### Alternativ 1: Public Anon Key (Rekommenderat)
Supabase anon key är säker att exponera publikt. Du kan hårdkoda den i koden för GitHub Pages.

### Alternativ 2: GitHub Secrets (för CI/CD)
Om du använder GitHub Actions, lägg till secrets:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 🆘 Felsökning

**Problem: 404 på GitHub Pages**
- Kontrollera att `base` i `vite.config.ts` matchar ditt repo-namn
- Kontrollera att `homepage` i `package.json` är korrekt
- Verifiera att GitHub Pages är aktiverat i repo settings

**Problem: Appen laddar men Supabase fungerar inte**
- Kontrollera att environment variables är korrekt konfigurerade
- Verifiera att Supabase RLS policies tillåter anonyma användare

**Problem: Assets laddas inte**
- Kontrollera att alla paths i `index.html` och `manifest.json` är korrekta
- Verifiera att `base` path i `vite.config.ts` matchar repo-namnet

---

## 📞 Support

Om du stöter på problem, kontrollera:
1. `DEPLOY.md` - Detaljerad deployment guide
2. `QUICK_DEPLOY.md` - Snabbguide
3. GitHub Pages dokumentation

