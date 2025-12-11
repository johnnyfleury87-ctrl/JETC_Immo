-- ============================================================================
-- Fichier : 22_policies_subscriptions.sql
-- Description : Politiques RLS pour la table subscriptions
-- ============================================================================

-- Activer RLS sur subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLITIQUE 1 : SELECT (Lecture)
-- ============================================================================

-- Policy : Une régie peut voir son propre abonnement
CREATE POLICY "regie_view_own_subscription"
ON subscriptions FOR SELECT
USING (
  regie_id IN (
    SELECT regie_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'regie'
  )
);

-- Policy : Une entreprise peut voir son propre abonnement
CREATE POLICY "entreprise_view_own_subscription"
ON subscriptions FOR SELECT
USING (
  entreprise_id IN (
    SELECT entreprise_id FROM profiles
    WHERE id = auth.uid()
    AND role IN ('entreprise', 'technicien')
  )
);

-- Policy : Admin JTEC peut voir tous les abonnements
CREATE POLICY "admin_jtec_view_all_subscriptions"
ON subscriptions FOR SELECT
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

-- Policy : Une régie peut créer son propre abonnement
CREATE POLICY "regie_create_own_subscription"
ON subscriptions FOR INSERT
WITH CHECK (
  regie_id IN (
    SELECT regie_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'regie'
  )
  AND entreprise_id IS NULL
);

-- Policy : Une entreprise peut créer son propre abonnement
CREATE POLICY "entreprise_create_own_subscription"
ON subscriptions FOR INSERT
WITH CHECK (
  entreprise_id IN (
    SELECT entreprise_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'entreprise'
  )
  AND regie_id IS NULL
);

-- Policy : Admin JTEC peut créer n'importe quel abonnement
CREATE POLICY "admin_jtec_create_subscriptions"
ON subscriptions FOR INSERT
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

-- Policy : Une régie peut modifier son propre abonnement (changement de plan, annulation)
CREATE POLICY "regie_update_own_subscription"
ON subscriptions FOR UPDATE
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

-- Policy : Une entreprise peut modifier son propre abonnement
CREATE POLICY "entreprise_update_own_subscription"
ON subscriptions FOR UPDATE
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

-- Policy : Admin JTEC peut modifier tous les abonnements
CREATE POLICY "admin_jtec_update_subscriptions"
ON subscriptions FOR UPDATE
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

-- Policy : Seul Admin JTEC peut supprimer des abonnements
CREATE POLICY "admin_jtec_delete_subscriptions"
ON subscriptions FOR DELETE
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

-- 1. Chaque régie/entreprise ne voit que son propre abonnement
-- 2. Les utilisateurs peuvent créer leur premier abonnement lors de l'inscription
-- 3. Les utilisateurs peuvent changer de plan (upgrade/downgrade)
-- 4. Les utilisateurs peuvent annuler leur abonnement (statut='annule')
-- 5. Seul Admin JTEC peut supprimer physiquement un abonnement
-- 6. Admin JTEC a un accès complet pour la gestion des abonnements
