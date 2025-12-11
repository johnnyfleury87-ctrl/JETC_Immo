-- ============================================================================
-- Fichier : 25_policies_webhooks.sql
-- Description : Politiques RLS pour webhooks (Étape 15)
-- ============================================================================

-- Activer RLS
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLITIQUE SELECT : Voir les webhooks de son entité
-- ============================================================================

CREATE POLICY "select_own_entity_webhooks"
ON webhooks
FOR SELECT
TO authenticated
USING (
  -- Régie voit ses webhooks
  (regie_id IN (
    SELECT regie_id FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'regie'
  ))
  OR
  -- Entreprise voit ses webhooks
  (entreprise_id IN (
    SELECT entreprise_id FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'entreprise'
  ))
  OR
  -- Admin voit tout
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin_jtec'
  )
);

-- ============================================================================
-- POLITIQUE INSERT : Créer des webhooks pour son entité
-- ============================================================================

CREATE POLICY "insert_own_entity_webhooks"
ON webhooks
FOR INSERT
TO authenticated
WITH CHECK (
  -- Régie crée ses webhooks
  (regie_id IN (
    SELECT regie_id FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'regie'
  ))
  OR
  -- Entreprise crée ses webhooks
  (entreprise_id IN (
    SELECT entreprise_id FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'entreprise'
  ))
  OR
  -- Admin peut créer pour n'importe qui
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin_jtec'
  )
);

-- ============================================================================
-- POLITIQUE UPDATE : Modifier les webhooks de son entité
-- ============================================================================

CREATE POLICY "update_own_entity_webhooks"
ON webhooks
FOR UPDATE
TO authenticated
USING (
  -- Régie modifie ses webhooks
  (regie_id IN (
    SELECT regie_id FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'regie'
  ))
  OR
  -- Entreprise modifie ses webhooks
  (entreprise_id IN (
    SELECT entreprise_id FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'entreprise'
  ))
  OR
  -- Admin modifie tout
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin_jtec'
  )
)
WITH CHECK (
  -- Mêmes conditions que USING
  (regie_id IN (
    SELECT regie_id FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'regie'
  ))
  OR
  (entreprise_id IN (
    SELECT entreprise_id FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'entreprise'
  ))
  OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin_jtec'
  )
);

-- ============================================================================
-- POLITIQUE DELETE : Supprimer les webhooks de son entité
-- ============================================================================

CREATE POLICY "delete_own_entity_webhooks"
ON webhooks
FOR DELETE
TO authenticated
USING (
  -- Régie supprime ses webhooks
  (regie_id IN (
    SELECT regie_id FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'regie'
  ))
  OR
  -- Entreprise supprime ses webhooks
  (entreprise_id IN (
    SELECT entreprise_id FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'entreprise'
  ))
  OR
  -- Admin supprime tout
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin_jtec'
  )
);
