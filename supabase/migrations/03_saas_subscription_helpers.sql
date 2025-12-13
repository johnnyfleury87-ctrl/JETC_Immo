-- ============================================================================
-- Migration : 03_saas_subscription_helpers.sql
-- Date : 2025-12-13
-- Description : Fonctions helper pour récupérer subscriptions et vérifier quotas
-- Dépendances : 01_plans_update_chf.sql, 02_saas_owner_tracking.sql
-- ============================================================================

-- ============================================================================
-- FONCTION 1 : get_subscription_for_regie()
-- Description : Récupérer l'abonnement actif d'une régie
-- ============================================================================

CREATE OR REPLACE FUNCTION get_subscription_for_regie(regie_uuid UUID)
RETURNS TABLE (
  subscription_id UUID,
  plan_id UUID,
  plan_nom TEXT,
  statut TEXT,
  usage_users INTEGER,
  max_users INTEGER,
  usage_admins INTEGER,
  max_admins INTEGER,
  usage_logements INTEGER,
  max_logements INTEGER,
  max_entreprises_partenaires INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id AS subscription_id,
    s.plan_id,
    p.nom AS plan_nom,
    s.statut,
    s.usage_users,
    p.max_users,
    s.usage_admins,
    p.max_admins,
    s.usage_logements,
    p.max_logements,
    p.max_entreprises_partenaires
  FROM subscriptions s
  JOIN plans p ON p.id = s.plan_id
  WHERE s.regie_id = regie_uuid
  AND s.statut IN ('essai', 'actif')
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_subscription_for_regie IS 'Récupère l''abonnement actif d''une régie avec limites du plan';

-- ============================================================================
-- FONCTION 2 : get_subscription_for_entreprise()
-- Description : Récupérer l'abonnement actif d'une entreprise
-- ============================================================================

CREATE OR REPLACE FUNCTION get_subscription_for_entreprise(entreprise_uuid UUID)
RETURNS TABLE (
  subscription_id UUID,
  plan_id UUID,
  plan_nom TEXT,
  statut TEXT,
  usage_users INTEGER,
  max_users INTEGER,
  usage_admins INTEGER,
  max_admins INTEGER,
  usage_missions INTEGER,
  max_missions INTEGER,
  max_techniciens INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id AS subscription_id,
    s.plan_id,
    p.nom AS plan_nom,
    s.statut,
    s.usage_users,
    p.max_users,
    s.usage_admins,
    p.max_admins,
    s.usage_missions_mois_actuel AS usage_missions,
    p.max_missions_par_mois AS max_missions,
    p.max_techniciens
  FROM subscriptions s
  JOIN plans p ON p.id = s.plan_id
  WHERE s.entreprise_id = entreprise_uuid
  AND s.statut IN ('essai', 'actif')
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_subscription_for_entreprise IS 'Récupère l''abonnement actif d''une entreprise avec limites du plan';

-- ============================================================================
-- FONCTION 3 : get_current_usage()
-- Description : Compter le nombre actuel d'utilisateurs/admins d'un tenant
-- ============================================================================

CREATE OR REPLACE FUNCTION get_current_usage(
  tenant_type TEXT, -- 'regie' ou 'entreprise'
  tenant_id UUID,
  usage_type TEXT DEFAULT 'users' -- 'users' ou 'admins'
)
RETURNS INTEGER AS $$
DECLARE
  count_result INTEGER;
BEGIN
  IF tenant_type = 'regie' THEN
    IF usage_type = 'users' THEN
      -- Compter tous les profiles de la régie (sauf DEMO)
      SELECT COUNT(*) INTO count_result
      FROM profiles
      WHERE regie_id = tenant_id
      AND is_demo = false;
      
    ELSIF usage_type = 'admins' THEN
      -- Compter uniquement les admins (role = 'regie')
      SELECT COUNT(*) INTO count_result
      FROM profiles
      WHERE regie_id = tenant_id
      AND role = 'regie'
      AND is_demo = false;
    END IF;
    
  ELSIF tenant_type = 'entreprise' THEN
    IF usage_type = 'users' THEN
      -- Compter tous les profiles de l'entreprise
      SELECT COUNT(*) INTO count_result
      FROM profiles
      WHERE entreprise_id = tenant_id
      AND is_demo = false;
      
    ELSIF usage_type = 'admins' THEN
      -- Compter uniquement les admins (role = 'entreprise')
      SELECT COUNT(*) INTO count_result
      FROM profiles
      WHERE entreprise_id = tenant_id
      AND role = 'entreprise'
      AND is_demo = false;
    END IF;
  END IF;
  
  RETURN COALESCE(count_result, 0);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_current_usage IS 'Compte le nombre actuel d''utilisateurs ou admins d''un tenant (régie/entreprise)';

-- ============================================================================
-- FONCTION 4 : can_add_user()
-- Description : Vérifier si un nouveau user peut être ajouté (quota non atteint)
-- ============================================================================

CREATE OR REPLACE FUNCTION can_add_user(
  tenant_type TEXT, -- 'regie' ou 'entreprise'
  tenant_id UUID,
  user_role TEXT -- 'regie', 'entreprise', 'locataire', 'technicien'
)
RETURNS BOOLEAN AS $$
DECLARE
  subscription_record RECORD;
  current_users INTEGER;
  current_admins INTEGER;
  max_users_limit INTEGER;
  max_admins_limit INTEGER;
  is_admin_role BOOLEAN;
BEGIN
  -- Récupérer l'abonnement
  IF tenant_type = 'regie' THEN
    SELECT * INTO subscription_record
    FROM get_subscription_for_regie(tenant_id)
    LIMIT 1;
  ELSIF tenant_type = 'entreprise' THEN
    SELECT * INTO subscription_record
    FROM get_subscription_for_entreprise(tenant_id)
    LIMIT 1;
  ELSE
    RETURN false; -- Type tenant invalide
  END IF;
  
  -- Si pas d'abonnement actif, bloquer
  IF subscription_record IS NULL THEN
    RETURN false;
  END IF;
  
  -- Récupérer limites
  max_users_limit := subscription_record.max_users;
  max_admins_limit := subscription_record.max_admins;
  
  -- Compter usage actuel
  current_users := get_current_usage(tenant_type, tenant_id, 'users');
  current_admins := get_current_usage(tenant_type, tenant_id, 'admins');
  
  -- Déterminer si le rôle est admin
  is_admin_role := (user_role IN ('regie', 'entreprise'));
  
  -- Vérifier limite admins si c'est un admin
  IF is_admin_role THEN
    IF max_admins_limit IS NOT NULL AND current_admins >= max_admins_limit THEN
      RETURN false; -- Quota admins atteint
    END IF;
  END IF;
  
  -- Vérifier limite users globale
  IF max_users_limit IS NOT NULL AND current_users >= max_users_limit THEN
    RETURN false; -- Quota users atteint
  END IF;
  
  RETURN true; -- Ajout autorisé
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION can_add_user IS 'Vérifie si un nouvel utilisateur peut être ajouté sans dépasser les quotas du plan';

-- ============================================================================
-- FONCTION 5 : get_quota_status()
-- Description : Récupérer l'état des quotas d'un tenant (pour dashboard)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_quota_status(
  tenant_type TEXT, -- 'regie' ou 'entreprise'
  tenant_id UUID
)
RETURNS JSON AS $$
DECLARE
  subscription_record RECORD;
  current_users INTEGER;
  current_admins INTEGER;
  current_logements INTEGER;
  result JSON;
BEGIN
  -- Récupérer abonnement
  IF tenant_type = 'regie' THEN
    SELECT * INTO subscription_record
    FROM get_subscription_for_regie(tenant_id)
    LIMIT 1;
    
    -- Compter logements
    SELECT COUNT(*) INTO current_logements
    FROM logements
    WHERE immeuble_id IN (
      SELECT id FROM immeubles WHERE regie_id = tenant_id
    );
    
  ELSIF tenant_type = 'entreprise' THEN
    SELECT * INTO subscription_record
    FROM get_subscription_for_entreprise(tenant_id)
    LIMIT 1;
    
    current_logements := 0; -- Pas applicable pour entreprises
  ELSE
    RETURN NULL;
  END IF;
  
  IF subscription_record IS NULL THEN
    RETURN json_build_object('error', 'Aucun abonnement actif');
  END IF;
  
  -- Compter users/admins
  current_users := get_current_usage(tenant_type, tenant_id, 'users');
  current_admins := get_current_usage(tenant_type, tenant_id, 'admins');
  
  -- Construire JSON résultat
  result := json_build_object(
    'plan', json_build_object(
      'nom', subscription_record.plan_nom,
      'statut', subscription_record.statut
    ),
    'users', json_build_object(
      'actuel', current_users,
      'limite', subscription_record.max_users,
      'pourcentage', CASE 
        WHEN subscription_record.max_users IS NULL THEN NULL
        ELSE ROUND((current_users::float / subscription_record.max_users * 100)::numeric, 1)
      END,
      'disponible', CASE 
        WHEN subscription_record.max_users IS NULL THEN NULL
        ELSE subscription_record.max_users - current_users
      END
    ),
    'admins', json_build_object(
      'actuel', current_admins,
      'limite', subscription_record.max_admins,
      'disponible', CASE 
        WHEN subscription_record.max_admins IS NULL THEN NULL
        ELSE subscription_record.max_admins - current_admins
      END
    ),
    'logements', CASE WHEN tenant_type = 'regie' THEN
      json_build_object(
        'actuel', current_logements,
        'limite', subscription_record.max_logements,
        'pourcentage', CASE 
          WHEN subscription_record.max_logements IS NULL THEN NULL
          ELSE ROUND((current_logements::float / subscription_record.max_logements * 100)::numeric, 1)
        END,
        'disponible', CASE 
          WHEN subscription_record.max_logements IS NULL THEN NULL
          ELSE subscription_record.max_logements - current_logements
        END
      )
    ELSE NULL END
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_quota_status IS 'Récupère l''état complet des quotas d''un tenant (format JSON pour API)';

-- ============================================================================
-- VUE 1 : regie_quota_overview
-- Description : Vue pour dashboard admin avec tous les quotas
-- ============================================================================

CREATE OR REPLACE VIEW regie_quota_overview AS
SELECT 
  r.id AS regie_id,
  r.nom AS regie_nom,
  p.nom AS plan_nom,
  s.statut AS subscription_statut,
  
  -- Users
  (SELECT get_current_usage('regie', r.id, 'users')) AS users_actifs,
  p.max_users AS users_limite,
  CASE 
    WHEN p.max_users IS NULL THEN '∞'
    ELSE (SELECT get_current_usage('regie', r.id, 'users'))::text || '/' || p.max_users::text
  END AS users_display,
  
  -- Admins
  (SELECT get_current_usage('regie', r.id, 'admins')) AS admins_actifs,
  p.max_admins AS admins_limite,
  
  -- Logements
  (SELECT COUNT(*) FROM logements l 
   WHERE l.immeuble_id IN (SELECT id FROM immeubles WHERE regie_id = r.id)
  ) AS logements_actifs,
  p.max_logements AS logements_limite,
  CASE 
    WHEN p.max_logements IS NULL THEN '∞'
    ELSE (
      SELECT COUNT(*) FROM logements l 
      WHERE l.immeuble_id IN (SELECT id FROM immeubles WHERE regie_id = r.id)
    )::text || '/' || p.max_logements::text
  END AS logements_display,
  
  -- Entreprises partenaires
  (SELECT COUNT(DISTINCT e.id) FROM entreprises e WHERE e.regie_id = r.id) AS entreprises_actives,
  p.max_entreprises_partenaires AS entreprises_limite,
  
  -- Dates
  s.date_debut,
  s.date_fin,
  s.date_fin_essai

FROM regies r
LEFT JOIN subscriptions s ON s.regie_id = r.id AND s.statut IN ('essai', 'actif')
LEFT JOIN plans p ON p.id = s.plan_id
ORDER BY r.nom;

COMMENT ON VIEW regie_quota_overview IS 'Vue complète des quotas de toutes les régies (pour dashboard admin)';

-- ============================================================================
-- TESTS & EXEMPLES D'UTILISATION
-- ============================================================================

-- Exemple 1 : Vérifier si une régie peut ajouter un utilisateur
-- SELECT can_add_user('regie', '<regie_uuid>', 'locataire');

-- Exemple 2 : Récupérer l'état des quotas d'une régie
-- SELECT get_quota_status('regie', '<regie_uuid>');

-- Exemple 3 : Voir tous les quotas des régies
-- SELECT * FROM regie_quota_overview;

-- Exemple 4 : Récupérer l'abonnement d'une régie
-- SELECT * FROM get_subscription_for_regie('<regie_uuid>');

-- ============================================================================
-- VÉRIFICATIONS POST-MIGRATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Fonctions helper créées :';
  RAISE NOTICE '  - get_subscription_for_regie()';
  RAISE NOTICE '  - get_subscription_for_entreprise()';
  RAISE NOTICE '  - get_current_usage()';
  RAISE NOTICE '  - can_add_user()';
  RAISE NOTICE '  - get_quota_status()';
  RAISE NOTICE '✓ Vue créée : regie_quota_overview';
  RAISE NOTICE '✓ Migration 03_saas_subscription_helpers.sql terminée';
END $$;
