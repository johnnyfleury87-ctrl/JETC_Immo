-- ============================================================================
-- Fichier : 20_policies_notifications.sql
-- Description : Politiques RLS pour la table notifications
-- ============================================================================

-- Activer RLS sur notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLITIQUE 1 : SELECT (Lecture)
-- ============================================================================

-- Policy : Un utilisateur peut voir ses propres notifications
CREATE POLICY "user_view_own_notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- Policy : Admin JTEC peut voir toutes les notifications
CREATE POLICY "admin_jtec_view_all_notifications"
ON notifications FOR SELECT
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

-- Policy : Seuls les systèmes ou admin peuvent créer des notifications
-- Les notifications sont généralement créées par des triggers ou l'API système
CREATE POLICY "admin_jtec_create_notifications"
ON notifications FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin_jtec'
  )
);

-- Policy : Le système peut créer des notifications (via service role)
-- Note: Cette policy permet l'insertion via service_role_key côté backend
CREATE POLICY "service_create_notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- POLITIQUE 3 : UPDATE (Modification)
-- ============================================================================

-- Policy : Un utilisateur peut marquer ses notifications comme lues/archivées
CREATE POLICY "user_update_own_notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy : Admin JTEC peut modifier toutes les notifications
CREATE POLICY "admin_jtec_update_all_notifications"
ON notifications FOR UPDATE
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

-- Policy : Un utilisateur peut supprimer ses propres notifications archivées
CREATE POLICY "user_delete_archived_notifications"
ON notifications FOR DELETE
USING (
  user_id = auth.uid()
  AND archivee = true
);

-- Policy : Admin JTEC peut supprimer toutes les notifications
CREATE POLICY "admin_jtec_delete_all_notifications"
ON notifications FOR DELETE
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

-- 1. Chaque utilisateur ne voit que ses propres notifications
-- 2. Les notifications sont créées par le système (backend avec service_role)
-- 3. Les utilisateurs peuvent marquer leurs notifications comme lues ou archivées
-- 4. Seules les notifications archivées peuvent être supprimées par l'utilisateur
-- 5. Les notifications sont liées aux événements métier (tickets, missions, etc.)
-- 6. Les canaux de notification (in_app, email, push) sont paramétrables
-- 7. Admin JTEC a un accès complet pour la gestion
