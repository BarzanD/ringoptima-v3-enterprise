#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# Script för att öppna Supabase SQL Editor med schema
# ═══════════════════════════════════════════════════════════════════════════════

echo "🚀 Öppnar Supabase SQL Editor..."
echo ""
echo "📋 Instruktioner:"
echo "   1. SQL Editor öppnas i din webbläsare"
echo "   2. Klicka på 'New Query'"
echo "   3. Kopiera innehållet från supabase-schema.sql"
echo "   4. Klicka 'Run' (eller tryck Cmd/Ctrl + Enter)"
echo ""
echo "🔗 Öppnar: https://supabase.com/dashboard/project/oyfncmnlmxlwpswbsgwb/sql/new"
echo ""

# Öppna i webbläsare
if command -v open &> /dev/null; then
    open "https://supabase.com/dashboard/project/oyfncmnlmxlwpswbsgwb/sql/new"
elif command -v xdg-open &> /dev/null; then
    xdg-open "https://supabase.com/dashboard/project/oyfncmnlmxlwpswbsgwb/sql/new"
else
    echo "Öppna manuellt: https://supabase.com/dashboard/project/oyfncmnlmxlwpswbsgwb/sql/new"
fi

echo ""
echo "📄 SQL-fil finns här: $(pwd)/supabase-schema.sql"
echo ""
echo "💡 Tips: Du kan kopiera hela innehållet med:"
echo "   cat supabase-schema.sql | pbcopy  # (macOS)"
echo "   cat supabase-schema.sql | xclip   # (Linux)"

