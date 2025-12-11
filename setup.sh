#!/bin/bash

# ============================================================================
# Script d'installation complète JETC_Immo
# Usage: ./setup.sh
# ============================================================================

set -e  # Arrêter en cas d'erreur

echo "🚀 Installation JETC_Immo"
echo "=========================="
echo ""

# Vérifier Node.js
echo "📦 Vérification de Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    echo "   Installer Node.js v18+ depuis: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js $NODE_VERSION trouvé"
echo ""

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm $NPM_VERSION trouvé"
echo ""

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

echo ""
echo "✅ Dépendances installées"
echo ""

# Créer .env.local si n'existe pas
if [ ! -f .env.local ]; then
    echo "⚙️  Création du fichier .env.local..."
    cp .env.example .env.local
    
    echo ""
    echo "⚠️  IMPORTANT: Éditer .env.local avec vos clés Supabase"
    echo ""
    echo "   1. Créer un projet sur https://supabase.com"
    echo "   2. Récupérer l'URL et les clés API"
    echo "   3. Éditer .env.local:"
    echo "      nano .env.local"
    echo ""
else
    echo "✅ Fichier .env.local existe déjà"
    echo ""
fi

# Afficher les prochaines étapes
echo "📋 Prochaines étapes:"
echo ""
echo "   1. Configurer Supabase:"
echo "      - Créer un projet sur https://supabase.com"
echo "      - Éditer .env.local avec vos clés"
echo ""
echo "   2. Exécuter les migrations SQL:"
echo "      - Ouvrir le Dashboard Supabase > SQL Editor"
echo "      - Exécuter dans l'ordre:"
echo "        * supabase/schema/00_init_schema.sql"
echo "        * supabase/schema/01_tables.sql"
echo "        * supabase/schema/02_relations.sql"
echo "        * supabase/schema/03_views.sql"
echo "        * supabase/schema/04_functions.sql"
echo "        * supabase/schema/05_triggers.sql"
echo "        * supabase/policies/*.sql (tous)"
echo "        * supabase/storage/storage_buckets.sql"
echo ""
echo "   3. Démarrer le serveur:"
echo "      npm run dev"
echo ""
echo "   4. Tester l'API:"
echo "      curl http://localhost:3000/api/health"
echo ""
echo "📚 Documentation complète: docs/API.md"
echo "🚀 Guide déploiement: docs/DEPLOYMENT.md"
echo ""
echo "✅ Installation terminée!"
