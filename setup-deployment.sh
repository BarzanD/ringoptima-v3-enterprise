#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# Setup Script - Uppdaterar konfiguration för GitHub Pages deployment
# ═══════════════════════════════════════════════════════════════════════════════

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔧 Setup för GitHub Pages Deployment"
echo ""

# Fråga efter GitHub username
read -p "GitHub Username: " GITHUB_USERNAME
read -p "Repository namn: " REPO_NAME

if [ -z "$GITHUB_USERNAME" ] || [ -z "$REPO_NAME" ]; then
    echo "❌ Username och repo-namn krävs!"
    exit 1
fi

BASE_PATH="/$REPO_NAME"
HOMEPAGE="https://$GITHUB_USERNAME.github.io/$REPO_NAME"

echo ""
echo "📝 Uppdaterar konfiguration..."
echo "   Base path: $BASE_PATH"
echo "   Homepage: $HOMEPAGE"
echo ""

# Uppdatera vite.config.ts
if [ -f "vite.config.ts" ]; then
    sed -i.bak "s|base: '/ringoptima-v3-enterprise/'|base: '$BASE_PATH/'|g" vite.config.ts
    rm -f vite.config.ts.bak
    echo "✅ vite.config.ts uppdaterad"
fi

# Uppdatera package.json
if [ -f "package.json" ]; then
    sed -i.bak "s|\"homepage\": \".*\"|\"homepage\": \"$HOMEPAGE\"|g" package.json
    rm -f package.json.bak
    echo "✅ package.json uppdaterad"
fi

# Uppdatera index.html
if [ -f "index.html" ]; then
    sed -i.bak "s|/ringoptima-v3-enterprise/|$BASE_PATH/|g" index.html
    rm -f index.html.bak
    echo "✅ index.html uppdaterad"
fi

# Uppdatera manifest.json
if [ -f "public/manifest.json" ]; then
    sed -i.bak "s|/ringoptima-v3-enterprise/|$BASE_PATH/|g" public/manifest.json
    rm -f public/manifest.json.bak
    echo "✅ manifest.json uppdaterad"
fi

# Uppdatera main.tsx
if [ -f "src/main.tsx" ]; then
    sed -i.bak "s|/ringoptima-v3-enterprise/|$BASE_PATH/|g" src/main.tsx
    rm -f src/main.tsx.bak
    echo "✅ src/main.tsx uppdaterad"
fi

echo ""
echo -e "${GREEN}✅ Alla filer uppdaterade!${NC}"
echo ""
echo "📋 Nästa steg:"
echo "   1. git init"
echo "   2. git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
echo "   3. git add ."
echo "   4. git commit -m 'Initial commit'"
echo "   5. git push -u origin main"
echo "   6. ./deploy.sh"
echo ""
echo "🔗 Din app kommer vara på: $HOMEPAGE"

