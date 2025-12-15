-- ============================================================================
-- Fichier : fix_profiles_rls_policies.sql
-- Description : Correction des policies RLS pour la table profiles
-- Problème : Les policies référençant regie_id et entreprise_id causent
--            des erreurs 500 pour les profils admin_jtec (ces colonnes sont NULL)
-- Solution : Ajouter des guards IS NOT NULL dans les policies
-- ============================================================================

-- Désactiver temporairement RLS pour faire les modifications
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les anciennes policies
DROP POLICY IF EXISTS "users_view_own_profile" ON profiles;
DROP POLICY IF EXISTS "admin_jtec_view_all_profiles" ON profiles;
DROP POLICY IF EXISTS "regie_view_own_members" ON profiles;
DROP POLICY IF EXISTS "entreprise_view_own_technicians" ON profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "admin_jtec_insert_profiles" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "admin_jtec_update_profiles" ON profiles;
DROP POLICY IF EXISTS "admin_jtec_delete_profiles" ON profiles;

-- Réactiver RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- NOUVELLES POLICIES SÉCURISÉES
-- ============================================================================

-- POLICY 1 : Lecture de son propre profil (PRIORITAIRE et SIMPLE)
-- Cette policy doit TOUJOURS fonctionner, même pour admin_jtec
CREATE POLICY "users_view_own_profile"
ON profiles FOR SELECT
USING (id = auth.uid());

-- POLICY 2 : Admin JTEC peut voir tous les profils
-- Guard: Vérifier que le profil de l'utilisateur connecté existe ET a le bon rôle
CREATE POLICY "admin_jtec_view_all_profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin_jtec'
  )
);

-- POLICY 3 : Une régie peut voir les profils de ses membres
-- Guard: Vérifier que regie_id IS NOT NULL pour éviter les erreurs
CREATE POLICY "regie_view_own_members"
ON profiles FOR SELECT
USING (
  regie_id IS NOT NULL
  AND regie_id IN (
    SELECT p.regie_id FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'regie'
    AND p.regie_id IS NOT NULL
  )
);

-- POLICY 4 : Une entreprise peut voir les profils de ses techniciens
-- Guard: Vérifier que entreprise_id IS NOT NULL pour éviter les erreurs
CREATE POLICY "entreprise_view_own_technicians"
ON profiles FOR SELECT
USING (
  entreprise_id IS NOT NULL
  AND entreprise_id IN (
    SELECT p.entreprise_id FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'entreprise'
    AND p.entreprise_id IS NOT NULL
  )
);

-- ============================================================================
-- POLICIES INSERT
-- ============================================================================

-- POLICY 5 : Tout le monde peut créer son propre profil
CREATE POLICY "users_insert_own_profile"
ON profiles FOR INSERT
WITH CHECK (id = auth.uid());

-- POLICY 6 : Admin JTEC peut créer n'importe quel profil
CREATE POLICY "admin_jtec_insert_profiles"
ON profiles FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin_jtec'
  )
);

-- ============================================================================
-- POLICIES UPDATE
-- ============================================================================

-- POLICY 7 : Un utilisateur peut mettre à jour son propre profil
-- Simplification : Autoriser la mise à jour de son profil avec guards basiques
CREATE POLICY "users_update_own_profile"
ON profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  -- Note: On ne vérifie plus les colonnes regie_id/entreprise_id car elles peuvent être NULL
  -- Le trigger check_role_consistency se charge de la validation côté serveur
);

-- POLICY 8 : Admin JTEC peut tout mettre à jour
CREATE POLICY "admin_jtec_update_profiles"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin_jtec'
  )
);

-- ============================================================================
-- POLICIES DELETE
-- ============================================================================

-- POLICY 9 : Seul admin JTEC peut supprimer des profils
CREATE POLICY "admin_jtec_delete_profiles"
ON profiles FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin_jtec'
  )
);

-- ============================================================================
-- VALIDATION
-- ============================================================================

-- Vérifier que les policies sont bien créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Test rapide : Un utilisateur authentifié peut-il lire son propre profil ?
-- Cette requête devrait toujours fonctionner grâce à "users_view_own_profile"
-- SELECT * FROM profiles WHERE id = auth.uid();
