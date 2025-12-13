-- ============================================================================
-- Migration : 01_plans_update_chf.sql
-- Date : 2025-12-13
-- Description : Adaptation des plans pour les nouveaux tarifs CHF
-- ============================================================================

-- ÉTAPE 1 : Ajouter les colonnes manquantes pour les limites utilisateurs
-- ============================================================================

-- Ajouter max_users (nombre total d'utilisateurs par entité)
ALTER TABLE plans
ADD COLUMN IF NOT EXISTS max_users INTEGER;

-- Ajouter max_admins (nombre d'administrateurs autorisés)
ALTER TABLE plans
ADD COLUMN IF NOT EXISTS max_admins INTEGER DEFAULT 1;

COMMENT ON COLUMN plans.max_users IS 'Nombre maximum d''utilisateurs autorisés (tous rôles confondus). NULL = illimité';
COMMENT ON COLUMN plans.max_admins IS 'Nombre maximum d''administrateurs. NULL = illimité, 1 par défaut';

-- ÉTAPE 2 : Mettre à jour la devise par défaut (EUR → CHF)
-- ============================================================================

ALTER TABLE plans
ALTER COLUMN devise SET DEFAULT 'CHF';

COMMENT ON COLUMN plans.devise IS 'Devise du plan : CHF par défaut, EUR supporté si international';

-- ÉTAPE 3 : Ajouter colonnes usage pour tracking utilisateurs
-- ============================================================================

ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS usage_users INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS usage_admins INTEGER DEFAULT 1;

COMMENT ON COLUMN subscriptions.usage_users IS 'Nombre d''utilisateurs actifs dans l''abonnement';
COMMENT ON COLUMN subscriptions.usage_admins IS 'Nombre d''administrateurs actifs';

-- ÉTAPE 4 : Créer/Mettre à jour les plans selon les nouveaux tarifs
-- ============================================================================

-- Désactiver les anciens plans (si existants)
UPDATE plans
SET est_actif = false,
    est_visible = false,
    updated_at = NOW()
WHERE nom NOT IN ('Essentiel', 'Pro', 'Premium');

-- Insérer/Mettre à jour : Plan ESSENTIEL (49 CHF)
INSERT INTO plans (
  nom, description, type_entite,
  prix_mensuel, prix_annuel, devise,
  periode_essai_jours,
  max_logements, max_users, max_admins, max_entreprises_partenaires,
  max_immeubles, max_locataires,
  max_tickets_par_mois, max_missions_par_mois,
  max_techniciens, max_stockage_mb,
  est_actif, est_visible, ordre_affichage
)
VALUES (
  'Essentiel',
  'Plan de démarrage idéal pour les petites structures',
  'regie', -- Destiné aux régies
  49.00,
  490.00, -- 10 mois payés pour 12 (2 mois offerts)
  'CHF',
  14, -- 14 jours d'essai
  25, -- max_logements
  2,  -- max_users (1 admin + 2 utilisateurs max selon spec)
  1,  -- max_admins (1 compte admin)
  5,  -- max_entreprises_partenaires
  NULL, -- max_immeubles (non limité explicitement, mais limité par logements)
  NULL, -- max_locataires (non spécifié)
  50,  -- max_tickets_par_mois
  NULL, -- max_missions_par_mois (non applicable pour régies)
  NULL, -- max_techniciens (non applicable pour régies)
  1000, -- max_stockage_mb (1 GB)
  true, -- est_actif
  true, -- est_visible
  1     -- ordre_affichage
)
ON CONFLICT (nom) DO UPDATE SET
  description = EXCLUDED.description,
  prix_mensuel = EXCLUDED.prix_mensuel,
  prix_annuel = EXCLUDED.prix_annuel,
  devise = EXCLUDED.devise,
  periode_essai_jours = EXCLUDED.periode_essai_jours,
  max_logements = EXCLUDED.max_logements,
  max_users = EXCLUDED.max_users,
  max_admins = EXCLUDED.max_admins,
  max_entreprises_partenaires = EXCLUDED.max_entreprises_partenaires,
  max_tickets_par_mois = EXCLUDED.max_tickets_par_mois,
  max_stockage_mb = EXCLUDED.max_stockage_mb,
  est_actif = EXCLUDED.est_actif,
  est_visible = EXCLUDED.est_visible,
  ordre_affichage = EXCLUDED.ordre_affichage,
  updated_at = NOW();

-- Insérer/Mettre à jour : Plan PRO (99 CHF)
INSERT INTO plans (
  nom, description, type_entite,
  prix_mensuel, prix_annuel, devise,
  periode_essai_jours,
  max_logements, max_users, max_admins, max_entreprises_partenaires,
  max_immeubles, max_locataires,
  max_tickets_par_mois, max_missions_par_mois,
  max_techniciens, max_stockage_mb,
  module_facturation, module_planning, module_reporting,
  est_actif, est_visible, ordre_affichage
)
VALUES (
  'Pro',
  'Plan professionnel pour structures en croissance',
  'regie',
  99.00,
  990.00, -- 10 mois payés pour 12
  'CHF',
  14, -- 14 jours d'essai
  150, -- max_logements
  5,   -- max_users (1 admin + 5 utilisateurs max)
  1,   -- max_admins (1 compte admin)
  NULL, -- max_entreprises_partenaires (illimité)
  NULL, -- max_immeubles
  NULL, -- max_locataires
  200, -- max_tickets_par_mois
  NULL, -- max_missions_par_mois
  NULL, -- max_techniciens
  5000, -- max_stockage_mb (5 GB)
  true, -- module_facturation
  true, -- module_planning
  true, -- module_reporting
  true, -- est_actif
  true, -- est_visible
  2     -- ordre_affichage
)
ON CONFLICT (nom) DO UPDATE SET
  description = EXCLUDED.description,
  prix_mensuel = EXCLUDED.prix_mensuel,
  prix_annuel = EXCLUDED.prix_annuel,
  devise = EXCLUDED.devise,
  periode_essai_jours = EXCLUDED.periode_essai_jours,
  max_logements = EXCLUDED.max_logements,
  max_users = EXCLUDED.max_users,
  max_admins = EXCLUDED.max_admins,
  max_entreprises_partenaires = EXCLUDED.max_entreprises_partenaires,
  max_tickets_par_mois = EXCLUDED.max_tickets_par_mois,
  max_stockage_mb = EXCLUDED.max_stockage_mb,
  module_facturation = EXCLUDED.module_facturation,
  module_planning = EXCLUDED.module_planning,
  module_reporting = EXCLUDED.module_reporting,
  est_actif = EXCLUDED.est_actif,
  est_visible = EXCLUDED.est_visible,
  ordre_affichage = EXCLUDED.ordre_affichage,
  updated_at = NOW();

-- Insérer/Mettre à jour : Plan PREMIUM (199 CHF)
INSERT INTO plans (
  nom, description, type_entite,
  prix_mensuel, prix_annuel, devise,
  periode_essai_jours,
  max_logements, max_users, max_admins, max_entreprises_partenaires,
  max_immeubles, max_locataires,
  max_tickets_par_mois, max_missions_par_mois,
  max_techniciens, max_stockage_mb,
  module_facturation, module_planning, module_reporting, module_api,
  est_actif, est_visible, ordre_affichage
)
VALUES (
  'Premium',
  'Plan sans limites pour grandes structures',
  'regie',
  199.00,
  1990.00, -- 10 mois payés pour 12
  'CHF',
  14, -- 14 jours d'essai
  NULL, -- max_logements (illimité)
  NULL, -- max_users (illimité)
  NULL, -- max_admins (multi-admin illimité)
  NULL, -- max_entreprises_partenaires (illimité)
  NULL, -- max_immeubles (illimité)
  NULL, -- max_locataires (illimité)
  NULL, -- max_tickets_par_mois (illimité)
  NULL, -- max_missions_par_mois (illimité)
  NULL, -- max_techniciens (illimité)
  20000, -- max_stockage_mb (20 GB)
  true, -- module_facturation
  true, -- module_planning
  true, -- module_reporting
  true, -- module_api
  true, -- est_actif
  true, -- est_visible
  3     -- ordre_affichage
)
ON CONFLICT (nom) DO UPDATE SET
  description = EXCLUDED.description,
  prix_mensuel = EXCLUDED.prix_mensuel,
  prix_annuel = EXCLUDED.prix_annuel,
  devise = EXCLUDED.devise,
  periode_essai_jours = EXCLUDED.periode_essai_jours,
  max_logements = EXCLUDED.max_logements,
  max_users = EXCLUDED.max_users,
  max_admins = EXCLUDED.max_admins,
  max_entreprises_partenaires = EXCLUDED.max_entreprises_partenaires,
  max_tickets_par_mois = EXCLUDED.max_tickets_par_mois,
  max_stockage_mb = EXCLUDED.max_stockage_mb,
  module_facturation = EXCLUDED.module_facturation,
  module_planning = EXCLUDED.module_planning,
  module_reporting = EXCLUDED.module_reporting,
  module_api = EXCLUDED.module_api,
  est_actif = EXCLUDED.est_actif,
  est_visible = EXCLUDED.est_visible,
  ordre_affichage = EXCLUDED.ordre_affichage,
  updated_at = NOW();

-- ============================================================================
-- ÉTAPE 5 : Mettre à jour la fonction check_plan_limit pour inclure users/admins
-- ============================================================================

CREATE OR REPLACE FUNCTION check_plan_limit(
  subscription_uuid UUID,
  limit_type TEXT,
  increment INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  sub_record RECORD;
  plan_record RECORD;
  current_usage INTEGER;
  plan_limit INTEGER;
BEGIN
  -- Récupérer l'abonnement
  SELECT * INTO sub_record FROM subscriptions WHERE id = subscription_uuid;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Récupérer le plan
  SELECT * INTO plan_record FROM plans WHERE id = sub_record.plan_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Vérifier selon le type de limite
  CASE limit_type
    WHEN 'users' THEN
      current_usage := sub_record.usage_users;
      plan_limit := plan_record.max_users;
    WHEN 'admins' THEN
      current_usage := sub_record.usage_admins;
      plan_limit := plan_record.max_admins;
    WHEN 'immeubles' THEN
      current_usage := sub_record.usage_immeubles;
      plan_limit := plan_record.max_immeubles;
    WHEN 'logements' THEN
      current_usage := sub_record.usage_logements;
      plan_limit := plan_record.max_logements;
    WHEN 'locataires' THEN
      current_usage := sub_record.usage_locataires;
      plan_limit := plan_record.max_locataires;
    WHEN 'tickets' THEN
      current_usage := sub_record.usage_tickets_mois_actuel;
      plan_limit := plan_record.max_tickets_par_mois;
    WHEN 'missions' THEN
      current_usage := sub_record.usage_missions_mois_actuel;
      plan_limit := plan_record.max_missions_par_mois;
    WHEN 'techniciens' THEN
      -- Compter directement dans la table profiles
      SELECT COUNT(*) INTO current_usage 
      FROM profiles 
      WHERE entreprise_id = sub_record.entreprise_id 
      AND role = 'technicien';
      plan_limit := plan_record.max_techniciens;
    WHEN 'entreprises_partenaires' THEN
      -- Compter les entreprises liées à la régie
      SELECT COUNT(DISTINCT e.id) INTO current_usage
      FROM entreprises e
      WHERE e.regie_id = sub_record.regie_id;
      plan_limit := plan_record.max_entreprises_partenaires;
    ELSE
      RETURN false;
  END CASE;
  
  -- NULL signifie illimité
  IF plan_limit IS NULL THEN
    RETURN true;
  END IF;
  
  -- Vérifier si on peut incrémenter
  RETURN (current_usage + increment) <= plan_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_plan_limit IS 'Vérifie si une limite du plan est atteinte. Retourne true si action autorisée, false sinon.';

-- ============================================================================
-- ÉTAPE 6 : Créer des index pour performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_usage_users ON subscriptions(usage_users);
CREATE INDEX IF NOT EXISTS idx_subscriptions_usage_admins ON subscriptions(usage_admins);

-- ============================================================================
-- VÉRIFICATIONS POST-MIGRATION
-- ============================================================================

-- Vérifier que les plans ont bien été créés/mis à jour
DO $$
DECLARE
  plan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO plan_count FROM plans WHERE nom IN ('Essentiel', 'Pro', 'Premium') AND est_actif = true;
  
  IF plan_count < 3 THEN
    RAISE WARNING 'Attention : moins de 3 plans actifs trouvés (trouvés: %)', plan_count;
  ELSE
    RAISE NOTICE '✓ Migration réussie : % plans actifs (Essentiel, Pro, Premium)', plan_count;
  END IF;
END $$;

-- Afficher les plans créés
SELECT 
  nom, 
  prix_mensuel || ' ' || devise AS prix,
  max_logements AS logements,
  max_users AS users,
  max_admins AS admins,
  max_entreprises_partenaires AS entreprises,
  est_actif,
  est_visible
FROM plans
WHERE est_actif = true
ORDER BY ordre_affichage;
