-- ============================================================================
-- TEST RLS : Vérifier pourquoi SELECT profiles WHERE id = auth.uid() retourne 0 ligne
-- ============================================================================
-- Date : 15 décembre 2025
-- Problème : SELECT * FROM profiles WHERE id = auth.uid() retourne 0 ligne
--            alors que l'utilisateur existe dans la table
-- ============================================================================

-- 1. VÉRIFIER QUE L'UTILISATEUR EST CONNECTÉ
SELECT 
  auth.uid() as "User ID connecté",
  auth.role() as "Role PostgreSQL",
  current_user as "Current User";

-- Résultat attendu : auth.uid() doit retourner un UUID (pas NULL)
-- Si NULL → Pas de session active, impossible de tester

-- ============================================================================

-- 2. VÉRIFIER QUE LE PROFILE EXISTE (SANS RLS)
-- Note : Cette requête ignore RLS car exécutée en tant qu'admin
SELECT 
  id,
  email,
  role,
  regie_id,
  entreprise_id,
  created_at
FROM profiles
WHERE id = auth.uid();

-- Résultat attendu : 1 ligne avec les données du profile
-- Si 0 ligne → Le profile n'existe pas dans la table
-- Si 1 ligne → Le profile existe mais RLS le bloque

-- ============================================================================

-- 3. VÉRIFIER RLS SUR LA TABLE PROFILES
SELECT 
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Résultat attendu : rowsecurity = true
-- Si false → RLS désactivé, tous les selects devraient fonctionner

-- ============================================================================

-- 4. LISTER TOUTES LES POLICIES SUR PROFILES
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as "Command",
  LEFT(qual::text, 150) as "USING condition"
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Résultat attendu : Voir toutes les policies
-- Vérifier :
-- - Y a-t-il une policy "users_view_own_profile" avec USING (id = auth.uid()) ?
-- - Y a-t-il des policies avec auth.jwt() ?
-- - Y a-t-il des policies avec des sous-SELECT sur profiles ? (RÉCURSION)

-- ============================================================================

-- 5. TESTER LE CONTENU DU JWT
SELECT 
  auth.jwt() as "JWT complet",
  (auth.jwt() ->> 'role')::text as "Role dans JWT",
  (auth.jwt() ->> 'email')::text as "Email dans JWT",
  (auth.jwt() ->> 'sub')::text as "User ID dans JWT";

-- Résultat attendu :
-- - JWT complet : objet JSON
-- - Role dans JWT : 'admin_jtec' ou autre (si le trigger sync_role_to_jwt fonctionne)
-- - Email : email de l'utilisateur
-- - User ID : doit correspondre à auth.uid()

-- ============================================================================

-- 6. TESTER LA POLICY users_view_own_profile
-- Cette requête simule ce que fait Supabase avec RLS activé
EXPLAIN (VERBOSE, COSTS OFF)
SELECT id, email, role
FROM profiles
WHERE id = auth.uid();

-- Résultat attendu : Voir le plan d'exécution
-- Chercher dans le plan :
-- - Filter: (id = auth.uid())
-- - Pas de sous-SELECT sur profiles (sinon récursion)

-- ============================================================================

-- 7. VÉRIFIER LES GRANTS SUR LA TABLE PROFILES
SELECT 
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY grantee, privilege_type;

-- Résultat attendu :
-- - authenticated : SELECT (minimum)
-- - Si pas de grant SELECT pour 'authenticated' → Pas d'accès possible

-- ============================================================================

-- 8. VÉRIFIER SI LE ROLE EST DANS raw_app_meta_data
SELECT 
  id,
  email,
  raw_app_meta_data,
  raw_app_meta_data->>'role' as "Role extrait"
FROM auth.users
WHERE id = auth.uid();

-- Résultat attendu :
-- - raw_app_meta_data contient {"role": "admin_jtec"}
-- - Si pas de role dans raw_app_meta_data → Le trigger sync_role_to_jwt n'a pas fonctionné

-- ============================================================================

-- 9. TEST FINAL : SELECT AVEC RLS ACTIVÉ
-- Cette requête est celle qui échoue côté application
SET ROLE authenticated;
SELECT id, email, role
FROM profiles
WHERE id = auth.uid();
RESET ROLE;

-- Résultat attendu : 1 ligne
-- Si 0 ligne → RLS bloque l'accès, policy manquante ou récursive

-- ============================================================================
-- DIAGNOSTIC RAPIDE
-- ============================================================================

-- Si SELECT retourne 0 ligne, vérifier dans l'ordre :

-- 1. auth.uid() est-il NULL ?
--    → Oui : Pas de session active
--    → Non : Continuer

-- 2. Le profile existe-t-il dans profiles (query #2) ?
--    → Non : Créer le profile
--    → Oui : Continuer

-- 3. RLS est-il activé (query #3) ?
--    → Non : ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
--    → Oui : Continuer

-- 4. Y a-t-il une policy "users_view_own_profile" (query #4) ?
--    → Non : Créer la policy (voir FIX_RECURSION_RLS_DEFINITIF.sql)
--    → Oui : Continuer

-- 5. La policy contient-elle des sous-SELECT sur profiles ?
--    → Oui : RÉCURSION INFINIE, appliquer FIX_RECURSION_RLS_DEFINITIF.sql
--    → Non : Continuer

-- 6. Le role est-il dans le JWT (query #5) ?
--    → Non : Exécuter le trigger sync_role_to_jwt (voir FIX_RECURSION_RLS_DEFINITIF.sql)
--    → Oui : Continuer

-- 7. Y a-t-il un GRANT SELECT pour 'authenticated' (query #7) ?
--    → Non : GRANT SELECT ON profiles TO authenticated;
--    → Oui : Continuer

-- 8. Le plan d'exécution contient-il une récursion (query #6) ?
--    → Oui : Refaire les policies avec auth.jwt() au lieu de sous-SELECT
--    → Non : Problème inconnu, ouvrir un ticket Supabase

-- ============================================================================
-- SOLUTION SI TOUT ÉCHOUE
-- ============================================================================

-- Si rien ne fonctionne, appliquer la solution minimale :

-- DROP toutes les policies sauf users_view_own_profile
DROP POLICY IF EXISTS "admin_jtec_view_all_profiles" ON profiles;
DROP POLICY IF EXISTS "regie_view_own_members" ON profiles;
DROP POLICY IF EXISTS "entreprise_view_own_technicians" ON profiles;

-- Recréer UNIQUEMENT la policy de base (SANS sous-SELECT)
DROP POLICY IF EXISTS "users_view_own_profile" ON profiles;
CREATE POLICY "users_view_own_profile"
ON profiles FOR SELECT
USING (id = auth.uid());

-- Tester à nouveau
SELECT id, email, role FROM profiles WHERE id = auth.uid();

-- Si ça fonctionne → Le problème était dans les autres policies (récursion)
-- Si ça ne fonctionne toujours pas → Problème de session ou de grants
