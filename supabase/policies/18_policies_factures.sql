-- ============================================================================
-- Fichier : 18_policies_factures.sql
-- Description : Politiques RLS pour la table factures
-- ============================================================================

-- Activer RLS sur factures
ALTER TABLE factures ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLITIQUE 1 : SELECT (Lecture)
-- ============================================================================

-- Policy : Une entreprise peut voir ses propres factures
CREATE POLICY "entreprise_view_own_factures"
ON factures FOR SELECT
USING (
  entreprise_id IN (
    SELECT entreprise_id FROM profiles
    WHERE id = auth.uid()
    AND role IN ('entreprise', 'technicien')
  )
);

-- Policy : Une régie peut voir toutes ses factures
CREATE POLICY "regie_view_own_factures"
ON factures FOR SELECT
USING (
  regie_id IN (
    SELECT regie_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'regie'
  )
);

-- Policy : Admin JTEC peut voir toutes les factures
CREATE POLICY "admin_jtec_view_all_factures"
ON factures FOR SELECT
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

-- Policy : Une entreprise peut créer des factures pour ses missions terminées
CREATE POLICY "entreprise_create_facture"
ON factures FOR INSERT
WITH CHECK (
  entreprise_id IN (
    SELECT entreprise_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'entreprise'
  )
  AND
  -- Vérifier que la mission appartient bien à l'entreprise et est terminée
  mission_id IN (
    SELECT id FROM missions
    WHERE entreprise_id = factures.entreprise_id
    AND statut = 'terminée'
  )
);

-- Policy : Admin JTEC peut créer des factures
CREATE POLICY "admin_jtec_create_facture"
ON factures FOR INSERT
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

-- Policy : Une entreprise peut modifier ses factures non payées
CREATE POLICY "entreprise_update_own_factures"
ON factures FOR UPDATE
USING (
  entreprise_id IN (
    SELECT entreprise_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'entreprise'
  )
  AND statut_paiement NOT IN ('payée', 'annulée')
)
WITH CHECK (
  entreprise_id IN (
    SELECT entreprise_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'entreprise'
  )
);

-- Policy : Une régie peut modifier le statut de paiement de ses factures
CREATE POLICY "regie_update_payment_status"
ON factures FOR UPDATE
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

-- Policy : Admin JTEC peut modifier toutes les factures
CREATE POLICY "admin_jtec_update_all_factures"
ON factures FOR UPDATE
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

-- Policy : Une entreprise peut supprimer ses factures en attente
CREATE POLICY "entreprise_delete_pending_factures"
ON factures FOR DELETE
USING (
  entreprise_id IN (
    SELECT entreprise_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'entreprise'
  )
  AND statut_paiement IN ('en_attente', 'annulée')
);

-- Policy : Admin JTEC peut supprimer toutes les factures
CREATE POLICY "admin_jtec_delete_all_factures"
ON factures FOR DELETE
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

-- 1. Les entreprises ne voient et ne gèrent que leurs propres factures
-- 2. Les régies voient toutes leurs factures (factures à payer)
-- 3. Une entreprise peut créer une facture uniquement pour une mission terminée qui lui appartient
-- 4. Une entreprise peut modifier ses factures non payées
-- 5. Une régie peut modifier le statut de paiement de ses factures
-- 6. Les factures payées ne peuvent plus être modifiées par l'entreprise
-- 7. Admin JTEC a un accès complet
