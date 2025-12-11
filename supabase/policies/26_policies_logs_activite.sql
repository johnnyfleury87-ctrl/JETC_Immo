-- ============================================================================
-- Fichier : 26_policies_logs_activite.sql
-- Description : Politiques RLS pour logs d'activité (Étape 15)
-- ============================================================================

-- Activer RLS
ALTER TABLE logs_activite ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLITIQUE SELECT : Voir ses propres logs ou tout pour admin
-- ============================================================================

CREATE POLICY "select_logs"
ON logs_activite
FOR SELECT
TO authenticated
USING (
  -- Utilisateur voit ses propres logs
  user_id = auth.uid()
  OR
  -- Admin voit tous les logs
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin_jtec'
  )
);

-- ============================================================================
-- POLITIQUE INSERT : Les logs sont créés par le système (service_role)
-- Pas de politique INSERT pour authenticated, seulement pour service_role
-- ============================================================================

CREATE POLICY "insert_logs_service_role"
ON logs_activite
FOR INSERT
TO service_role
WITH CHECK (true);

-- Les utilisateurs authentifiés peuvent créer leurs propres logs
CREATE POLICY "insert_own_logs"
ON logs_activite
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- POLITIQUE UPDATE : Aucune modification des logs (immutable audit trail)
-- ============================================================================

-- Pas de politique UPDATE : les logs ne doivent jamais être modifiés

-- ============================================================================
-- POLITIQUE DELETE : Seul l'admin peut supprimer des logs (rétention)
-- ============================================================================

CREATE POLICY "delete_logs_admin_only"
ON logs_activite
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin_jtec'
  )
);
