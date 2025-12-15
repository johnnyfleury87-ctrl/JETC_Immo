-- ============================================================================
-- FIX DÉFINITIF RLS PROFILES - MINIMAL ET NON RÉCURSIF
-- ============================================================================
-- Date : 15 décembre 2025
-- Objectif : Débloquer l'accès admin avec policies SIMPLES
-- Contrainte : AUCUN sous-SELECT sur profiles (récursion interdite)
-- ============================================================================

-- ÉTAPE 1 : DÉSACTIVER RLS (pour nettoyage)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ÉTAPE 2 : SUPPRIMER TOUTES LES POLICIES EXISTANTES
DROP POLICY IF EXISTS "users_view_own_profile" ON profiles;
DROP POLICY IF EXISTS "admin_jtec_view_all_profiles" ON profiles;
DROP POLICY IF EXISTS "admin_jtec_select_all" ON profiles;
DROP POLICY IF EXISTS "regie_view_own_members" ON profiles;
DROP POLICY IF EXISTS "entreprise_view_own_technicians" ON profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "admin_jtec_insert_profiles" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "admin_jtec_update_profiles" ON profiles;
DROP POLICY IF EXISTS "admin_jtec_delete_profiles" ON profiles;

-- Vérifier que toutes les policies sont supprimées
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'profiles';
  IF policy_count > 0 THEN
    RAISE WARNING 'Il reste % policies sur profiles', policy_count;
  ELSE
    RAISE NOTICE '✅ Toutes les policies supprimées';
  END IF;
END $$;

-- ÉTAPE 3 : RÉACTIVER RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 4 : CRÉER POLICIES MINIMALES (SANS RÉCURSION)

-- POLICY 1 (OBLIGATOIRE) : Lecture de son propre profil
-- ✅ SIMPLE : id = auth.uid() (PAS de sous-SELECT)
CREATE POLICY "users_view_own_profile"
ON profiles FOR SELECT
USING (id = auth.uid());

-- POLICY 2 (ADMIN) : Admin peut voir tous les profils
-- ✅ UTILISE JWT : Pas de sous-SELECT sur profiles
-- Note : Requiert que le role soit dans le JWT (voir ÉTAPE 5)
CREATE POLICY "admin_select_all"
ON profiles FOR SELECT
USING (
  (auth.jwt() ->> 'role')::text = 'admin_jtec'
);

-- POLICY 3 : Insertion (pour signup)
CREATE POLICY "users_insert_own_profile"
ON profiles FOR INSERT
WITH CHECK (id = auth.uid());

-- POLICY 4 : Update (pour modification profil)
CREATE POLICY "users_update_own_profile"
ON profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- POLICY 5 : Admin peut tout modifier
CREATE POLICY "admin_update_all"
ON profiles FOR UPDATE
USING (
  (auth.jwt() ->> 'role')::text = 'admin_jtec'
);

-- POLICY 6 : Admin peut supprimer
CREATE POLICY "admin_delete_all"
ON profiles FOR DELETE
USING (
  (auth.jwt() ->> 'role')::text = 'admin_jtec'
);

-- ÉTAPE 5 : SYNCHRONISER LE ROLE DANS LE JWT
-- (Pour que les policies admin fonctionnent)

-- Créer la fonction de synchronisation
CREATE OR REPLACE FUNCTION public.sync_role_to_jwt()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour raw_app_meta_data avec le role
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

-- Synchroniser TOUS les profils existants
UPDATE auth.users u
SET raw_app_meta_data = 
  COALESCE(u.raw_app_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', p.role)
FROM profiles p
WHERE u.id = p.id AND p.role IS NOT NULL;

-- ÉTAPE 6 : VÉRIFICATION

-- Test 1 : Lister les policies (doit être propre)
SELECT 
  policyname,
  cmd,
  LEFT(qual::text, 80) as "USING condition"
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Test 2 : Vérifier que le role est dans le JWT
SELECT 
  id,
  email,
  raw_app_meta_data->>'role' as "Role dans JWT"
FROM auth.users
WHERE email = 'johnny.fleury87@gmail.com';

-- Test 3 : Tester la lecture (en tant qu'utilisateur connecté)
-- SELECT id, email, role FROM profiles WHERE id = auth.uid();
-- Note : Doit retourner 1 ligne après reconnexion

-- ============================================================================
-- NOTES IMPORTANTES
-- ============================================================================

-- ✅ Cette configuration est MINIMALE
-- ✅ Pas de récursion possible (aucun sous-SELECT sur profiles)
-- ✅ Admin vérifié via auth.jwt() (pas de sous-SELECT)
-- ✅ Après exécution de ce script, l'admin doit SE RECONNECTER
--    pour obtenir le nouveau JWT avec le role

-- ⚠️ LIMITATION : Si le role change, l'utilisateur doit se reconnecter

-- 💡 Si auth.jwt() ne fonctionne pas : Supprimer les policies admin
--    et gérer les permissions côté application (Next.js)

-- ============================================================================
-- ROLLBACK SI PROBLÈME
-- ============================================================================

-- Si ce script casse quelque chose, rollback avec :
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- (puis recréer uniquement users_view_own_profile)
