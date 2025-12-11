-- ============================================================================
-- Fichier : 16_policies_tickets.sql
-- Description : Politiques RLS pour la table tickets
-- ============================================================================

-- Activer RLS sur tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLITIQUE 1 : SELECT (Lecture)
-- ============================================================================

-- Policy : Un locataire peut voir uniquement ses propres tickets
CREATE POLICY "locataire_view_own_tickets"
ON tickets FOR SELECT
USING (
  locataire_id IN (
    SELECT id FROM locataires
    WHERE profile_id = auth.uid()
  )
);

-- Policy : Une régie peut voir tous les tickets de ses logements
CREATE POLICY "regie_view_own_tickets"
ON tickets FOR SELECT
USING (
  regie_id IN (
    SELECT regie_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'regie'
  )
);

-- Policy : Une entreprise peut voir les tickets selon le mode de diffusion
-- En mode général : toutes les entreprises liées à la régie du ticket
-- En mode restreint : seulement les entreprises autorisées
CREATE POLICY "entreprise_view_diffused_tickets"
ON tickets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role IN ('entreprise', 'technicien')
    AND (
      -- Mode général : l'entreprise peut voir les tickets de régies qui ont lié cette entreprise (pas encore implémenté)
      -- Pour l'instant, on vérifie uniquement le mode restreint
      (diffusion_mode = 'restreint' AND p.entreprise_id = ANY(entreprises_autorisees))
      OR
      -- Mode général : vérification à implémenter avec une table de liaison regies_entreprises
      (diffusion_mode = 'general' AND statut IN ('diffusé', 'accepté', 'en_cours', 'terminé'))
    )
  )
);

-- Policy : Admin JTEC peut voir tous les tickets
CREATE POLICY "admin_jtec_view_all_tickets"
ON tickets FOR SELECT
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

-- Policy : Un locataire peut créer un ticket uniquement pour son propre logement
CREATE POLICY "locataire_create_own_ticket"
ON tickets FOR INSERT
WITH CHECK (
  locataire_id IN (
    SELECT id FROM locataires
    WHERE profile_id = auth.uid()
  )
  AND logement_id IN (
    SELECT logement_id FROM locataires
    WHERE profile_id = auth.uid()
  )
);

-- Policy : Une régie peut créer des tickets pour n'importe lequel de ses logements
CREATE POLICY "regie_create_ticket"
ON tickets FOR INSERT
WITH CHECK (
  regie_id IN (
    SELECT regie_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'regie'
  )
  AND logement_id IN (
    SELECT l.id FROM logements l
    JOIN immeubles i ON l.immeuble_id = i.id
    WHERE i.regie_id = regie_id
  )
);

-- Policy : Admin JTEC peut créer des tickets pour toute régie
CREATE POLICY "admin_jtec_create_ticket"
ON tickets FOR INSERT
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

-- Policy : Un locataire peut modifier ses propres tickets (sauf certains champs critiques)
-- Note : La validation des champs modifiables sera gérée côté API
CREATE POLICY "locataire_update_own_ticket"
ON tickets FOR UPDATE
USING (
  locataire_id IN (
    SELECT id FROM locataires
    WHERE profile_id = auth.uid()
  )
  AND statut IN ('nouveau', 'en_attente_diffusion') -- Seulement les tickets pas encore diffusés
)
WITH CHECK (
  locataire_id IN (
    SELECT id FROM locataires
    WHERE profile_id = auth.uid()
  )
);

-- Policy : Une régie peut modifier tous les tickets de ses logements
CREATE POLICY "regie_update_own_tickets"
ON tickets FOR UPDATE
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

-- Policy : Une entreprise peut modifier le statut d'un ticket (acceptation, refus)
-- Note : Les entreprises ne peuvent modifier que certains champs (à gérer dans l'API)
CREATE POLICY "entreprise_update_ticket_status"
ON tickets FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'entreprise'
    AND (
      (diffusion_mode = 'restreint' AND p.entreprise_id = ANY(entreprises_autorisees))
      OR
      (diffusion_mode = 'general' AND statut IN ('diffusé', 'accepté', 'en_cours'))
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'entreprise'
  )
);

-- Policy : Admin JTEC peut modifier tous les tickets
CREATE POLICY "admin_jtec_update_all_tickets"
ON tickets FOR UPDATE
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

-- Policy : Un locataire peut supprimer ses tickets non encore diffusés
CREATE POLICY "locataire_delete_own_ticket"
ON tickets FOR DELETE
USING (
  locataire_id IN (
    SELECT id FROM locataires
    WHERE profile_id = auth.uid()
  )
  AND statut IN ('nouveau', 'en_attente_diffusion')
);

-- Policy : Une régie peut supprimer tous les tickets de ses logements
CREATE POLICY "regie_delete_own_tickets"
ON tickets FOR DELETE
USING (
  regie_id IN (
    SELECT regie_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'regie'
  )
);

-- Policy : Admin JTEC peut supprimer tous les tickets
CREATE POLICY "admin_jtec_delete_all_tickets"
ON tickets FOR DELETE
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

-- 1. Les locataires ne voient que leurs propres tickets
-- 2. Les régies voient tous les tickets de leurs logements
-- 3. Les entreprises ne voient que :
--    - En mode restreint : les tickets où elles sont dans entreprises_autorisees[]
--    - En mode général : les tickets diffusés (nécessite table de liaison regies_entreprises)
-- 4. Les techniciens héritent des droits de leur entreprise
-- 5. Admin JTEC voit tout

-- La diffusion mode permet à la régie de :
-- - Mode général : diffuser à toutes les entreprises partenaires
-- - Mode restreint : diffuser uniquement à une liste sélectionnée d'entreprises
