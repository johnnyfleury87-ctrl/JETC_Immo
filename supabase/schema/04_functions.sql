-- ============================================================================
-- Fichier : 04_functions.sql
-- Description : Fonctions SQL utilitaires
-- ============================================================================

-- Fonction pour obtenir le profil de l'utilisateur courant
CREATE OR REPLACE FUNCTION get_current_profile()
RETURNS TABLE (
  id UUID,
  role TEXT,
  email TEXT,
  nom TEXT,
  prenom TEXT,
  is_demo BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.role,
    p.email,
    p.nom,
    p.prenom,
    p.is_demo
  FROM profiles p
  WHERE p.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note : D'autres fonctions seront ajoutées selon les besoins
--   - Fonctions pour statistiques agrégées
--   - Fonctions pour gestion de l'historique / logs DEMO
--   - Fonctions pour calculs de commission et facturation
