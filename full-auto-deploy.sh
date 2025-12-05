#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# Full Auto Deploy - Skapar repo och deployar automatiskt
# ═══════════════════════════════════════════════════════════════════════════════

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 Full Auto Deploy - Ringoptima V3 Enterprise         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Kontrollera GitHub CLI
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) saknas${NC}"
    echo "   Installera: brew install gh"
    exit 1
fi

# Kontrollera inloggning
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Inte inloggad i GitHub CLI${NC}"
    echo "   Loggar in..."
    gh auth login
fi

# Hämta GitHub username
GITHUB_USERNAME=$(gh api user -q .login 2>/dev/null || echo "")

if [ -z "$GITHUB_USERNAME" ]; then
    read -p "GitHub Username: " GITHUB_USERNAME
fi

# Repo namn
read -p "Repository namn [ringoptima-v3-enterprise]: " REPO_NAME
REPO_NAME=${REPO_NAME:-ringoptima-v3-enterprise}

BASE_PATH="/$REPO_NAME"
HOMEPAGE="https://$GITHUB_USERNAME.github.io/$REPO_NAME"
REPO_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

echo ""
echo -e "${BLUE}📋 Konfiguration:${NC}"
echo "   Username: $GITHUB_USERNAME"
echo "   Repo: $REPO_NAME"
echo "   URL: $HOMEPAGE"
echo ""

# Skapa repo om det inte finns
if ! gh repo view "$GITHUB_USERNAME/$REPO_NAME" &> /dev/null; then
    echo -e "${YELLOW}📦 Skapar GitHub repository...${NC}"
    gh repo create "$REPO_NAME" --public --source=. --remote=origin --push=false || {
        echo -e "${RED}❌ Kunde inte skapa repo${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Repo skapat!${NC}"
else
    echo -e "${GREEN}✅ Repo finns redan${NC}"
fi

# Uppdatera konfiguration
echo -e "${YELLOW}🔧 Uppdaterar konfiguration...${NC}"
sed -i.bak "s|base: '/ringoptima-v3-enterprise/'|base: '$BASE_PATH/'|g" vite.config.ts 2>/dev/null && rm -f vite.config.ts.bak || true
sed -i.bak "s|\"homepage\": \".*\"|\"homepage\": \"$HOMEPAGE\"|g" package.json 2>/dev/null && rm -f package.json.bak || true
sed -i.bak "s|/ringoptima-v3-enterprise/|$BASE_PATH/|g" index.html 2>/dev/null && rm -f index.html.bak || true
sed -i.bak "s|/ringoptima-v3-enterprise/|$BASE_PATH/|g" public/manifest.json 2>/dev/null && rm -f public/manifest.json.bak || true
sed -i.bak "s|/ringoptima-v3-enterprise/|$BASE_PATH/|g" src/main.tsx 2>/dev/null && rm -f src/main.tsx.bak || true
echo -e "${GREEN}✅ Konfiguration uppdaterad${NC}"

# Bygg
echo -e "${YELLOW}📦 Bygger projektet...${NC}"
npm run build
echo -e "${GREEN}✅ Bygge klart${NC}"

# Git setup
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}🔧 Initialiserar Git...${NC}"
    git init
    git branch -M main
fi

# Remote
if ! git remote | grep -q "origin"; then
    git remote add origin "$REPO_URL"
else
    git remote set-url origin "$REPO_URL"
fi

# Commit och push
echo -e "${YELLOW}💾 Committar och pushar...${NC}"
git add .
git commit -m "Deploy Ringoptima V3 Enterprise to GitHub Pages" || true
git push -u origin main
echo -e "${GREEN}✅ Push lyckades${NC}"

# Deploy
echo -e "${YELLOW}🌐 Deployar till GitHub Pages...${NC}"
npx gh-pages -d dist --dotfiles

# Aktivera GitHub Pages via API
echo -e "${YELLOW}⚙️  Aktiverar GitHub Pages...${NC}"
gh api repos/$GITHUB_USERNAME/$REPO_NAME/pages \
  -X POST \
  -f source[branch]=gh-pages \
  -f source[path]=/ || echo "   ℹ️  Pages kan behöva aktiveras manuellt"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ DEPLOYMENT LYCKADES!                                 ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}🔗 Din app är live på:${NC}"
echo -e "${GREEN}   $HOMEPAGE${NC}"
echo ""
echo -e "${YELLOW}⏱️  Det kan ta 1-2 minuter innan sidan är tillgänglig${NC}"
echo ""

