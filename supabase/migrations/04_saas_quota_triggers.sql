-- ============================================================================
-- Migration : 04_saas_quota_triggers.sql
-- Date : 2025-12-13
-- Description : Triggers automatiques pour vérification quotas et maj compteurs
-- Dépendances : 01_plans_update_chf.sql, 02_saas_owner_tracking.sql, 03_saas_subscription_helpers.sql
-- ============================================================================

-- ============================================================================
-- FONCTION TRIGGER 1 : check_profile_quota_before_insert()
-- Description : Vérifier quotas AVANT insertion d'un nouveau profile
-- ============================================================================

CREATE OR REPLACE FUNCTION check_profile_quota_before_insert()
RETURNS TRIGGER AS $$
DECLARE
  tenant_type TEXT;
  tenant_id UUID;
  user_role TEXT;
  can_add BOOLEAN;
  quota_info JSON;
BEGIN
  -- Bypass vérification pour comptes DEMO
  IF NEW.is_demo = true THEN
    RETURN NEW;
  END IF;
  
  -- Bypass vérification pour admin JTEC
  IF NEW.role = 'admin_jtec' THEN
    RETURN NEW;
  END IF;
  
  -- Déterminer le tenant et le type
  IF NEW.regie_id IS NOT NULL THEN
    tenant_type := 'regie';
    tenant_id := NEW.regie_id;
    user_role := NEW.role;
  ELSIF NEW.entreprise_id IS NOT NULL THEN
    tenant_type := 'entreprise';
    tenant_id := NEW.entreprise_id;
    user_role := NEW.role;
  ELSE
    -- Pas de tenant, probablement erreur de données
    RAISE EXCEPTION 'Profile doit avoir un regie_id ou entreprise_id';
  END IF;
  
  -- Vérifier si ajout autorisé
  can_add := can_add_user(tenant_type, tenant_id, user_role);
  
  IF NOT can_add THEN
    -- Récupérer les quotas pour message d'erreur détaillé
    quota_info := get_quota_status(tenant_type, tenant_id);
    
    RAISE EXCEPTION 'Quota utilisateurs atteint. Plan actuel: %. Limites: % users, % admins. Contactez votre administrateur pour upgrade.',
      quota_info->>'plan',
      COALESCE((quota_info->'users'->>'limite')::text, '∞'),
      COALESCE((quota_info->'admins'->>'limite')::text, '∞')
    USING HINT = 'Supprimez des utilisateurs inactifs ou passez à un plan supérieur';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_profile_quota_before_insert IS 'Vérifie les quotas avant insertion d''un profile (appelée par trigger BEFORE INSERT)';

-- ============================================================================
-- FONCTION TRIGGER 2 : increment_subscription_usage_after_insert()
-- Description : Incrémenter compteurs usage APRÈS insertion profile réussie
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_subscription_usage_after_insert()
RETURNS TRIGGER AS $$
DECLARE
  is_admin_role BOOLEAN;
BEGIN
  -- Bypass pour comptes DEMO
  IF NEW.is_demo = true THEN
    RETURN NEW;
  END IF;
  
  -- Bypass pour admin JTEC
  IF NEW.role = 'admin_jtec' THEN
    RETURN NEW;
  END IF;
  
  -- Déterminer si c'est un rôle admin
  is_admin_role := (NEW.role IN ('regie', 'entreprise'));
  
  -- Incrémenter compteurs dans subscription
  IF NEW.regie_id IS NOT NULL THEN
    UPDATE subscriptions
    SET 
      usage_users = usage_users + 1,
      usage_admins = CASE WHEN is_admin_role THEN usage_admins + 1 ELSE usage_admins END,
      updated_at = NOW()
    WHERE regie_id = NEW.regie_id
    AND statut IN ('essai', 'actif');
    
  ELSIF NEW.entreprise_id IS NOT NULL THEN
    UPDATE subscriptions
    SET 
      usage_users = usage_users + 1,
      usage_admins = CASE WHEN is_admin_role THEN usage_admins + 1 ELSE usage_admins END,
      updated_at = NOW()
    WHERE entreprise_id = NEW.entreprise_id
    AND statut IN ('essai', 'actif');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_subscription_usage_after_insert IS 'Incrémente usage_users/usage_admins dans subscription après création profile';

-- ============================================================================
-- FONCTION TRIGGER 3 : decrement_subscription_usage_after_delete()
-- Description : Décrémenter compteurs usage APRÈS suppression profile
-- ============================================================================

CREATE OR REPLACE FUNCTION decrement_subscription_usage_after_delete()
RETURNS TRIGGER AS $$
DECLARE
  is_admin_role BOOLEAN;
BEGIN
  -- Bypass pour comptes DEMO
  IF OLD.is_demo = true THEN
    RETURN OLD;
  END IF;
  
  -- Bypass pour admin JTEC
  IF OLD.role = 'admin_jtec' THEN
    RETURN OLD;
  END IF;
  
  -- Déterminer si c'était un rôle admin
  is_admin_role := (OLD.role IN ('regie', 'entreprise'));
  
  -- Décrémenter compteurs dans subscription
  IF OLD.regie_id IS NOT NULL THEN
    UPDATE subscriptions
    SET 
      usage_users = GREATEST(usage_users - 1, 0), -- Éviter valeurs négatives
      usage_admins = CASE WHEN is_admin_role THEN GREATEST(usage_admins - 1, 0) ELSE usage_admins END,
      updated_at = NOW()
    WHERE regie_id = OLD.regie_id
    AND statut IN ('essai', 'actif');
    
  ELSIF OLD.entreprise_id IS NOT NULL THEN
    UPDATE subscriptions
    SET 
      usage_users = GREATEST(usage_users - 1, 0),
      usage_admins = CASE WHEN is_admin_role THEN GREATEST(usage_admins - 1, 0) ELSE usage_admins END,
      updated_at = NOW()
    WHERE entreprise_id = OLD.entreprise_id
    AND statut IN ('essai', 'actif');
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION decrement_subscription_usage_after_delete IS 'Décrémente usage_users/usage_admins dans subscription après suppression profile';

-- ============================================================================
-- FONCTION TRIGGER 4 : update_subscription_usage_on_role_change()
-- Description : Ajuster compteurs si changement de rôle (ex: locataire → regie)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_subscription_usage_on_role_change()
RETURNS TRIGGER AS $$
DECLARE
  old_is_admin BOOLEAN;
  new_is_admin BOOLEAN;
BEGIN
  -- Bypass pour comptes DEMO
  IF NEW.is_demo = true THEN
    RETURN NEW;
  END IF;
  
  -- Bypass pour admin JTEC
  IF NEW.role = 'admin_jtec' THEN
    RETURN NEW;
  END IF;
  
  -- Si le rôle n'a pas changé, rien à faire
  IF OLD.role = NEW.role THEN
    RETURN NEW;
  END IF;
  
  old_is_admin := (OLD.role IN ('regie', 'entreprise'));
  new_is_admin := (NEW.role IN ('regie', 'entreprise'));
  
  -- Si passage de non-admin à admin
  IF NOT old_is_admin AND new_is_admin THEN
    IF NEW.regie_id IS NOT NULL THEN
      UPDATE subscriptions
      SET usage_admins = usage_admins + 1, updated_at = NOW()
      WHERE regie_id = NEW.regie_id AND statut IN ('essai', 'actif');
    ELSIF NEW.entreprise_id IS NOT NULL THEN
      UPDATE subscriptions
      SET usage_admins = usage_admins + 1, updated_at = NOW()
      WHERE entreprise_id = NEW.entreprise_id AND statut IN ('essai', 'actif');
    END IF;
    
  -- Si passage de admin à non-admin
  ELSIF old_is_admin AND NOT new_is_admin THEN
    IF NEW.regie_id IS NOT NULL THEN
      UPDATE subscriptions
      SET usage_admins = GREATEST(usage_admins - 1, 0), updated_at = NOW()
      WHERE regie_id = NEW.regie_id AND statut IN ('essai', 'actif');
    ELSIF NEW.entreprise_id IS NOT NULL THEN
      UPDATE subscriptions
      SET usage_admins = GREATEST(usage_admins - 1, 0), updated_at = NOW()
      WHERE entreprise_id = NEW.entreprise_id AND statut IN ('essai', 'actif');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_subscription_usage_on_role_change IS 'Ajuste usage_admins lors d''un changement de rôle (promotion/rétrogradation)';

-- ============================================================================
-- FONCTION TRIGGER 5 : prevent_owner_deletion()
-- Description : Empêcher suppression du dernier owner d'un tenant
-- ============================================================================

CREATE OR REPLACE FUNCTION prevent_owner_deletion()
RETURNS TRIGGER AS $$
DECLARE
  owner_count INTEGER;
BEGIN
  -- Si on supprime un owner
  IF OLD.is_owner = true THEN
    -- Compter les autres owners du même tenant
    IF OLD.regie_id IS NOT NULL THEN
      SELECT COUNT(*) INTO owner_count
      FROM profiles
      WHERE regie_id = OLD.regie_id
      AND is_owner = true
      AND id != OLD.id;
      
      IF owner_count = 0 THEN
        RAISE EXCEPTION 'Impossible de supprimer le dernier administrateur propriétaire de la régie'
        USING HINT = 'Transférez la propriété à un autre utilisateur avant suppression';
      END IF;
      
    ELSIF OLD.entreprise_id IS NOT NULL THEN
      SELECT COUNT(*) INTO owner_count
      FROM profiles
      WHERE entreprise_id = OLD.entreprise_id
      AND is_owner = true
      AND id != OLD.id;
      
      IF owner_count = 0 THEN
        RAISE EXCEPTION 'Impossible de supprimer le dernier administrateur propriétaire de l''entreprise'
        USING HINT = 'Transférez la propriété à un autre utilisateur avant suppression';
      END IF;
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION prevent_owner_deletion IS 'Empêche la suppression du dernier owner d''un tenant (protection orphelin)';

-- ============================================================================
-- CRÉATION DES TRIGGERS
-- ============================================================================

-- Trigger 1 : Vérification quota AVANT insertion
DROP TRIGGER IF EXISTS enforce_quota_before_profile_insert ON profiles;
CREATE TRIGGER enforce_quota_before_profile_insert
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION check_profile_quota_before_insert();

-- Trigger 2 : Incrémentation usage APRÈS insertion
DROP TRIGGER IF EXISTS increment_usage_after_profile_insert ON profiles;
CREATE TRIGGER increment_usage_after_profile_insert
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION increment_subscription_usage_after_insert();

-- Trigger 3 : Décrémentation usage APRÈS suppression
DROP TRIGGER IF EXISTS decrement_usage_after_profile_delete ON profiles;
CREATE TRIGGER decrement_usage_after_profile_delete
AFTER DELETE ON profiles
FOR EACH ROW
EXECUTE FUNCTION decrement_subscription_usage_after_delete();

-- Trigger 4 : Ajustement usage sur changement de rôle
DROP TRIGGER IF EXISTS adjust_usage_on_profile_role_change ON profiles;
CREATE TRIGGER adjust_usage_on_profile_role_change
AFTER UPDATE OF role ON profiles
FOR EACH ROW
WHEN (OLD.role IS DISTINCT FROM NEW.role)
EXECUTE FUNCTION update_subscription_usage_on_role_change();

-- Trigger 5 : Protection suppression dernier owner
DROP TRIGGER IF EXISTS prevent_last_owner_deletion ON profiles;
CREATE TRIGGER prevent_last_owner_deletion
BEFORE DELETE ON profiles
FOR EACH ROW
WHEN (OLD.is_owner = true)
EXECUTE FUNCTION prevent_owner_deletion();

-- ============================================================================
-- FONCTION TRIGGER 6 (OPTIONNEL) : check_logement_quota_before_insert()
-- Description : Vérifier quota logements avant insertion
-- ============================================================================

CREATE OR REPLACE FUNCTION check_logement_quota_before_insert()
RETURNS TRIGGER AS $$
DECLARE
  regie_uuid UUID;
  subscription_info RECORD;
  current_logements INTEGER;
BEGIN
  -- Récupérer la régie via l'immeuble
  SELECT regie_id INTO regie_uuid
  FROM immeubles
  WHERE id = NEW.immeuble_id;
  
  IF regie_uuid IS NULL THEN
    RETURN NEW; -- Pas de régie, laisser passer (erreur de données)
  END IF;
  
  -- Récupérer l'abonnement
  SELECT * INTO subscription_info
  FROM get_subscription_for_regie(regie_uuid)
  LIMIT 1;
  
  IF subscription_info IS NULL THEN
    RAISE EXCEPTION 'Aucun abonnement actif trouvé pour cette régie';
  END IF;
  
  -- Si limite logements NULL = illimité
  IF subscription_info.max_logements IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Compter logements actuels
  SELECT COUNT(*) INTO current_logements
  FROM logements l
  WHERE l.immeuble_id IN (
    SELECT id FROM immeubles WHERE regie_id = regie_uuid
  );
  
  -- Vérifier quota
  IF current_logements >= subscription_info.max_logements THEN
    RAISE EXCEPTION 'Quota de logements atteint (% / %). Passez à un plan supérieur ou supprimez des logements inactifs.',
      current_logements,
      subscription_info.max_logements
    USING HINT = 'Plan actuel: ' || subscription_info.plan_nom;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_logement_quota_before_insert IS 'Vérifie quota max_logements avant insertion (optionnel, activer via trigger)';

-- Trigger optionnel pour logements (décommenter si souhaité)
-- DROP TRIGGER IF EXISTS enforce_logement_quota ON logements;
-- CREATE TRIGGER enforce_logement_quota
-- BEFORE INSERT ON logements
-- FOR EACH ROW
-- EXECUTE FUNCTION check_logement_quota_before_insert();

-- ============================================================================
-- TESTS & EXEMPLES
-- ============================================================================

-- Test 1 : Essayer d'ajouter un user quand quota atteint
-- INSERT INTO profiles (id, role, email, regie_id, is_demo)
-- VALUES (gen_random_uuid(), 'locataire', 'test@example.com', '<regie_uuid>', false);
-- → Doit lever exception si quota atteint

-- Test 2 : Vérifier compteurs après insertion
-- SELECT usage_users, usage_admins FROM subscriptions WHERE regie_id = '<regie_uuid>';

-- Test 3 : Essayer de supprimer le dernier owner
-- DELETE FROM profiles WHERE is_owner = true AND regie_id = '<regie_uuid>';
-- → Doit lever exception si c'est le dernier

-- ============================================================================
-- VÉRIFICATIONS POST-MIGRATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Fonctions trigger créées :';
  RAISE NOTICE '  - check_profile_quota_before_insert()';
  RAISE NOTICE '  - increment_subscription_usage_after_insert()';
  RAISE NOTICE '  - decrement_subscription_usage_after_delete()';
  RAISE NOTICE '  - update_subscription_usage_on_role_change()';
  RAISE NOTICE '  - prevent_owner_deletion()';
  RAISE NOTICE '  - check_logement_quota_before_insert() [OPTIONNEL]';
  RAISE NOTICE '';
  RAISE NOTICE '✓ Triggers actifs sur table profiles :';
  RAISE NOTICE '  - enforce_quota_before_profile_insert (BEFORE INSERT)';
  RAISE NOTICE '  - increment_usage_after_profile_insert (AFTER INSERT)';
  RAISE NOTICE '  - decrement_usage_after_profile_delete (AFTER DELETE)';
  RAISE NOTICE '  - adjust_usage_on_profile_role_change (AFTER UPDATE role)';
  RAISE NOTICE '  - prevent_last_owner_deletion (BEFORE DELETE owner)';
  RAISE NOTICE '';
  RAISE NOTICE '⚡ VÉRIFICATION AUTOMATIQUE QUOTAS ACTIVÉE';
  RAISE NOTICE '✓ Migration 04_saas_quota_triggers.sql terminée';
END $$;
