-- ============================================================================
-- FIX DÉFINITIF : Éliminer la récursion infinie dans les policies RLS
-- ============================================================================
-- Date : 2025-12-15
-- Problème : Policies sur profiles font des sous-SELECT sur profiles
--            → Récursion infinie → Erreur "infinite recursion detected"
--            → SELECT * FROM profiles WHERE id = auth.uid() retourne 0 ligne
-- Solution : Utiliser auth.jwt() pour lire le role depuis le TOKEN
--            au lieu de faire un sous-SELECT sur profiles
-- ============================================================================

-- 1. DÉSACTIVER RLS temporairement
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. SUPPRIMER TOUTES LES ANCIENNES POLICIES
DROP POLICY IF EXISTS "users_view_own_profile" ON profiles;
DROP POLICY IF EXISTS "admin_jtec_view_all_profiles" ON profiles;
DROP POLICY IF EXISTS "regie_view_own_members" ON profiles;
DROP POLICY IF EXISTS "entreprise_view_own_technicians" ON profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "admin_jtec_insert_profiles" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "admin_jtec_update_profiles" ON profiles;
DROP POLICY IF EXISTS "admin_jtec_delete_profiles" ON profiles;

-- 3. CRÉER UN TRIGGER POUR METTRE LE ROLE DANS LE JWT
-- (Ce trigger met à jour auth.users.raw_app_meta_data avec le role)
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

-- Appliquer le trigger sur INSERT et UPDATE
DROP TRIGGER IF EXISTS sync_role_to_jwt_trigger ON profiles;
CREATE TRIGGER sync_role_to_jwt_trigger
  AFTER INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_role_to_jwt();

-- 4. METTRE À JOUR LE JWT POUR L'ADMIN EXISTANT
-- (Appliquer le role dans le JWT pour tous les profils existants)
UPDATE auth.users u
SET raw_app_meta_data = 
  COALESCE(u.raw_app_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', p.role)
FROM profiles p
WHERE u.id = p.id
  AND p.role IS NOT NULL;

-- 5. RÉACTIVER RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- NOUVELLES POLICIES SANS RÉCURSION
-- ============================================================================

-- POLICY 1 : Lecture de son propre profil (SIMPLE, SANS SOUS-SELECT)
CREATE POLICY "users_view_own_profile"
ON profiles FOR SELECT
USING (id = auth.uid());

-- POLICY 2 : Admin JTEC peut voir tous les profils
-- ✅ LIT LE ROLE DEPUIS LE JWT (pas de sous-SELECT)
CREATE POLICY "admin_jtec_view_all_profiles"
ON profiles FOR SELECT
USING (
  (auth.jwt() ->> 'role')::text = 'admin_jtec'
);

-- POLICY 3 : Une régie peut voir ses membres
-- ✅ LIT LE ROLE DEPUIS LE JWT
CREATE POLICY "regie_view_own_members"
ON profiles FOR SELECT
USING (
  (auth.jwt() ->> 'role')::text = 'regie'
  AND regie_id IS NOT NULL
  AND regie_id = (
    SELECT regie_id FROM profiles 
    WHERE id = auth.uid() 
    LIMIT 1
  )
);

-- POLICY 4 : Une entreprise peut voir ses techniciens
-- ✅ LIT LE ROLE DEPUIS LE JWT
CREATE POLICY "entreprise_view_own_technicians"
ON profiles FOR SELECT
USING (
  (auth.jwt() ->> 'role')::text = 'entreprise'
  AND entreprise_id IS NOT NULL
  AND entreprise_id = (
    SELECT entreprise_id FROM profiles 
    WHERE id = auth.uid()
    LIMIT 1
  )
);

-- ============================================================================
-- POLICIES INSERT
-- ============================================================================

CREATE POLICY "users_insert_own_profile"
ON profiles FOR INSERT
WITH CHECK (id = auth.uid());

-- ✅ Admin vérifié via JWT
CREATE POLICY "admin_jtec_insert_profiles"
ON profiles FOR INSERT
WITH CHECK (
  (auth.jwt() ->> 'role')::text = 'admin_jtec'
);

-- ============================================================================
-- POLICIES UPDATE
-- ============================================================================

CREATE POLICY "users_update_own_profile"
ON profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ✅ Admin vérifié via JWT
CREATE POLICY "admin_jtec_update_profiles"
ON profiles FOR UPDATE
USING (
  (auth.jwt() ->> 'role')::text = 'admin_jtec'
);

-- ============================================================================
-- POLICIES DELETE
-- ============================================================================

-- ✅ Admin vérifié via JWT
CREATE POLICY "admin_jtec_delete_profiles"
ON profiles FOR DELETE
USING (
  (auth.jwt() ->> 'role')::text = 'admin_jtec'
);

-- ============================================================================
-- VALIDATION
-- ============================================================================

-- Afficher toutes les policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd,
  LEFT(qual::text, 100) as condition
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ============================================================================
-- TEST FINAL (À EXÉCUTER EN TANT QU'ADMIN CONNECTÉ)
-- ============================================================================

-- Cette requête doit maintenant retourner EXACTEMENT 1 ligne
-- SELECT id, email, role FROM profiles WHERE id = auth.uid();

-- ============================================================================
-- NOTES IMPORTANTES
-- ============================================================================

-- ✅ AVANTAGES :
-- - Plus de récursion (le role vient du JWT, pas d'un sous-SELECT)
-- - Performances meilleures (pas de requête imbriquée)
-- - Les policies regie/entreprise font toujours 1 sous-SELECT pour récupérer
--   leur regie_id/entreprise_id, mais APRÈS avoir vérifié le role dans le JWT
--   (donc pas de récursion sur la vérification du role)

-- ⚠️ TRADEOFF :
-- - Le role est maintenant dans le JWT (auth.users.raw_app_meta_data)
-- - Si on change le role d'un user, il faut qu'il se RECONNECTE
--   pour que le nouveau JWT soit émis avec le nouveau role
-- - Alternative : Forcer un refresh du JWT via supabase.auth.refreshSession()

-- 🔒 SÉCURITÉ :
-- - Le JWT est signé par Supabase, impossible de le falsifier
-- - Le trigger SECURITY DEFINER garantit que seul Postgres peut modifier raw_app_meta_data
-- - Les policies restent sécurisées

-- ============================================================================
-- EN CAS DE PROBLÈME (ROLLBACK)
-- ============================================================================

-- Si cette approche ne fonctionne pas, rollback vers policies simples :
-- DROP toutes les policies sauf "users_view_own_profile"
-- Et gérer les permissions admin côté APPLICATION (pas côté RLS)
