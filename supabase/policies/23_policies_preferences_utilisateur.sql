-- ============================================================================
-- Fichier : 23_policies_preferences_utilisateur.sql
-- Description : Politiques RLS pour préférences utilisateur (Étape 15)
-- ============================================================================

-- Activer RLS
ALTER TABLE preferences_utilisateur ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLITIQUE SELECT : Un utilisateur voit uniquement ses préférences
-- ============================================================================

CREATE POLICY "select_own_preferences"
ON preferences_utilisateur
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- ============================================================================
-- POLITIQUE INSERT : Un utilisateur peut créer ses préférences
-- ============================================================================

CREATE POLICY "insert_own_preferences"
ON preferences_utilisateur
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND NOT EXISTS (
    SELECT 1 FROM preferences_utilisateur 
    WHERE user_id = auth.uid()
  )
);

-- ============================================================================
-- POLITIQUE UPDATE : Un utilisateur peut modifier ses préférences
-- ============================================================================

CREATE POLICY "update_own_preferences"
ON preferences_utilisateur
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- POLITIQUE DELETE : Un utilisateur peut supprimer ses préférences
-- ============================================================================

CREATE POLICY "delete_own_preferences"
ON preferences_utilisateur
FOR DELETE
TO authenticated
USING (user_id = auth.uid());
