-- ============================================================================
-- Fichier : 17_policies_missions.sql
-- Description : Politiques RLS pour la table missions
-- ============================================================================

-- Activer RLS sur missions
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLITIQUE 1 : SELECT (Lecture)
-- ============================================================================

-- Policy : Une entreprise peut voir ses propres missions
CREATE POLICY "entreprise_view_own_missions"
ON missions FOR SELECT
USING (
  entreprise_id IN (
    SELECT entreprise_id FROM profiles
    WHERE id = auth.uid()
    AND role IN ('entreprise', 'technicien')
  )
);

-- Policy : Un technicien peut voir ses missions assignées
CREATE POLICY "technicien_view_assigned_missions"
ON missions FOR SELECT
USING (
  technicien_id IN (
    SELECT id FROM profiles
    WHERE id = auth.uid()
    AND role = 'technicien'
  )
);

-- Policy : Une régie peut voir toutes les missions liées à ses tickets
CREATE POLICY "regie_view_related_missions"
ON missions FOR SELECT
USING (
  ticket_id IN (
    SELECT t.id FROM tickets t
    WHERE t.regie_id IN (
      SELECT regie_id FROM profiles
      WHERE id = auth.uid()
      AND role = 'regie'
    )
  )
);

-- Policy : Un locataire peut voir les missions liées à ses tickets
CREATE POLICY "locataire_view_own_ticket_missions"
ON missions FOR SELECT
USING (
  ticket_id IN (
    SELECT t.id FROM tickets t
    WHERE t.locataire_id IN (
      SELECT id FROM locataires
      WHERE profile_id = auth.uid()
    )
  )
);

-- Policy : Admin JTEC peut voir toutes les missions
CREATE POLICY "admin_jtec_view_all_missions"
ON missions FOR SELECT
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

-- Policy : Une entreprise peut créer une mission pour un ticket qui lui est accessible
CREATE POLICY "entreprise_create_mission"
ON missions FOR INSERT
WITH CHECK (
  -- L'entreprise doit être authentifiée
  entreprise_id IN (
    SELECT entreprise_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'entreprise'
  )
  AND
  -- Le ticket doit être accessible à l'entreprise (selon mode de diffusion)
  ticket_id IN (
    SELECT t.id FROM tickets t
    WHERE (
      (t.diffusion_mode = 'general' AND t.statut = 'diffusé')
      OR
      (t.diffusion_mode = 'restreint' AND entreprise_id = ANY(t.entreprises_autorisees))
    )
  )
);

-- Policy : Admin JTEC peut créer des missions pour toute entreprise
CREATE POLICY "admin_jtec_create_mission"
ON missions FOR INSERT
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

-- Policy : Une entreprise peut modifier ses propres missions
CREATE POLICY "entreprise_update_own_missions"
ON missions FOR UPDATE
USING (
  entreprise_id IN (
    SELECT entreprise_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'entreprise'
  )
)
WITH CHECK (
  entreprise_id IN (
    SELECT entreprise_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'entreprise'
  )
);

-- Policy : Un technicien peut modifier ses missions assignées (champs limités)
-- Note : La limitation des champs sera gérée côté API
CREATE POLICY "technicien_update_assigned_missions"
ON missions FOR UPDATE
USING (
  technicien_id IN (
    SELECT id FROM profiles
    WHERE id = auth.uid()
    AND role = 'technicien'
  )
)
WITH CHECK (
  technicien_id IN (
    SELECT id FROM profiles
    WHERE id = auth.uid()
    AND role = 'technicien'
  )
);

-- Policy : Une régie peut modifier certains champs des missions liées à ses tickets
-- Note : La limitation des champs sera gérée côté API
CREATE POLICY "regie_update_related_missions"
ON missions FOR UPDATE
USING (
  ticket_id IN (
    SELECT t.id FROM tickets t
    WHERE t.regie_id IN (
      SELECT regie_id FROM profiles
      WHERE id = auth.uid()
      AND role = 'regie'
    )
  )
)
WITH CHECK (
  ticket_id IN (
    SELECT t.id FROM tickets t
    WHERE t.regie_id IN (
      SELECT regie_id FROM profiles
      WHERE id = auth.uid()
      AND role = 'regie'
    )
  )
);

-- Policy : Admin JTEC peut modifier toutes les missions
CREATE POLICY "admin_jtec_update_all_missions"
ON missions FOR UPDATE
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

-- Policy : Une entreprise peut supprimer ses missions non commencées
CREATE POLICY "entreprise_delete_own_missions"
ON missions FOR DELETE
USING (
  entreprise_id IN (
    SELECT entreprise_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'entreprise'
  )
  AND statut IN ('en_attente', 'planifiée')
);

-- Policy : Une régie peut supprimer les missions liées à ses tickets (si non commencées)
CREATE POLICY "regie_delete_related_missions"
ON missions FOR DELETE
USING (
  ticket_id IN (
    SELECT t.id FROM tickets t
    WHERE t.regie_id IN (
      SELECT regie_id FROM profiles
      WHERE id = auth.uid()
      AND role = 'regie'
    )
  )
  AND statut IN ('en_attente', 'planifiée')
);

-- Policy : Admin JTEC peut supprimer toutes les missions
CREATE POLICY "admin_jtec_delete_all_missions"
ON missions FOR DELETE
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

-- 1. Les entreprises ne voient et ne gèrent que leurs propres missions
-- 2. Les techniciens ne voient que leurs missions assignées
-- 3. Les régies voient toutes les missions liées à leurs tickets
-- 4. Les locataires voient les missions liées à leurs tickets (lecture seule via API)
-- 5. Admin JTEC a un accès complet
-- 6. La contrainte UNIQUE sur ticket_id empêche les doublons (une mission par ticket)
-- 7. Les transitions de statut seront validées côté API
