-- ============================================================================
-- Fichier : 12_policies_entreprises.sql
-- Description : Politiques RLS pour la table entreprises
-- ============================================================================

-- Activer RLS sur entreprises (déjà fait dans 01_tables.sql mais on le rappelle)
ALTER TABLE entreprises ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLITIQUE 1 : SELECT (Lecture)
-- ============================================================================

-- Policy : Un utilisateur (entreprise ou technicien) peut lire sa propre entreprise
CREATE POLICY "users_view_own_entreprise"
ON entreprises FOR SELECT
USING (
  id IN (
    SELECT entreprise_id FROM profiles
    WHERE id = auth.uid()
    AND entreprise_id IS NOT NULL
  )
);

-- Policy : Admin JTEC peut voir toutes les entreprises
CREATE POLICY "admin_jtec_view_all_entreprises"
ON entreprises FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin_jtec'
  )
);

-- Policy : Une régie peut voir les entreprises disponibles dans son périmètre
-- (Cette policy sera affinée lors de la diffusion des tickets)
CREATE POLICY "regie_view_available_entreprises"
ON entreprises FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'regie'
  )
);

-- ============================================================================
-- POLITIQUE 2 : INSERT (Création)
-- ============================================================================

-- Policy : Admin JTEC peut créer des entreprises
CREATE POLICY "admin_jtec_insert_entreprises"
ON entreprises FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin_jtec'
  )
);

-- Policy : Un utilisateur peut créer une entreprise pour lui-même (auto-inscription)
CREATE POLICY "users_insert_own_entreprise"
ON entreprises FOR INSERT
WITH CHECK (true); -- La vérification sera faite au niveau de l'API

-- ============================================================================
-- POLITIQUE 3 : UPDATE (Mise à jour)
-- ============================================================================

-- Policy : Une entreprise peut mettre à jour ses propres informations
CREATE POLICY "entreprise_update_own_data"
ON entreprises FOR UPDATE
USING (
  id IN (
    SELECT entreprise_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'entreprise'
  )
)
WITH CHECK (
  id IN (
    SELECT entreprise_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'entreprise'
  )
);

-- Policy : Admin JTEC peut tout mettre à jour
CREATE POLICY "admin_jtec_update_entreprises"
ON entreprises FOR UPDATE
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

-- Policy : Seul admin JTEC peut supprimer des entreprises
CREATE POLICY "admin_jtec_delete_entreprises"
ON entreprises FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin_jtec'
  )
);

-- ============================================================================
-- FILTRAGE MODE DEMO/PRO (optionnel)
-- ============================================================================

-- Note : Si vous souhaitez filtrer les entreprises DEMO/PRO au niveau RLS,
-- ajoutez cette condition à chaque policy :
-- AND (is_demo = false OR current_setting('app.mode', true) = 'demo')
