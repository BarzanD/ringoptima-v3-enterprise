#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# Deployment Script för Ringoptima V3 Enterprise
# ═══════════════════════════════════════════════════════════════════════════════

set -e

echo "🚀 Ringoptima V3 Enterprise - Deployment"
echo ""

# Färger
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Kontrollera att vi är i rätt mapp
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Fel: Kör detta script från projektets rotmapp${NC}"
    exit 1
fi

# Kontrollera att .env finns
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Varning: .env fil saknas${NC}"
fi

# Bygg projektet
echo "📦 Bygger projektet..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Bygget misslyckades${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Bygget lyckades!${NC}"
echo ""

# Kontrollera om git är initialiserat
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Git är inte initialiserat${NC}"
    echo "Kör först:"
    echo "  git init"
    echo "  git remote add origin https://github.com/DITT-USERNAME/DITT-REPO.git"
    exit 1
fi

# Kontrollera om gh-pages är installerat
if ! command -v gh-pages &> /dev/null; then
    echo "📦 Installerar gh-pages..."
    npm install -g gh-pages
fi

# Deploya
echo "🌐 Deployar till GitHub Pages..."
npx gh-pages -d dist --dotfiles

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment lyckades!${NC}"
    echo ""
    echo "🔗 Din app kommer vara live på:"
    echo "   https://DITT-USERNAME.github.io/DITT-REPO-NAMN/"
    echo ""
    echo "💡 Glöm inte att:"
    echo "   1. Uppdatera vite.config.ts med rätt base path"
    echo "   2. Uppdatera package.json med rätt homepage"
    echo "   3. Aktivera GitHub Pages i repo settings"
else
    echo -e "${RED}❌ Deployment misslyckades${NC}"
    exit 1
fi

