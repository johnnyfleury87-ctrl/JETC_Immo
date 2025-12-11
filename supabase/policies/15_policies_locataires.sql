-- ============================================================================
-- Fichier : 15_policies_locataires.sql
-- Description : Politiques RLS pour la table locataires
-- ============================================================================

-- Activer RLS sur locataires
ALTER TABLE locataires ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLITIQUE 1 : SELECT (Lecture)
-- ============================================================================

-- Policy : Un locataire peut voir son propre enregistrement
CREATE POLICY "locataire_view_own_data"
ON locataires FOR SELECT
USING (profile_id = auth.uid());

-- Policy : Une régie peut voir tous les locataires de ses logements
CREATE POLICY "regie_view_own_locataires"
ON locataires FOR SELECT
USING (
  logement_id IN (
    SELECT l.id FROM logements l
    JOIN immeubles i ON l.immeuble_id = i.id
    WHERE i.regie_id IN (
      SELECT regie_id FROM profiles
      WHERE id = auth.uid()
      AND role = 'regie'
    )
  )
);

-- Policy : Admin JTEC peut voir tous les locataires
CREATE POLICY "admin_jtec_view_all_locataires"
ON locataires FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin_jtec'
  )
);

-- Policy : Entreprises et techniciens peuvent voir les locataires liés à leurs missions
-- (Cette policy sera complétée lors de la création des tickets/missions)
CREATE POLICY "entreprise_view_related_locataires"
ON locataires FOR SELECT
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

-- Policy : Une régie peut créer des locataires dans ses logements
CREATE POLICY "regie_insert_own_locataires"
ON locataires FOR INSERT
WITH CHECK (
  logement_id IN (
    SELECT l.id FROM logements l
    JOIN immeubles i ON l.immeuble_id = i.id
    WHERE i.regie_id IN (
      SELECT regie_id FROM profiles
      WHERE id = auth.uid()
      AND role = 'regie'
    )
  )
);

-- Policy : Admin JTEC peut créer des locataires
CREATE POLICY "admin_jtec_insert_locataires"
ON locataires FOR INSERT
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

-- Policy : Un locataire peut mettre à jour certaines de ses informations
-- (limité aux informations personnelles, pas les informations du bail)
CREATE POLICY "locataire_update_own_data"
ON locataires FOR UPDATE
USING (profile_id = auth.uid())
WITH CHECK (
  profile_id = auth.uid()
  -- Note : La logique métier dans l'API empêchera la modification des champs sensibles
);

-- Policy : Une régie peut mettre à jour les locataires de ses logements
CREATE POLICY "regie_update_own_locataires"
ON locataires FOR UPDATE
USING (
  logement_id IN (
    SELECT l.id FROM logements l
    JOIN immeubles i ON l.immeuble_id = i.id
    WHERE i.regie_id IN (
      SELECT regie_id FROM profiles
      WHERE id = auth.uid()
      AND role = 'regie'
    )
  )
)
WITH CHECK (
  logement_id IN (
    SELECT l.id FROM logements l
    JOIN immeubles i ON l.immeuble_id = i.id
    WHERE i.regie_id IN (
      SELECT regie_id FROM profiles
      WHERE id = auth.uid()
      AND role = 'regie'
    )
  )
);

-- Policy : Admin JTEC peut tout mettre à jour
CREATE POLICY "admin_jtec_update_locataires"
ON locataires FOR UPDATE
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

-- Policy : Une régie peut supprimer les locataires de ses logements
CREATE POLICY "regie_delete_own_locataires"
ON locataires FOR DELETE
USING (
  logement_id IN (
    SELECT l.id FROM logements l
    JOIN immeubles i ON l.immeuble_id = i.id
    WHERE i.regie_id IN (
      SELECT regie_id FROM profiles
      WHERE id = auth.uid()
      AND role = 'regie'
    )
  )
);

-- Policy : Admin JTEC peut tout supprimer
CREATE POLICY "admin_jtec_delete_locataires"
ON locataires FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin_jtec'
  )
);
