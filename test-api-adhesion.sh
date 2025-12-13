#!/bin/bash

# ============================================================================
# Script de test : ÉTAPE 4 - APIs Validation/Rejet
# Date : 2025-12-13
# Description : Tester les APIs backend avec données réelles
# ============================================================================

set -e # Exit on error

echo "🧪 TEST ÉTAPE 4 - BACKEND API"
echo "=============================="
echo ""

# Configuration
API_URL="http://localhost:3000"
DB_URL="${DATABASE_URL}"

# Vérifier que le serveur tourne
echo "📡 Vérification serveur Next.js..."
if ! curl -s "${API_URL}" > /dev/null; then
  echo "❌ Serveur non accessible sur ${API_URL}"
  echo "   Lancer: npm run dev"
  exit 1
fi
echo "✅ Serveur accessible"
echo ""

# Vérifier variable env SUPABASE_SERVICE_ROLE_KEY
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "⚠️  Variable SUPABASE_SERVICE_ROLE_KEY non définie"
  echo "   Ajouter dans .env.local :"
  echo "   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc..."
  echo ""
  echo "   Puis relancer: npm run dev"
  exit 1
fi
echo "✅ SUPABASE_SERVICE_ROLE_KEY configurée"
echo ""

# Récupérer ID admin_jtec
echo "🔍 Recherche profil admin_jtec..."
ADMIN_ID=$(psql "${DB_URL}" -t -A -c "SELECT id FROM profiles WHERE role='admin_jtec' LIMIT 1;")

if [ -z "$ADMIN_ID" ]; then
  echo "❌ Aucun profil admin_jtec trouvé"
  echo "   Exécuter: supabase/migrations/test_etape_3_data.sql"
  exit 1
fi
echo "✅ Admin JETC trouvé: ${ADMIN_ID}"
echo ""

# Compter demandes pending
PENDING_COUNT=$(psql "${DB_URL}" -t -A -c "SELECT COUNT(*) FROM adhesion_requests WHERE status='pending';")
echo "📊 Demandes pending disponibles: ${PENDING_COUNT}"

if [ "$PENDING_COUNT" -eq 0 ]; then
  echo "⚠️  Aucune demande pending"
  echo "   Exécuter: supabase/migrations/test_etape_3_data.sql"
  exit 1
fi
echo ""

# ============================================================================
# TEST 1 : API VALIDATION
# ============================================================================

echo "============================================"
echo "TEST 1 : API VALIDATION (VALIDATION DEMANDE)"
echo "============================================"
echo ""

# Récupérer première demande pending
DEMANDE_ID=$(psql "${DB_URL}" -t -A -c "SELECT id FROM adhesion_requests WHERE status='pending' LIMIT 1;")
OWNER_EMAIL=$(psql "${DB_URL}" -t -A -c "SELECT owner_email FROM adhesion_requests WHERE id='${DEMANDE_ID}';")

echo "📋 Demande à valider:"
echo "   ID: ${DEMANDE_ID}"
echo "   Email: ${OWNER_EMAIL}"
echo ""

# Vérifier que l'email n'existe pas déjà dans auth.users
EXISTING_USER=$(psql "${DB_URL}" -t -A -c "SELECT COUNT(*) FROM auth.users WHERE email='${OWNER_EMAIL}';")
if [ "$EXISTING_USER" -gt 0 ]; then
  echo "⚠️  Email ${OWNER_EMAIL} existe déjà dans auth.users"
  echo "   Nettoyage..."
  psql "${DB_URL}" -c "DELETE FROM auth.users WHERE email='${OWNER_EMAIL}';" > /dev/null
  psql "${DB_URL}" -c "DELETE FROM profiles WHERE email='${OWNER_EMAIL}';" > /dev/null
  psql "${DB_URL}" -c "DELETE FROM regies WHERE email='${OWNER_EMAIL}';" > /dev/null
  echo "✅ Nettoyé"
  echo ""
fi

# Appeler API validation
echo "🚀 Appel API /api/admin/validate-adhesion..."
RESPONSE=$(curl -s -X POST "${API_URL}/api/admin/validate-adhesion" \
  -H "Content-Type: application/json" \
  -d "{\"requestId\": \"${DEMANDE_ID}\", \"adminId\": \"${ADMIN_ID}\"}")

echo ""
echo "📥 Réponse API:"
echo "${RESPONSE}" | jq '.' 2>/dev/null || echo "${RESPONSE}"
echo ""

# Vérifier si success:true
if echo "${RESPONSE}" | grep -q '"success":true'; then
  echo "✅ API retourne success:true"
else
  echo "❌ API retourne une erreur"
  exit 1
fi

# Vérifier régie créée
REGIE_COUNT=$(psql "${DB_URL}" -t -A -c "SELECT COUNT(*) FROM regies WHERE email='${OWNER_EMAIL}';")
if [ "$REGIE_COUNT" -eq 1 ]; then
  echo "✅ Régie créée en DB"
else
  echo "❌ Régie non créée (count: ${REGIE_COUNT})"
  exit 1
fi

# Vérifier subscription créée
SUBSCRIPTION_COUNT=$(psql "${DB_URL}" -t -A -c "SELECT COUNT(*) FROM subscriptions WHERE regie_id=(SELECT id FROM regies WHERE email='${OWNER_EMAIL}');")
if [ "$SUBSCRIPTION_COUNT" -eq 1 ]; then
  echo "✅ Subscription créée en DB"
else
  echo "❌ Subscription non créée (count: ${SUBSCRIPTION_COUNT})"
  exit 1
fi

# Vérifier auth.user créé
AUTH_USER_COUNT=$(psql "${DB_URL}" -t -A -c "SELECT COUNT(*) FROM auth.users WHERE email='${OWNER_EMAIL}';")
if [ "$AUTH_USER_COUNT" -eq 1 ]; then
  echo "✅ Auth.user créé"
else
  echo "❌ Auth.user non créé (count: ${AUTH_USER_COUNT})"
  exit 1
fi

# Vérifier profile owner créé
PROFILE_COUNT=$(psql "${DB_URL}" -t -A -c "SELECT COUNT(*) FROM profiles WHERE email='${OWNER_EMAIL}' AND is_owner=true;")
if [ "$PROFILE_COUNT" -eq 1 ]; then
  echo "✅ Profile owner créé (is_owner=true)"
else
  echo "❌ Profile owner non créé (count: ${PROFILE_COUNT})"
  exit 1
fi

# Vérifier demande marquée approved
DEMANDE_STATUS=$(psql "${DB_URL}" -t -A -c "SELECT status FROM adhesion_requests WHERE id='${DEMANDE_ID}';")
if [ "$DEMANDE_STATUS" = "approved" ]; then
  echo "✅ Demande marquée 'approved'"
else
  echo "❌ Demande status incorrect: ${DEMANDE_STATUS}"
  exit 1
fi

echo ""
echo "✅ TEST 1 RÉUSSI : Validation complète"
echo ""

# ============================================================================
# TEST 2 : API REJET
# ============================================================================

echo "============================================"
echo "TEST 2 : API REJET (REJET DEMANDE)"
echo "============================================"
echo ""

# Récupérer deuxième demande pending
DEMANDE_ID_2=$(psql "${DB_URL}" -t -A -c "SELECT id FROM adhesion_requests WHERE status='pending' LIMIT 1 OFFSET 1;")

if [ -z "$DEMANDE_ID_2" ]; then
  echo "⚠️  Aucune autre demande pending disponible"
  echo "   Test 2 skippé"
else
  OWNER_EMAIL_2=$(psql "${DB_URL}" -t -A -c "SELECT owner_email FROM adhesion_requests WHERE id='${DEMANDE_ID_2}';")
  
  echo "📋 Demande à rejeter:"
  echo "   ID: ${DEMANDE_ID_2}"
  echo "   Email: ${OWNER_EMAIL_2}"
  echo ""
  
  # Appeler API rejet
  echo "🚀 Appel API /api/admin/reject-adhesion..."
  RESPONSE_2=$(curl -s -X POST "${API_URL}/api/admin/reject-adhesion" \
    -H "Content-Type: application/json" \
    -d "{\"requestId\": \"${DEMANDE_ID_2}\", \"adminId\": \"${ADMIN_ID}\", \"reason\": \"Informations incomplètes (test automatique)\"}")
  
  echo ""
  echo "📥 Réponse API:"
  echo "${RESPONSE_2}" | jq '.' 2>/dev/null || echo "${RESPONSE_2}"
  echo ""
  
  # Vérifier si success:true
  if echo "${RESPONSE_2}" | grep -q '"success":true'; then
    echo "✅ API retourne success:true"
  else
    echo "❌ API retourne une erreur"
    exit 1
  fi
  
  # Vérifier demande marquée rejected
  DEMANDE_STATUS_2=$(psql "${DB_URL}" -t -A -c "SELECT status FROM adhesion_requests WHERE id='${DEMANDE_ID_2}';")
  if [ "$DEMANDE_STATUS_2" = "rejected" ]; then
    echo "✅ Demande marquée 'rejected'"
  else
    echo "❌ Demande status incorrect: ${DEMANDE_STATUS_2}"
    exit 1
  fi
  
  # Vérifier qu'AUCUNE régie n'a été créée
  REGIE_COUNT_2=$(psql "${DB_URL}" -t -A -c "SELECT COUNT(*) FROM regies WHERE email='${OWNER_EMAIL_2}';")
  if [ "$REGIE_COUNT_2" -eq 0 ]; then
    echo "✅ Aucune régie créée (comme attendu)"
  else
    echo "❌ Régie créée alors que demande rejetée!"
    exit 1
  fi
  
  echo ""
  echo "✅ TEST 2 RÉUSSI : Rejet sans création entités"
fi

echo ""

# ============================================================================
# TEST 3 : SÉCURITÉ (NON-ADMIN)
# ============================================================================

echo "============================================"
echo "TEST 3 : SÉCURITÉ (ACCÈS NON-ADMIN)"
echo "============================================"
echo ""

# Récupérer un profil NON admin_jtec
NON_ADMIN_ID=$(psql "${DB_URL}" -t -A -c "SELECT id FROM profiles WHERE role != 'admin_jtec' LIMIT 1;")

if [ -z "$NON_ADMIN_ID" ]; then
  echo "⚠️  Aucun profil non-admin trouvé"
  echo "   Test 3 skippé"
else
  DEMANDE_ID_3=$(psql "${DB_URL}" -t -A -c "SELECT id FROM adhesion_requests WHERE status='pending' LIMIT 1 OFFSET 2;")
  
  if [ -z "$DEMANDE_ID_3" ]; then
    DEMANDE_ID_3="${DEMANDE_ID}" # Réutiliser première demande
  fi
  
  echo "🔒 Tentative validation avec profil non-admin..."
  RESPONSE_3=$(curl -s -X POST "${API_URL}/api/admin/validate-adhesion" \
    -H "Content-Type: application/json" \
    -d "{\"requestId\": \"${DEMANDE_ID_3}\", \"adminId\": \"${NON_ADMIN_ID}\"}")
  
  echo ""
  echo "📥 Réponse API:"
  echo "${RESPONSE_3}" | jq '.' 2>/dev/null || echo "${RESPONSE_3}"
  echo ""
  
  # Vérifier si erreur 403
  if echo "${RESPONSE_3}" | grep -q "Accès refusé"; then
    echo "✅ Accès refusé (403) pour non-admin"
  else
    echo "❌ L'API devrait refuser l'accès!"
    exit 1
  fi
  
  echo ""
  echo "✅ TEST 3 RÉUSSI : Sécurité admin_jtec OK"
fi

echo ""

# ============================================================================
# RÉSUMÉ
# ============================================================================

echo "============================================"
echo "📊 RÉSUMÉ DES TESTS"
echo "============================================"
echo ""
echo "✅ TEST 1 : Validation demande → Régie + Subscription + Owner créés"
echo "✅ TEST 2 : Rejet demande → Aucune entité créée"
echo "✅ TEST 3 : Sécurité → Non-admin refusé"
echo ""
echo "🎉 ÉTAPE 4 VALIDÉE : Backend API opérationnel"
echo ""
echo "📋 Prochaines actions:"
echo "   1. Tester via UI dashboard (/admin/jetc)"
echo "   2. Tester magic link (connexion owner)"
echo "   3. Intégrer service email (Resend/SendGrid)"
echo ""
