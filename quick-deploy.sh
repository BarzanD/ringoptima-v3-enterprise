#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# Quick Deploy - Snabb deployment med standardinställningar
# ═══════════════════════════════════════════════════════════════════════════════

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Quick Deploy - Ringoptima V3 Enterprise${NC}"
echo ""

# Standardvärden
DEFAULT_REPO="ringoptima-v3-enterprise"

# Fråga efter GitHub username
read -p "GitHub Username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ GitHub username krävs!"
    exit 1
fi

# Fråga efter repo namn (med default)
read -p "Repository namn [$DEFAULT_REPO]: " REPO_NAME
REPO_NAME=${REPO_NAME:-$DEFAULT_REPO}

echo ""
echo "📋 Konfiguration:"
echo "   Username: $GITHUB_USERNAME"
echo "   Repo: $REPO_NAME"
echo ""

# Uppdatera konfiguration
BASE_PATH="/$REPO_NAME"
HOMEPAGE="https://$GITHUB_USERNAME.github.io/$REPO_NAME"

echo "🔧 Uppdaterar konfiguration..."

# Uppdatera alla filer
sed -i.bak "s|base: '/ringoptima-v3-enterprise/'|base: '$BASE_PATH/'|g" vite.config.ts 2>/dev/null && rm -f vite.config.ts.bak || true
sed -i.bak "s|\"homepage\": \".*\"|\"homepage\": \"$HOMEPAGE\"|g" package.json 2>/dev/null && rm -f package.json.bak || true
sed -i.bak "s|/ringoptima-v3-enterprise/|$BASE_PATH/|g" index.html 2>/dev/null && rm -f index.html.bak || true
sed -i.bak "s|/ringoptima-v3-enterprise/|$BASE_PATH/|g" public/manifest.json 2>/dev/null && rm -f public/manifest.json.bak || true
sed -i.bak "s|/ringoptima-v3-enterprise/|$BASE_PATH/|g" src/main.tsx 2>/dev/null && rm -f src/main.tsx.bak || true

echo "✅ Konfiguration uppdaterad"
echo ""

# Bygg
echo "📦 Bygger projektet..."
npm run build
echo "✅ Bygge klart"
echo ""

# Git setup
if [ ! -d ".git" ]; then
    echo "🔧 Initialiserar Git..."
    git init
    git branch -M main
fi

# Remote
REPO_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
if ! git remote | grep -q "origin"; then
    git remote add origin "$REPO_URL"
else
    git remote set-url origin "$REPO_URL"
fi

# Commit och push
echo "💾 Committar och pushar..."
git add .
git commit -m "Deploy Ringoptima V3 Enterprise" || true
git push -u origin main || {
    echo ""
    echo "⚠️  Push misslyckades. Skapa repo först:"
    echo "   https://github.com/new"
    echo "   Namn: $REPO_NAME"
    echo "   Public"
    exit 1
}

echo "✅ Push lyckades"
echo ""

# Deploy
echo "🌐 Deployar till GitHub Pages..."
npx gh-pages -d dist --dotfiles

echo ""
echo -e "${GREEN}✅ DEPLOYMENT KLART!${NC}"
echo ""
echo "🔗 Din app: $HOMEPAGE"
echo ""
echo "📋 Aktivera GitHub Pages:"
echo "   1. https://github.com/$GITHUB_USERNAME/$REPO_NAME/settings/pages"
echo "   2. Source: gh-pages branch"
echo "   3. Save"
echo ""

