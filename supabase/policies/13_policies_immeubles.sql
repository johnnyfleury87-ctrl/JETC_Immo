-- ============================================================================
-- Fichier : 13_policies_immeubles.sql
-- Description : Politiques RLS pour la table immeubles
-- ============================================================================

-- Activer RLS sur immeubles
ALTER TABLE immeubles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLITIQUE 1 : SELECT (Lecture)
-- ============================================================================

-- Policy : Une régie peut voir tous ses immeubles
CREATE POLICY "regie_view_own_immeubles"
ON immeubles FOR SELECT
USING (
  regie_id IN (
    SELECT regie_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'regie'
  )
);

-- Policy : Un locataire peut voir l'immeuble de son logement
CREATE POLICY "locataire_view_own_immeuble"
ON immeubles FOR SELECT
USING (
  id IN (
    SELECT immeuble_id FROM logements
    WHERE id IN (
      SELECT logement_id FROM locataires
      WHERE profile_id = auth.uid()
    )
  )
);

-- Policy : Admin JTEC peut voir tous les immeubles
CREATE POLICY "admin_jtec_view_all_immeubles"
ON immeubles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin_jtec'
  )
);

-- Policy : Entreprises et techniciens peuvent voir les immeubles liés à leurs missions
-- (Cette policy sera complétée lors de la création des tickets/missions)
CREATE POLICY "entreprise_view_related_immeubles"
ON immeubles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('entreprise', 'technicien')
  )
  -- TODO: Ajouter des conditions basées sur les missions
);

-- ============================================================================
-- POLITIQUE 2 : INSERT (Création)
-- ============================================================================

-- Policy : Une régie peut créer des immeubles pour elle-même
CREATE POLICY "regie_insert_own_immeubles"
ON immeubles FOR INSERT
WITH CHECK (
  regie_id IN (
    SELECT regie_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'regie'
  )
);

-- Policy : Admin JTEC peut créer des immeubles
CREATE POLICY "admin_jtec_insert_immeubles"
ON immeubles FOR INSERT
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

-- Policy : Une régie peut mettre à jour ses propres immeubles
CREATE POLICY "regie_update_own_immeubles"
ON immeubles FOR UPDATE
USING (
  regie_id IN (
    SELECT regie_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'regie'
  )
)
WITH CHECK (
  regie_id IN (
    SELECT regie_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'regie'
  )
);

-- Policy : Admin JTEC peut tout mettre à jour
CREATE POLICY "admin_jtec_update_immeubles"
ON immeubles FOR UPDATE
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

-- Policy : Une régie peut supprimer ses propres immeubles
CREATE POLICY "regie_delete_own_immeubles"
ON immeubles FOR DELETE
USING (
  regie_id IN (
    SELECT regie_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'regie'
  )
);

-- Policy : Admin JTEC peut tout supprimer
CREATE POLICY "admin_jtec_delete_immeubles"
ON immeubles FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin_jtec'
  )
);
