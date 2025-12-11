-- ============================================================================
-- Fichier : 19_policies_messages.sql
-- Description : Politiques RLS pour la table messages
-- ============================================================================

-- Activer RLS sur messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLITIQUE 1 : SELECT (Lecture)
-- ============================================================================

-- Policy : Un utilisateur peut voir les messages qu'il a envoyés
CREATE POLICY "user_view_sent_messages"
ON messages FOR SELECT
USING (sender_id = auth.uid());

-- Policy : Un utilisateur peut voir les messages qu'il a reçus
CREATE POLICY "user_view_received_messages"
ON messages FOR SELECT
USING (recipient_id = auth.uid());

-- Policy : Admin JTEC peut voir tous les messages
CREATE POLICY "admin_jtec_view_all_messages"
ON messages FOR SELECT
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

-- Policy : Un utilisateur peut envoyer des messages
CREATE POLICY "user_send_messages"
ON messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND
  -- Vérifier que le destinataire existe
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = recipient_id
  )
);

-- Policy : Admin JTEC peut envoyer des messages système
CREATE POLICY "admin_jtec_send_messages"
ON messages FOR INSERT
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

-- Policy : Un utilisateur peut marquer comme lu les messages qu'il a reçus
CREATE POLICY "user_mark_received_as_read"
ON messages FOR UPDATE
USING (recipient_id = auth.uid())
WITH CHECK (recipient_id = auth.uid());

-- Policy : Un utilisateur peut modifier les messages qu'il a envoyés (dans un délai limité)
CREATE POLICY "user_edit_own_messages"
ON messages FOR UPDATE
USING (
  sender_id = auth.uid()
  AND created_at > NOW() - INTERVAL '15 minutes'
)
WITH CHECK (sender_id = auth.uid());

-- Policy : Admin JTEC peut modifier tous les messages
CREATE POLICY "admin_jtec_update_all_messages"
ON messages FOR UPDATE
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

-- Policy : Un utilisateur peut supprimer les messages qu'il a envoyés (dans les 15 min)
CREATE POLICY "user_delete_own_messages"
ON messages FOR DELETE
USING (
  sender_id = auth.uid()
  AND created_at > NOW() - INTERVAL '15 minutes'
);

-- Policy : Admin JTEC peut supprimer tous les messages
CREATE POLICY "admin_jtec_delete_all_messages"
ON messages FOR DELETE
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

-- 1. Chaque utilisateur ne voit que les messages qu'il a envoyés ou reçus
-- 2. Les messages sont liés optionnellement à un ticket, mission ou facture pour le contexte
-- 3. Un utilisateur peut modifier/supprimer ses messages envoyés dans les 15 minutes
-- 4. Un destinataire peut marquer ses messages reçus comme lus
-- 5. Le threading (parent_message_id) permet de créer des conversations
-- 6. Admin JTEC a un accès complet pour la modération
-- 7. Les messages système peuvent être envoyés par l'admin pour les notifications
