-- ============================================================================
-- SCRIPT DE VÉRIFICATION : Admin JETC
-- Description : Vérifier que l'admin JETC est correctement configuré
-- ============================================================================

-- ============================================================================
-- VÉRIFICATION 1 : Profile admin_jtec existe
-- ============================================================================

SELECT 
  '1. PROFILE ADMIN' AS verification,
  CASE 
    WHEN COUNT(*) = 1 THEN '✓ Profile admin_jtec existe'
    WHEN COUNT(*) = 0 THEN '✗ ERREUR : Profile admin_jtec introuvable'
    ELSE '⚠️  ATTENTION : Plusieurs profiles admin_jtec trouvés'
  END AS resultat,
  COUNT(*) AS nombre
FROM profiles
WHERE email = 'johnny.fleury87@gmail.com';

-- Détails du profile
SELECT 
  id,
  email,
  prenom,
  nom,
  role,
  regie_id,
  entreprise_id,
  is_demo,
  created_at
FROM profiles
WHERE email = 'johnny.fleury87@gmail.com';

-- ============================================================================
-- VÉRIFICATION 2 : Contrainte check_role_consistency respectée
-- ============================================================================

SELECT 
  '2. CONTRAINTE CHECK' AS verification,
  CASE 
    WHEN role = 'admin_jtec' AND regie_id IS NULL AND entreprise_id IS NULL 
      THEN '✓ Contrainte check_role_consistency respectée'
    ELSE '✗ ERREUR : Contrainte non respectée'
  END AS resultat
FROM profiles
WHERE email = 'johnny.fleury87@gmail.com';

-- ============================================================================
-- VÉRIFICATION 3 : Utilisateur existe dans auth.users
-- ============================================================================

SELECT 
  '3. AUTH.USERS' AS verification,
  CASE 
    WHEN COUNT(*) = 1 THEN '✓ Utilisateur existe dans auth.users'
    WHEN COUNT(*) = 0 THEN '✗ ERREUR : Utilisateur absent de auth.users'
    ELSE '⚠️  ATTENTION : Plusieurs utilisateurs avec cet email'
  END AS resultat,
  COUNT(*) AS nombre
FROM auth.users
WHERE email = 'johnny.fleury87@gmail.com';

-- Détails auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  last_sign_in_at,
  created_at
FROM auth.users
WHERE email = 'johnny.fleury87@gmail.com';

-- ============================================================================
-- VÉRIFICATION 4 : Cohérence entre auth.users et profiles
-- ============================================================================

SELECT 
  '4. COHÉRENCE ID' AS verification,
  CASE 
    WHEN au.id = p.id THEN '✓ UUID cohérent entre auth.users et profiles'
    ELSE '✗ ERREUR : Incohérence des UUID'
  END AS resultat,
  au.id AS auth_users_id,
  p.id AS profiles_id
FROM auth.users au
FULL OUTER JOIN profiles p ON p.email = au.email
WHERE au.email = 'johnny.fleury87@gmail.com' 
   OR p.email = 'johnny.fleury87@gmail.com';

-- ============================================================================
-- VÉRIFICATION 5 : Pas de régie ni entreprise créées
-- ============================================================================

SELECT 
  '5. ISOLATION ADMIN' AS verification,
  CASE 
    WHEN regie_id IS NULL AND entreprise_id IS NULL 
      THEN '✓ Admin isolé (aucune régie/entreprise liée)'
    ELSE '⚠️  ATTENTION : Admin lié à une entité'
  END AS resultat,
  regie_id,
  entreprise_id
FROM profiles
WHERE email = 'johnny.fleury87@gmail.com';

-- ============================================================================
-- VÉRIFICATION 6 : Pas de subscription créée
-- ============================================================================

SELECT 
  '6. AUCUNE SUBSCRIPTION' AS verification,
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ Aucune subscription (admin n''a pas besoin d''abonnement)'
    ELSE '⚠️  ATTENTION : Subscription trouvée pour cet admin'
  END AS resultat,
  COUNT(*) AS subscriptions_trouvees
FROM subscriptions s
WHERE s.regie_id IN (
  SELECT regie_id FROM profiles WHERE email = 'johnny.fleury87@gmail.com'
)
OR s.entreprise_id IN (
  SELECT entreprise_id FROM profiles WHERE email = 'johnny.fleury87@gmail.com'
);

-- ============================================================================
-- VÉRIFICATION 7 : Triggers actifs
-- ============================================================================

SELECT 
  '7. TRIGGERS' AS verification,
  CASE 
    WHEN tgenabled = 'O' THEN '✓ Trigger on_auth_user_created actif'
    WHEN tgenabled = 'D' THEN '⚠️  Trigger désactivé'
    ELSE '✗ État du trigger inconnu'
  END AS resultat,
  tgname AS trigger_name,
  tgenabled AS status
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE c.relname = 'users'
  AND t.tgname = 'on_auth_user_created';

-- ============================================================================
-- RÉSUMÉ FINAL
-- ============================================================================

DO $$
DECLARE
  profile_count INTEGER;
  auth_user_count INTEGER;
  role_value TEXT;
  is_demo_value BOOLEAN;
BEGIN
  -- Compter les profiles
  SELECT COUNT(*) INTO profile_count
  FROM profiles
  WHERE email = 'johnny.fleury87@gmail.com';
  
  -- Compter les users auth
  SELECT COUNT(*) INTO auth_user_count
  FROM auth.users
  WHERE email = 'johnny.fleury87@gmail.com';
  
  -- Récupérer rôle et demo
  SELECT role, is_demo INTO role_value, is_demo_value
  FROM profiles
  WHERE email = 'johnny.fleury87@gmail.com'
  LIMIT 1;
  
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '📊 RÉSUMÉ DE LA VÉRIFICATION';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  
  IF profile_count = 1 AND auth_user_count = 1 AND role_value = 'admin_jtec' AND NOT is_demo_value THEN
    RAISE NOTICE '✅ CONFIGURATION CORRECTE';
    RAISE NOTICE '';
    RAISE NOTICE 'Email         : johnny.fleury87@gmail.com';
    RAISE NOTICE 'Rôle          : %', role_value;
    RAISE NOTICE 'Is Demo       : %', is_demo_value;
    RAISE NOTICE 'Auth Users    : OK (% entrée)', auth_user_count;
    RAISE NOTICE 'Profiles      : OK (% entrée)', profile_count;
    RAISE NOTICE '';
    RAISE NOTICE '🎯 PROCHAINES ÉTAPES :';
    RAISE NOTICE '   1. Cliquez sur le magic link reçu par email';
    RAISE NOTICE '   2. Vous serez redirigé vers /admin/jetc';
    RAISE NOTICE '   3. Vous aurez accès à la gestion des demandes d''adhésion';
    RAISE NOTICE '';
    
  ELSIF profile_count = 0 THEN
    RAISE NOTICE '❌ ERREUR : Profile introuvable';
    RAISE NOTICE '';
    RAISE NOTICE '➡️  Exécutez le script create_admin_jetc.sql';
    RAISE NOTICE '';
    
  ELSIF auth_user_count = 0 THEN
    RAISE NOTICE '❌ ERREUR : Utilisateur auth.users introuvable';
    RAISE NOTICE '';
    RAISE NOTICE '➡️  ACTION REQUISE :';
    RAISE NOTICE '   1. Supabase Dashboard → Authentication → Users';
    RAISE NOTICE '   2. Invite User → johnny.fleury87@gmail.com';
    RAISE NOTICE '   3. Relancez create_admin_jetc.sql';
    RAISE NOTICE '';
    
  ELSIF role_value != 'admin_jtec' THEN
    RAISE NOTICE '⚠️  ATTENTION : Rôle incorrect';
    RAISE NOTICE '';
    RAISE NOTICE 'Rôle actuel : %', role_value;
    RAISE NOTICE 'Rôle attendu : admin_jtec';
    RAISE NOTICE '';
    RAISE NOTICE '➡️  Relancez create_admin_jetc.sql pour corriger';
    RAISE NOTICE '';
    
  ELSE
    RAISE NOTICE '⚠️  CONFIGURATION PARTIELLE';
    RAISE NOTICE '';
    RAISE NOTICE 'Vérifiez les détails ci-dessus';
    RAISE NOTICE '';
  END IF;
  
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
