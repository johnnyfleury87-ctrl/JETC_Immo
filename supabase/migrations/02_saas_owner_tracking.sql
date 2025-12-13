-- ============================================================================
-- Migration : 02_saas_owner_tracking.sql
-- Date : 2025-12-13
-- Description : Ajout colonnes tracking owner/creator pour logique SaaS
-- Dépendances : 01_plans_update_chf.sql
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1 : Ajouter colonnes de tracking dans profiles
-- ============================================================================

-- Colonne : is_owner (identifier le créateur principal du tenant)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_owner BOOLEAN DEFAULT false;

COMMENT ON COLUMN profiles.is_owner IS 'true = owner admin (créateur tenant), false = utilisateur invité';

-- Colonne : created_by (tracking qui a créé/invité ce profil)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN profiles.created_by IS 'ID du profile qui a créé/invité cet utilisateur. NULL pour owner admin';

-- Colonne : invited_at (date d'invitation)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN profiles.invited_at IS 'Date d''invitation de l''utilisateur (peut différer de created_at = acceptation)';

-- ============================================================================
-- ÉTAPE 2 : Créer index pour performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_is_owner ON profiles(is_owner);
CREATE INDEX IF NOT EXISTS idx_profiles_created_by ON profiles(created_by);
CREATE INDEX IF NOT EXISTS idx_profiles_invited_at ON profiles(invited_at);

-- ============================================================================
-- ÉTAPE 3 : Migrer données existantes
-- ============================================================================

-- Identifier le 1er profile de chaque régie comme owner
DO $$
DECLARE
  regie_record RECORD;
  first_profile_id UUID;
BEGIN
  -- Pour chaque régie existante
  FOR regie_record IN SELECT DISTINCT regie_id FROM profiles WHERE regie_id IS NOT NULL AND role = 'regie'
  LOOP
    -- Trouver le 1er profile créé pour cette régie
    SELECT id INTO first_profile_id
    FROM profiles
    WHERE regie_id = regie_record.regie_id
    AND role = 'regie'
    ORDER BY created_at ASC
    LIMIT 1;
    
    -- Marquer comme owner
    IF first_profile_id IS NOT NULL THEN
      UPDATE profiles
      SET is_owner = true,
          invited_at = created_at -- Owner s'est inscrit lui-même
      WHERE id = first_profile_id;
      
      RAISE NOTICE 'Régie % : Owner défini → Profile %', regie_record.regie_id, first_profile_id;
    END IF;
  END LOOP;
  
  RAISE NOTICE '✓ Migration owner admins terminée';
END $$;

-- Identifier le 1er profile de chaque entreprise comme owner
DO $$
DECLARE
  entreprise_record RECORD;
  first_profile_id UUID;
BEGIN
  -- Pour chaque entreprise existante
  FOR entreprise_record IN SELECT DISTINCT entreprise_id FROM profiles WHERE entreprise_id IS NOT NULL AND role = 'entreprise'
  LOOP
    -- Trouver le 1er profile créé pour cette entreprise
    SELECT id INTO first_profile_id
    FROM profiles
    WHERE entreprise_id = entreprise_record.entreprise_id
    AND role = 'entreprise'
    ORDER BY created_at ASC
    LIMIT 1;
    
    -- Marquer comme owner
    IF first_profile_id IS NOT NULL THEN
      UPDATE profiles
      SET is_owner = true,
          invited_at = created_at
      WHERE id = first_profile_id;
      
      RAISE NOTICE 'Entreprise % : Owner défini → Profile %', entreprise_record.entreprise_id, first_profile_id;
    END IF;
  END LOOP;
  
  RAISE NOTICE '✓ Migration owner entreprises terminée';
END $$;

-- Tous les autres profiles = is_owner false
UPDATE profiles
SET is_owner = false
WHERE is_owner IS NULL;

-- Définir invited_at pour profiles existants non-owner (approximation = created_at)
UPDATE profiles
SET invited_at = created_at
WHERE invited_at IS NULL;

-- ============================================================================
-- ÉTAPE 4 : Recalculer usage_users et usage_admins dans subscriptions
-- ============================================================================

-- Pour régies : compter les profiles actifs
UPDATE subscriptions s
SET 
  usage_users = (
    SELECT COUNT(*) 
    FROM profiles p
    WHERE p.regie_id = s.regie_id
    AND p.is_demo = false -- Exclure comptes DEMO
  ),
  usage_admins = (
    SELECT COUNT(*) 
    FROM profiles p
    WHERE p.regie_id = s.regie_id 
    AND p.role = 'regie'
    AND p.is_demo = false
  )
WHERE s.regie_id IS NOT NULL;

-- Pour entreprises : compter les profiles actifs
UPDATE subscriptions s
SET 
  usage_users = (
    SELECT COUNT(*) 
    FROM profiles p
    WHERE p.entreprise_id = s.entreprise_id
    AND p.is_demo = false
  ),
  usage_admins = (
    SELECT COUNT(*) 
    FROM profiles p
    WHERE p.entreprise_id = s.entreprise_id 
    AND p.role = 'entreprise'
    AND p.is_demo = false
  )
WHERE s.entreprise_id IS NOT NULL;

-- ============================================================================
-- ÉTAPE 5 : Créer contrainte is_owner unique par tenant (optionnel mais recommandé)
-- ============================================================================

-- Note : Pour multi-admin Premium, on peut avoir plusieurs is_owner=true
-- Cette contrainte limite à 1 owner par régie SAUF si plan Premium permet multi-admin
-- → On ne crée PAS cette contrainte pour rester flexible

-- À la place, créer une fonction de vérification si besoin
CREATE OR REPLACE FUNCTION check_single_owner_per_tenant()
RETURNS TRIGGER AS $$
DECLARE
  owner_count INTEGER;
  max_admins_limit INTEGER;
BEGIN
  -- Si on essaie de créer un nouvel owner (is_owner = true)
  IF NEW.is_owner = true THEN
    -- Compter les owners existants dans le tenant
    IF NEW.regie_id IS NOT NULL THEN
      SELECT COUNT(*) INTO owner_count
      FROM profiles
      WHERE regie_id = NEW.regie_id
      AND is_owner = true
      AND id != NEW.id; -- Exclure le profile en cours de modification
      
      -- Récupérer la limite max_admins du plan
      SELECT p.max_admins INTO max_admins_limit
      FROM subscriptions s
      JOIN plans p ON p.id = s.plan_id
      WHERE s.regie_id = NEW.regie_id
      AND s.statut IN ('essai', 'actif')
      ORDER BY s.created_at DESC
      LIMIT 1;
      
    ELSIF NEW.entreprise_id IS NOT NULL THEN
      SELECT COUNT(*) INTO owner_count
      FROM profiles
      WHERE entreprise_id = NEW.entreprise_id
      AND is_owner = true
      AND id != NEW.id;
      
      SELECT p.max_admins INTO max_admins_limit
      FROM subscriptions s
      JOIN plans p ON p.id = s.plan_id
      WHERE s.entreprise_id = NEW.entreprise_id
      AND s.statut IN ('essai', 'actif')
      ORDER BY s.created_at DESC
      LIMIT 1;
    END IF;
    
    -- Vérifier la limite max_admins
    IF max_admins_limit IS NOT NULL AND owner_count >= max_admins_limit THEN
      RAISE EXCEPTION 'Limite d''administrateurs atteinte pour ce plan (max: %)', max_admins_limit;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger optionnel (activer si règle stricte 1 owner par tenant souhaitée)
-- CREATE TRIGGER enforce_single_owner
-- BEFORE INSERT OR UPDATE ON profiles
-- FOR EACH ROW
-- WHEN (NEW.is_owner = true)
-- EXECUTE FUNCTION check_single_owner_per_tenant();

-- Note : Désactivé par défaut pour permettre multi-admin Premium
-- À activer manuellement si logique métier impose 1 seul owner

-- ============================================================================
-- VÉRIFICATIONS POST-MIGRATION
-- ============================================================================

-- Vérifier que chaque régie a au moins 1 owner
DO $$
DECLARE
  regies_sans_owner INTEGER;
BEGIN
  SELECT COUNT(DISTINCT r.id) INTO regies_sans_owner
  FROM regies r
  LEFT JOIN profiles p ON p.regie_id = r.id AND p.is_owner = true
  WHERE p.id IS NULL;
  
  IF regies_sans_owner > 0 THEN
    RAISE WARNING 'Attention : % régies sans owner admin', regies_sans_owner;
  ELSE
    RAISE NOTICE '✓ Toutes les régies ont un owner admin';
  END IF;
END $$;

-- Afficher statistiques migration
SELECT 
  'Régies' AS type,
  COUNT(DISTINCT regie_id) AS total_tenants,
  SUM(CASE WHEN is_owner THEN 1 ELSE 0 END) AS owners,
  SUM(CASE WHEN NOT is_owner AND role = 'regie' THEN 1 ELSE 0 END) AS admins_secondaires,
  SUM(CASE WHEN NOT is_owner AND role != 'regie' THEN 1 ELSE 0 END) AS users
FROM profiles
WHERE regie_id IS NOT NULL
UNION ALL
SELECT 
  'Entreprises' AS type,
  COUNT(DISTINCT entreprise_id) AS total_tenants,
  SUM(CASE WHEN is_owner THEN 1 ELSE 0 END) AS owners,
  SUM(CASE WHEN NOT is_owner AND role = 'entreprise' THEN 1 ELSE 0 END) AS admins_secondaires,
  SUM(CASE WHEN NOT is_owner AND role = 'technicien' THEN 1 ELSE 0 END) AS users
FROM profiles
WHERE entreprise_id IS NOT NULL;

-- Vérifier que usage_users/usage_admins correspondent aux profils réels
SELECT 
  s.id AS subscription_id,
  s.regie_id,
  s.usage_users AS compteur_users,
  (SELECT COUNT(*) FROM profiles WHERE regie_id = s.regie_id AND is_demo = false) AS users_reels,
  s.usage_admins AS compteur_admins,
  (SELECT COUNT(*) FROM profiles WHERE regie_id = s.regie_id AND role = 'regie' AND is_demo = false) AS admins_reels
FROM subscriptions s
WHERE s.regie_id IS NOT NULL
LIMIT 10;

RAISE NOTICE '✓ Migration 02_saas_owner_tracking.sql terminée avec succès';
