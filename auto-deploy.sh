#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# Automatisk Deployment Script - Ringoptima V3 Enterprise
# ═══════════════════════════════════════════════════════════════════════════════

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Ringoptima V3 Enterprise - Automatisk Deployment        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Kontrollera att vi är i rätt mapp
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Fel: Kör detta script från projektets rotmapp${NC}"
    exit 1
fi

# Fråga efter GitHub credentials
echo -e "${YELLOW}📝 Ange dina GitHub-uppgifter:${NC}"
read -p "GitHub Username: " GITHUB_USERNAME
read -p "Repository namn (t.ex. ringoptima-v3-enterprise): " REPO_NAME

if [ -z "$GITHUB_USERNAME" ] || [ -z "$REPO_NAME" ]; then
    echo -e "${RED}❌ Username och repo-namn krävs!${NC}"
    exit 1
fi

BASE_PATH="/$REPO_NAME"
HOMEPAGE="https://$GITHUB_USERNAME.github.io/$REPO_NAME"
REPO_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

echo ""
echo -e "${BLUE}📋 Konfiguration:${NC}"
echo "   Username: $GITHUB_USERNAME"
echo "   Repo: $REPO_NAME"
echo "   Base path: $BASE_PATH"
echo "   Homepage: $HOMEPAGE"
echo ""

# Uppdatera konfigurationsfiler
echo -e "${YELLOW}🔧 Uppdaterar konfigurationsfiler...${NC}"

# vite.config.ts
if [ -f "vite.config.ts" ]; then
    sed -i.bak "s|base: '/ringoptima-v3-enterprise/'|base: '$BASE_PATH/'|g" vite.config.ts
    rm -f vite.config.ts.bak 2>/dev/null || true
    echo "   ✅ vite.config.ts"
fi

# package.json
if [ -f "package.json" ]; then
    sed -i.bak "s|\"homepage\": \".*\"|\"homepage\": \"$HOMEPAGE\"|g" package.json
    rm -f package.json.bak 2>/dev/null || true
    echo "   ✅ package.json"
fi

# index.html
if [ -f "index.html" ]; then
    sed -i.bak "s|/ringoptima-v3-enterprise/|$BASE_PATH/|g" index.html
    rm -f index.html.bak 2>/dev/null || true
    echo "   ✅ index.html"
fi

# manifest.json
if [ -f "public/manifest.json" ]; then
    sed -i.bak "s|/ringoptima-v3-enterprise/|$BASE_PATH/|g" public/manifest.json
    rm -f public/manifest.json.bak 2>/dev/null || true
    echo "   ✅ manifest.json"
fi

# main.tsx
if [ -f "src/main.tsx" ]; then
    sed -i.bak "s|/ringoptima-v3-enterprise/|$BASE_PATH/|g" src/main.tsx
    rm -f src/main.tsx.bak 2>/dev/null || true
    echo "   ✅ src/main.tsx"
fi

echo ""

# Bygg projektet
echo -e "${YELLOW}📦 Bygger projektet...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Bygget misslyckades${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Bygget lyckades!${NC}"
echo ""

# Git setup
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}🔧 Initialiserar Git...${NC}"
    git init
    echo "   ✅ Git initialiserat"
fi

# Lägg till remote (om inte redan finns)
if ! git remote | grep -q "origin"; then
    echo -e "${YELLOW}🔗 Lägger till remote...${NC}"
    git remote add origin "$REPO_URL"
    echo "   ✅ Remote tillagd: $REPO_URL"
else
    echo -e "${YELLOW}🔄 Uppdaterar remote...${NC}"
    git remote set-url origin "$REPO_URL"
    echo "   ✅ Remote uppdaterad"
fi

# Commit ändringar
echo -e "${YELLOW}💾 Committar ändringar...${NC}"
git add .
git commit -m "Deploy Ringoptima V3 Enterprise to GitHub Pages" || echo "   ℹ️  Inga nya ändringar att committa"

# Push till main
echo -e "${YELLOW}📤 Pushar till GitHub...${NC}"
git branch -M main 2>/dev/null || true
git push -u origin main || {
    echo -e "${RED}❌ Push misslyckades${NC}"
    echo ""
    echo -e "${YELLOW}💡 Tips:${NC}"
    echo "   1. Skapa repo först på: https://github.com/new"
    echo "   2. Repo-namn: $REPO_NAME"
    echo "   3. Välj Public"
    echo "   4. Kör detta script igen"
    exit 1
}

echo -e "${GREEN}✅ Push lyckades!${NC}"
echo ""

# Deploya till GitHub Pages
echo -e "${YELLOW}🌐 Deployar till GitHub Pages...${NC}"

# Installera gh-pages om det saknas
if ! command -v gh-pages &> /dev/null; then
    echo "   📦 Installerar gh-pages..."
    npm install -g gh-pages 2>/dev/null || npm install --save-dev gh-pages
fi

# Deploya
npx gh-pages -d dist --dotfiles

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ DEPLOYMENT LYCKADES!                                 ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}🔗 Din app kommer vara live på:${NC}"
    echo -e "${GREEN}   $HOMEPAGE${NC}"
    echo ""
    echo -e "${YELLOW}📋 Sista steget:${NC}"
    echo "   1. Gå till: https://github.com/$GITHUB_USERNAME/$REPO_NAME/settings/pages"
    echo "   2. Under 'Source', välj: ${BLUE}gh-pages${NC} branch"
    echo "   3. Klicka ${GREEN}Save${NC}"
    echo ""
    echo -e "${YELLOW}⏱️  Det kan ta 1-2 minuter innan sidan är live${NC}"
    echo ""
else
    echo -e "${RED}❌ Deployment misslyckades${NC}"
    exit 1
fi

