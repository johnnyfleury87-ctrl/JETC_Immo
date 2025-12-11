-- ============================================================================
-- Fichier : 10_policies_profiles.sql
-- Description : Politiques RLS pour la table profiles
-- ============================================================================

-- Activer RLS sur profiles (déjà fait dans 01_tables.sql mais on le rappelle)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLITIQUE 1 : SELECT (Lecture)
-- ============================================================================

-- Policy : Un utilisateur peut lire son propre profil
CREATE POLICY "users_view_own_profile"
ON profiles FOR SELECT
USING (id = auth.uid());

-- Policy : Admin JTEC peut voir tous les profils
CREATE POLICY "admin_jtec_view_all_profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin_jtec'
  )
);

-- Policy : Une régie peut voir les profils de ses membres
CREATE POLICY "regie_view_own_members"
ON profiles FOR SELECT
USING (
  regie_id IN (
    SELECT regie_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'regie'
  )
);

-- Policy : Une entreprise peut voir les profils de ses techniciens
CREATE POLICY "entreprise_view_own_technicians"
ON profiles FOR SELECT
USING (
  entreprise_id IN (
    SELECT entreprise_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'entreprise'
  )
);

-- ============================================================================
-- POLITIQUE 2 : INSERT (Création)
-- ============================================================================

-- Policy : Tout le monde peut créer son propre profil (via trigger après signup)
CREATE POLICY "users_insert_own_profile"
ON profiles FOR INSERT
WITH CHECK (id = auth.uid());

-- Policy : Admin JTEC peut créer n'importe quel profil
CREATE POLICY "admin_jtec_insert_profiles"
ON profiles FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin_jtec'
  )
);

-- ============================================================================
-- POLITIQUE 3 : UPDATE (Mise à jour)
-- ============================================================================

-- Policy : Un utilisateur peut mettre à jour son propre profil
-- MAIS ne peut pas changer son rôle ni ses liaisons (regie_id, entreprise_id)
CREATE POLICY "users_update_own_profile"
ON profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND role = (SELECT role FROM profiles WHERE id = auth.uid())
  AND regie_id = (SELECT regie_id FROM profiles WHERE id = auth.uid())
  AND entreprise_id = (SELECT entreprise_id FROM profiles WHERE id = auth.uid())
);

-- Policy : Admin JTEC peut tout mettre à jour
CREATE POLICY "admin_jtec_update_profiles"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin_jtec'
  )
);

-- ============================================================================
-- POLITIQUE 4 : DELETE (Suppression)
-- ============================================================================

-- Policy : Seul admin JTEC peut supprimer des profils
CREATE POLICY "admin_jtec_delete_profiles"
ON profiles FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin_jtec'
  )
);

-- ============================================================================
-- FILTRAGE MODE DEMO/PRO
-- ============================================================================

-- Note : Pour l'instant, pas de filtrage DEMO/PRO sur les profils
-- car un utilisateur doit pouvoir voir son propre profil quel que soit le mode.
-- Le filtrage DEMO/PRO sera appliqué sur les données métier (tickets, missions, etc.)
