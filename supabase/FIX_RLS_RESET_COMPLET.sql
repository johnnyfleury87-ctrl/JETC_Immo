-- ============================================================================
-- RESET COMPLET RLS : Supprimer TOUTES les policies récursives
-- ============================================================================
-- Date : 15 décembre 2025
-- Problème : Récursion infinie détectée (ERROR: 42P17)
-- Solution : Désactiver RLS, tout supprimer, recréer proprement
-- ============================================================================

-- ⚠️ IMPORTANT : Ce script doit être exécuté en tant qu'admin Supabase
-- Il va DÉSACTIVER temporairement RLS pour pouvoir supprimer les policies

-- ============================================================================
-- ÉTAPE 1 : DÉSACTIVER RLS (pour permettre le nettoyage)
-- ============================================================================

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ÉTAPE 2 : SUPPRIMER TOUTES LES POLICIES EXISTANTES
-- ============================================================================

-- Supprimer les policies SELECT
DROP POLICY IF EXISTS "users_view_own_profile" ON profiles;
DROP POLICY IF EXISTS "admin_jtec_view_all_profiles" ON profiles;
DROP POLICY IF EXISTS "admin_jtec_select_all" ON profiles;
DROP POLICY IF EXISTS "regie_view_own_members" ON profiles;
DROP POLICY IF EXISTS "entreprise_view_own_technicians" ON profiles;

-- Supprimer les policies INSERT
DROP POLICY IF EXISTS "users_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "admin_jtec_insert_profiles" ON profiles;

-- Supprimer les policies UPDATE
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "admin_jtec_update_profiles" ON profiles;

-- Supprimer les policies DELETE
DROP POLICY IF EXISTS "admin_jtec_delete_profiles" ON profiles;

-- Vérifier qu'il ne reste aucune policy
SELECT 
  policyname,
  cmd,
  LEFT(qual::text, 80) as using_clause
FROM pg_policies 
WHERE tablename = 'profiles';

-- ✅ Résultat attendu : 0 ligne (toutes supprimées)

-- ============================================================================
-- ÉTAPE 3 : RÉACTIVER RLS
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ÉTAPE 4 : CRÉER UNE POLICY MINIMALE (SANS SOUS-SELECT)
-- ============================================================================

-- Policy #1 : Un utilisateur peut lire son propre profil
-- ✅ SIMPLE : id = auth.uid() (pas de sous-SELECT)
CREATE POLICY "users_view_own_profile"
ON profiles FOR SELECT
USING (id = auth.uid());

-- Policy #2 : Un utilisateur peut créer son propre profil
CREATE POLICY "users_insert_own_profile"
ON profiles FOR INSERT
WITH CHECK (id = auth.uid());

-- Policy #3 : Un utilisateur peut mettre à jour son propre profil
CREATE POLICY "users_update_own_profile"
ON profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ============================================================================
-- ÉTAPE 5 : VÉRIFIER QUE ÇA FONCTIONNE
-- ============================================================================

-- Test 1 : Vérifier que les policies sont créées
SELECT 
  policyname,
  cmd as "Command",
  LEFT(qual::text, 100) as "USING condition",
  permissive as "Permissive"
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ✅ Attendu : 3 policies (users_view_own_profile, users_insert_own_profile, users_update_own_profile)

-- Test 2 : Tester la lecture du profil
SELECT id, email, role
FROM profiles
WHERE id = auth.uid();

-- ✅ Attendu : 1 ligne avec vos données

-- ============================================================================
-- ÉTAPE 6 (OPTIONNEL) : AJOUTER LES POLICIES ADMIN
-- ============================================================================

-- ⚠️ NE PAS UTILISER DE SOUS-SELECT SUR profiles
-- ❌ MAUVAIS : EXISTS (SELECT 1 FROM profiles WHERE ...)
-- ✅ BON : (auth.jwt() ->> 'role')::text = 'admin_jtec'

-- Vérifier d'abord si le role est dans le JWT
SELECT 
  (auth.jwt() ->> 'role')::text as "Role dans JWT",
  (auth.jwt() ->> 'email')::text as "Email",
  auth.uid() as "User ID";

-- Si le role est NULL dans le JWT, exécuter le trigger de sync :
-- (Voir section ÉTAPE 7 ci-dessous)

-- Si le role est présent, créer la policy admin :
CREATE POLICY "admin_jtec_select_all"
ON profiles FOR SELECT
USING (
  (auth.jwt() ->> 'role')::text = 'admin_jtec'
);

-- Policy admin INSERT
CREATE POLICY "admin_jtec_insert_profiles"
ON profiles FOR INSERT
WITH CHECK (
  (auth.jwt() ->> 'role')::text = 'admin_jtec'
);

-- Policy admin UPDATE
CREATE POLICY "admin_jtec_update_profiles"
ON profiles FOR UPDATE
USING (
  (auth.jwt() ->> 'role')::text = 'admin_jtec'
);

-- Policy admin DELETE
CREATE POLICY "admin_jtec_delete_profiles"
ON profiles FOR DELETE
USING (
  (auth.jwt() ->> 'role')::text = 'admin_jtec'
);

-- ============================================================================
-- ÉTAPE 7 : SYNCHRONISER LE ROLE DANS LE JWT
-- ============================================================================

-- Créer le trigger pour mettre le role dans raw_app_meta_data
CREATE OR REPLACE FUNCTION public.sync_role_to_jwt()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le JWT claim avec le role
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Appliquer le trigger
DROP TRIGGER IF EXISTS sync_role_to_jwt_trigger ON profiles;
CREATE TRIGGER sync_role_to_jwt_trigger
  AFTER INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_role_to_jwt();

-- Synchroniser tous les profils existants
UPDATE auth.users u
SET raw_app_meta_data = 
  COALESCE(u.raw_app_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', p.role)
FROM profiles p
WHERE u.id = p.id
  AND p.role IS NOT NULL;

-- Vérifier que le role est maintenant dans le JWT
SELECT 
  id,
  email,
  raw_app_meta_data->>'role' as "Role dans JWT"
FROM auth.users
WHERE id = auth.uid();

-- ============================================================================
-- TEST FINAL
-- ============================================================================

-- Test 1 : Lecture son propre profil
SELECT id, email, role FROM profiles WHERE id = auth.uid();
-- ✅ Doit retourner 1 ligne

-- Test 2 : Vérifier qu'il n'y a plus de récursion
EXPLAIN (VERBOSE, COSTS OFF)
SELECT id, email, role FROM profiles WHERE id = auth.uid();
-- ✅ Ne doit PAS contenir de sous-SELECT sur profiles

-- Test 3 : Lister toutes les policies (doit être propre)
SELECT 
  policyname,
  cmd,
  LEFT(qual::text, 150) as using_condition
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
-- ✅ Policies simples, sans sous-SELECT sur profiles

-- ============================================================================
-- NOTES IMPORTANTES
-- ============================================================================

-- ✅ Cette configuration est MINIMALE et SÛRE
-- ✅ Pas de récursion possible (pas de sous-SELECT sur profiles)
-- ✅ Admin utilise auth.jwt() pour vérifier le role
-- ✅ Le trigger sync_role_to_jwt maintient le role à jour dans le JWT

-- ⚠️ LIMITATION : Si vous changez le role d'un user, il doit se RECONNECTER
--    pour obtenir le nouveau JWT avec le nouveau role

-- 💡 ALTERNATIVE : Si vous ne voulez pas utiliser JWT, gérez les permissions
--    admin CÔTÉ APPLICATION (pas dans RLS), et gardez uniquement
--    "users_view_own_profile" comme policy

-- ============================================================================
-- SI ÇA NE FONCTIONNE TOUJOURS PAS
-- ============================================================================

-- Vérifier les grants :
SELECT grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
  AND table_name = 'profiles';

-- Si 'authenticated' n'a pas SELECT, ajouter :
GRANT SELECT ON profiles TO authenticated;
GRANT INSERT ON profiles TO authenticated;
GRANT UPDATE ON profiles TO authenticated;
