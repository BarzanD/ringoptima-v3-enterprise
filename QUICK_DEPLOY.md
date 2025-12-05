# ⚡ Snabb Deployment

## 1. Skapa GitHub Repo
Gå till: https://github.com/new
- Namn: `ringoptima-v3-enterprise` (eller ditt eget)
- Public
- Skapa repo

## 2. Kör deployment

```bash
# Initialisera git (om inte redan gjort)
git init
git add .
git commit -m "Initial commit"

# Lägg till remote (ersätt DITT-USERNAME och DITT-REPO)
git remote add origin https://github.com/DITT-USERNAME/DITT-REPO.git
git branch -M main
git push -u origin main

# Deploya
./deploy.sh
```

## 3. Aktivera GitHub Pages
1. Gå till repo → Settings → Pages
2. Source: `gh-pages` branch
3. Save

## 4. Din URL
`https://DITT-USERNAME.github.io/DITT-REPO/`

---

## 🔧 Uppdatera konfiguration först!

Innan deployment, uppdatera:
- `vite.config.ts` → `base: '/DITT-REPO-NAMN/'`
- `package.json` → `homepage: 'https://DITT-USERNAME.github.io/DITT-REPO-NAMN'`
- `index.html` → Ersätt `/ringoptima-v3-enterprise/` med `/DITT-REPO-NAMN/`
- `manifest.json` → Samma som ovan
