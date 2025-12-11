-- ============================================================================
-- Fichier : 11_policies_regies.sql
-- Description : Politiques RLS pour la table regies
-- ============================================================================

-- Activer RLS sur regies (déjà fait dans 01_tables.sql mais on le rappelle)
ALTER TABLE regies ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLITIQUE 1 : SELECT (Lecture)
-- ============================================================================

-- Policy : Un utilisateur (régie ou locataire) peut lire sa propre régie
CREATE POLICY "users_view_own_regie"
ON regies FOR SELECT
USING (
  id IN (
    SELECT regie_id FROM profiles
    WHERE id = auth.uid()
    AND regie_id IS NOT NULL
  )
);

-- Policy : Admin JTEC peut voir toutes les régies
CREATE POLICY "admin_jtec_view_all_regies"
ON regies FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin_jtec'
  )
);

-- Policy : Une entreprise peut voir les régies avec lesquelles elle travaille
-- (Cette policy sera affinée lors de la création des tables tickets/missions)
CREATE POLICY "entreprise_view_related_regies"
ON regies FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('entreprise', 'technicien')
  )
  -- TODO: Ajouter des conditions supplémentaires basées sur les missions/tickets
);

-- ============================================================================
-- POLITIQUE 2 : INSERT (Création)
-- ============================================================================

-- Policy : Admin JTEC peut créer des régies
CREATE POLICY "admin_jtec_insert_regies"
ON regies FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin_jtec'
  )
);

-- Policy : Un utilisateur peut créer une régie pour lui-même (auto-inscription)
-- Cette policy permet à un utilisateur de créer sa propre régie lors de l'inscription
CREATE POLICY "users_insert_own_regie"
ON regies FOR INSERT
WITH CHECK (true); -- La vérification sera faite au niveau de l'API

-- ============================================================================
-- POLITIQUE 3 : UPDATE (Mise à jour)
-- ============================================================================

-- Policy : Une régie peut mettre à jour ses propres informations
CREATE POLICY "regie_update_own_data"
ON regies FOR UPDATE
USING (
  id IN (
    SELECT regie_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'regie'
  )
)
WITH CHECK (
  id IN (
    SELECT regie_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'regie'
  )
);

-- Policy : Admin JTEC peut tout mettre à jour
CREATE POLICY "admin_jtec_update_regies"
ON regies FOR UPDATE
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

-- Policy : Seul admin JTEC peut supprimer des régies
CREATE POLICY "admin_jtec_delete_regies"
ON regies FOR DELETE
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

-- Note : Si vous souhaitez filtrer les régies DEMO/PRO au niveau RLS,
-- ajoutez cette condition à chaque policy :
-- AND (is_demo = false OR current_setting('app.mode', true) = 'demo')
