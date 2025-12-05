#!/bin/bash
# Quick deploy med förinställda värden
GITHUB_USERNAME="BarzanD"
REPO_NAME="ringoptima-v3-enterprise"

echo "🚀 Deployar Ringoptima V3 Enterprise..."
echo "Username: $GITHUB_USERNAME"
echo "Repo: $REPO_NAME"
echo ""

# Uppdatera konfiguration
BASE_PATH="/$REPO_NAME"
HOMEPAGE="https://$GITHUB_USERNAME.github.io/$REPO_NAME"

sed -i.bak "s|base: '/ringoptima-v3-enterprise/'|base: '$BASE_PATH/'|g" vite.config.ts 2>/dev/null && rm -f vite.config.ts.bak || true
sed -i.bak "s|\"homepage\": \".*\"|\"homepage\": \"$HOMEPAGE\"|g" package.json 2>/dev/null && rm -f package.json.bak || true
sed -i.bak "s|/ringoptima-v3-enterprise/|$BASE_PATH/|g" index.html 2>/dev/null && rm -f index.html.bak || true
sed -i.bak "s|/ringoptima-v3-enterprise/|$BASE_PATH/|g" public/manifest.json 2>/dev/null && rm -f public/manifest.json.bak || true
sed -i.bak "s|/ringoptima-v3-enterprise/|$BASE_PATH/|g" src/main.tsx 2>/dev/null && rm -f src/main.tsx.bak || true

echo "✅ Konfiguration uppdaterad"
echo "📦 Bygger..."
npm run build

echo "📦 Skapar repo..."
gh repo create "$REPO_NAME" --public --source=. --remote=origin --push=false 2>/dev/null || echo "Repo finns redan"

echo "💾 Pushar..."
git add .
git commit -m "Deploy Ringoptima V3 Enterprise" || true
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git" 2>/dev/null || git remote set-url origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
git push -u origin main

echo "🌐 Deployar..."
npx gh-pages -d dist --dotfiles

echo ""
echo "✅ KLART! Din app: $HOMEPAGE"
