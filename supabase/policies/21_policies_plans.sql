-- ============================================================================
-- Fichier : 21_policies_plans.sql
-- Description : Politiques RLS pour la table plans
-- ============================================================================

-- Activer RLS sur plans
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLITIQUE 1 : SELECT (Lecture)
-- ============================================================================

-- Policy : Tous les utilisateurs authentifiés peuvent voir les plans actifs et visibles
CREATE POLICY "authenticated_view_visible_plans"
ON plans FOR SELECT
USING (
  est_actif = true 
  AND est_visible = true
);

-- Policy : Admin JTEC peut voir tous les plans
CREATE POLICY "admin_jtec_view_all_plans"
ON plans FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin_jtec'
  )
);

-- ============================================================================
-- POLITIQUE 2 : INSERT (Création)
-- ============================================================================

-- Policy : Seul Admin JTEC peut créer des plans
CREATE POLICY "admin_jtec_create_plans"
ON plans FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin_jtec'
  )
);

-- ============================================================================
-- POLITIQUE 3 : UPDATE (Modification)
-- ============================================================================

-- Policy : Seul Admin JTEC peut modifier les plans
CREATE POLICY "admin_jtec_update_plans"
ON plans FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin_jtec'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin_jtec'
  )
);

-- ============================================================================
-- POLITIQUE 4 : DELETE (Suppression)
-- ============================================================================

-- Policy : Seul Admin JTEC peut supprimer les plans
CREATE POLICY "admin_jtec_delete_plans"
ON plans FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin_jtec'
  )
);

-- ============================================================================
-- NOTES SUR L'ISOLATION
-- ============================================================================

-- 1. Tous les utilisateurs authentifiés peuvent consulter les plans visibles
-- 2. Seul Admin JTEC peut créer, modifier ou supprimer des plans
-- 3. Les plans peuvent être désactivés (est_actif=false) sans être supprimés
-- 4. Les plans invisibles (est_visible=false) ne sont pas affichés sur la page tarifs
