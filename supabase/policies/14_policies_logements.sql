-- ============================================================================
-- Fichier : 14_policies_logements.sql
-- Description : Politiques RLS pour la table logements
-- ============================================================================

-- Activer RLS sur logements
ALTER TABLE logements ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLITIQUE 1 : SELECT (Lecture)
-- ============================================================================

-- Policy : Une régie peut voir tous les logements de ses immeubles
CREATE POLICY "regie_view_own_logements"
ON logements FOR SELECT
USING (
  immeuble_id IN (
    SELECT id FROM immeubles
    WHERE regie_id IN (
      SELECT regie_id FROM profiles
      WHERE id = auth.uid()
      AND role = 'regie'
    )
  )
);

-- Policy : Un locataire peut voir son propre logement
CREATE POLICY "locataire_view_own_logement"
ON logements FOR SELECT
USING (
  id IN (
    SELECT logement_id FROM locataires
    WHERE profile_id = auth.uid()
  )
);

-- Policy : Admin JTEC peut voir tous les logements
CREATE POLICY "admin_jtec_view_all_logements"
ON logements FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin_jtec'
  )
);

-- Policy : Entreprises et techniciens peuvent voir les logements liés à leurs missions
-- (Cette policy sera complétée lors de la création des tickets/missions)
CREATE POLICY "entreprise_view_related_logements"
ON logements FOR SELECT
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

-- Policy : Une régie peut créer des logements dans ses immeubles
CREATE POLICY "regie_insert_own_logements"
ON logements FOR INSERT
WITH CHECK (
  immeuble_id IN (
    SELECT id FROM immeubles
    WHERE regie_id IN (
      SELECT regie_id FROM profiles
      WHERE id = auth.uid()
      AND role = 'regie'
    )
  )
);

-- Policy : Admin JTEC peut créer des logements
CREATE POLICY "admin_jtec_insert_logements"
ON logements FOR INSERT
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

-- Policy : Une régie peut mettre à jour les logements de ses immeubles
CREATE POLICY "regie_update_own_logements"
ON logements FOR UPDATE
USING (
  immeuble_id IN (
    SELECT id FROM immeubles
    WHERE regie_id IN (
      SELECT regie_id FROM profiles
      WHERE id = auth.uid()
      AND role = 'regie'
    )
  )
)
WITH CHECK (
  immeuble_id IN (
    SELECT id FROM immeubles
    WHERE regie_id IN (
      SELECT regie_id FROM profiles
      WHERE id = auth.uid()
      AND role = 'regie'
    )
  )
);

-- Policy : Admin JTEC peut tout mettre à jour
CREATE POLICY "admin_jtec_update_logements"
ON logements FOR UPDATE
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

-- Policy : Une régie peut supprimer les logements de ses immeubles
CREATE POLICY "regie_delete_own_logements"
ON logements FOR DELETE
USING (
  immeuble_id IN (
    SELECT id FROM immeubles
    WHERE regie_id IN (
      SELECT regie_id FROM profiles
      WHERE id = auth.uid()
      AND role = 'regie'
    )
  )
);

-- Policy : Admin JTEC peut tout supprimer
CREATE POLICY "admin_jtec_delete_logements"
ON logements FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin_jtec'
  )
);
