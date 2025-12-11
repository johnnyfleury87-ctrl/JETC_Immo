-- ============================================================================
-- Fichier : 24_policies_parametres_application.sql
-- Description : Politiques RLS pour paramètres application (Étape 15)
-- ============================================================================

-- Activer RLS
ALTER TABLE parametres_application ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLITIQUE SELECT : Voir les paramètres de son entité
-- ============================================================================

CREATE POLICY "select_own_entity_params"
ON parametres_application
FOR SELECT
TO authenticated
USING (
  -- Régie voit ses paramètres
  (regie_id IN (
    SELECT regie_id FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('regie', 'locataire')
  ))
  OR
  -- Entreprise voit ses paramètres
  (entreprise_id IN (
    SELECT entreprise_id FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('entreprise', 'technicien')
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
-- POLITIQUE INSERT : Créer les paramètres de son entité
-- ============================================================================

CREATE POLICY "insert_own_entity_params"
ON parametres_application
FOR INSERT
TO authenticated
WITH CHECK (
  -- Régie crée ses paramètres
  (
    regie_id IN (
      SELECT regie_id FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'regie'
    )
    AND NOT EXISTS (
      SELECT 1 FROM parametres_application 
      WHERE parametres_application.regie_id = parametres_application.regie_id
    )
  )
  OR
  -- Entreprise crée ses paramètres
  (
    entreprise_id IN (
      SELECT entreprise_id FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'entreprise'
    )
    AND NOT EXISTS (
      SELECT 1 FROM parametres_application 
      WHERE parametres_application.entreprise_id = parametres_application.entreprise_id
    )
  )
  OR
  -- Admin peut créer pour n'importe qui
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin_jtec'
  )
);

-- ============================================================================
-- POLITIQUE UPDATE : Modifier les paramètres de son entité
-- ============================================================================

CREATE POLICY "update_own_entity_params"
ON parametres_application
FOR UPDATE
TO authenticated
USING (
  -- Régie modifie ses paramètres
  (regie_id IN (
    SELECT regie_id FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'regie'
  ))
  OR
  -- Entreprise modifie ses paramètres
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
-- POLITIQUE DELETE : Seul l'admin peut supprimer des paramètres
-- ============================================================================

CREATE POLICY "delete_params_admin_only"
ON parametres_application
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin_jtec'
  )
);
