-- ============================================================================
-- Migration : 05_adhesion_requests.sql
-- Date : 2025-12-13
-- Description : Table pour demandes d'adhésion (validation manuelle JETC)
-- Dépendances : 01_plans_update_chf.sql, 02_saas_owner_tracking.sql
-- ============================================================================

-- ============================================================================
-- TABLE : adhesion_requests
-- Description : Demandes d'adhésion en attente de validation par admin JETC
-- ============================================================================

CREATE TABLE IF NOT EXISTS adhesion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Plan demandé
  plan_requested TEXT NOT NULL CHECK (plan_requested IN ('Essentiel', 'Pro', 'Premium')),
  
  -- Informations régie
  regie_name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT DEFAULT 'Suisse',
  siret TEXT, -- Optionnel lors de la demande
  
  -- Estimations taille
  logements_estimes INTEGER NOT NULL CHECK (logements_estimes >= 0),
  nb_admins_estimes INTEGER DEFAULT 1 CHECK (nb_admins_estimes >= 1),
  nb_users_estimes INTEGER DEFAULT 1 CHECK (nb_users_estimes >= 1),
  nb_entreprises_estimees INTEGER DEFAULT 0,
  
  -- Contact principal (futur owner admin)
  owner_firstname TEXT NOT NULL,
  owner_lastname TEXT NOT NULL,
  owner_email TEXT NOT NULL UNIQUE, -- Email unique pour éviter doublons
  owner_phone TEXT,
  
  -- Mode de gestion locataires
  locataires_import_mode TEXT DEFAULT 'later' CHECK (
    locataires_import_mode IN ('csv', 'assisted', 'later')
  ),
  
  -- Notes / motivations (optionnel)
  motivation TEXT,
  
  -- Statut validation
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'rejected', 'cancelled')
  ),
  
  -- Tracking validation
  validated_at TIMESTAMP WITH TIME ZONE,
  validated_by UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Admin JETC qui valide
  rejection_reason TEXT, -- Si rejeté, raison
  
  -- Entités créées après validation
  created_regie_id UUID REFERENCES regies(id) ON DELETE SET NULL,
  created_subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  created_owner_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEX pour performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_adhesion_requests_status ON adhesion_requests(status);
CREATE INDEX IF NOT EXISTS idx_adhesion_requests_plan_requested ON adhesion_requests(plan_requested);
CREATE INDEX IF NOT EXISTS idx_adhesion_requests_owner_email ON adhesion_requests(owner_email);
CREATE INDEX IF NOT EXISTS idx_adhesion_requests_created_at ON adhesion_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_adhesion_requests_validated_by ON adhesion_requests(validated_by);

-- ============================================================================
-- COMMENTAIRES
-- ============================================================================

COMMENT ON TABLE adhesion_requests IS 'Demandes d''adhésion en attente de validation par admin JETC';
COMMENT ON COLUMN adhesion_requests.plan_requested IS 'Plan souhaité : Essentiel (49 CHF), Pro (99 CHF), Premium (199 CHF)';
COMMENT ON COLUMN adhesion_requests.status IS 'pending = en attente, approved = validé + accès créés, rejected = refusé, cancelled = annulé par demandeur';
COMMENT ON COLUMN adhesion_requests.locataires_import_mode IS 'csv = import fichier, assisted = assistance JETC, later = ajout manuel plus tard';
COMMENT ON COLUMN adhesion_requests.validated_by IS 'ID du profile admin JETC qui a validé/rejeté la demande';
COMMENT ON COLUMN adhesion_requests.created_regie_id IS 'ID de la régie créée après validation (NULL si pending/rejected)';

-- ============================================================================
-- RLS : Sécurité
-- ============================================================================

ALTER TABLE adhesion_requests ENABLE ROW LEVEL SECURITY;

-- Policy 1 : Seul admin JETC peut voir toutes les demandes
CREATE POLICY "admin_jtec_view_all_adhesion_requests"
ON adhesion_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin_jtec'
  )
);

-- Policy 2 : Seul admin JETC peut modifier les demandes (validation/rejet)
CREATE POLICY "admin_jtec_update_adhesion_requests"
ON adhesion_requests FOR UPDATE
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

-- Policy 3 : Insertion publique (formulaire non authentifié)
-- ⚠️ IMPORTANT : Aucun auth.uid() requis pour permettre soumission publique
CREATE POLICY "public_insert_adhesion_request"
ON adhesion_requests FOR INSERT
WITH CHECK (true); -- Toujours autoriser insertion

-- Policy 4 : Suppression réservée admin JETC
CREATE POLICY "admin_jtec_delete_adhesion_requests"
ON adhesion_requests FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin_jtec'
  )
);

-- ============================================================================
-- TRIGGER : update updated_at automatiquement
-- ============================================================================

CREATE TRIGGER update_adhesion_requests_updated_at
BEFORE UPDATE ON adhesion_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FONCTION : validate_adhesion_request()
-- Description : Valider une demande et créer régie + owner + subscription
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_adhesion_request(
  request_id UUID,
  admin_id UUID
)
RETURNS JSON AS $$
DECLARE
  request_record RECORD;
  new_regie_id UUID;
  new_subscription_id UUID;
  new_owner_profile_id UUID;
  plan_record RECORD;
  result JSON;
BEGIN
  -- Récupérer la demande
  SELECT * INTO request_record
  FROM adhesion_requests
  WHERE id = request_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Demande introuvable');
  END IF;
  
  -- Vérifier statut
  IF request_record.status != 'pending' THEN
    RETURN json_build_object('success', false, 'error', 'Demande déjà traitée');
  END IF;
  
  -- Récupérer le plan demandé
  SELECT * INTO plan_record
  FROM plans
  WHERE nom = request_record.plan_requested
  AND est_actif = true
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Plan introuvable ou inactif');
  END IF;
  
  -- 1. CRÉER LA RÉGIE
  INSERT INTO regies (
    nom, ville, email, telephone,
    nom_responsable, prenom_responsable, email_responsable, telephone_responsable,
    plan_id, subscription_actif, is_demo
  )
  VALUES (
    request_record.regie_name,
    request_record.city,
    request_record.owner_email,
    request_record.owner_phone,
    request_record.owner_lastname,
    request_record.owner_firstname,
    request_record.owner_email,
    request_record.owner_phone,
    plan_record.id,
    true,
    false -- PROD, pas DEMO
  )
  RETURNING id INTO new_regie_id;
  
  -- 2. CRÉER LA SUBSCRIPTION
  INSERT INTO subscriptions (
    regie_id,
    plan_id,
    statut,
    date_debut,
    date_fin_essai,
    date_prochain_paiement,
    frequence_paiement,
    montant_facture,
    usage_users,
    usage_admins,
    is_demo
  )
  VALUES (
    new_regie_id,
    plan_record.id,
    'essai', -- Débute en période d'essai
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '14 days', -- 14 jours d'essai
    CURRENT_DATE + INTERVAL '14 days',
    'mensuel',
    plan_record.prix_mensuel,
    1, -- Owner = 1er user
    1, -- Owner = 1er admin
    false
  )
  RETURNING id INTO new_subscription_id;
  
  -- 3. CRÉER LE USER AUTH SUPABASE (via auth.users)
  -- ⚠️ IMPORTANT : Utiliser Supabase Admin API côté backend pour créer user
  -- Cette fonction ne peut pas créer directement dans auth.users
  -- Il faut passer par le backend Node.js avec supabase.auth.admin.createUser()
  
  -- Pour l'instant, créer un UUID fictif (sera remplacé par vrai auth.users.id plus tard)
  new_owner_profile_id := gen_random_uuid();
  
  -- 4. CRÉER LE PROFILE OWNER (is_owner = true)
  -- Note : L'INSERT va échouer si on n'a pas créé le user auth avant
  -- Solution : Backend Node.js fera :
  --   1. supabase.auth.admin.createUser({ email, password: null }) → get auth_id
  --   2. INSERT INTO profiles (id=auth_id, ...)
  
  -- Marquer comme "en cours de création" dans la demande
  UPDATE adhesion_requests
  SET 
    status = 'approved',
    validated_at = NOW(),
    validated_by = admin_id,
    created_regie_id = new_regie_id,
    created_subscription_id = new_subscription_id,
    updated_at = NOW()
  WHERE id = request_id;
  
  -- Retourner résultat
  result := json_build_object(
    'success', true,
    'regie_id', new_regie_id,
    'subscription_id', new_subscription_id,
    'plan_nom', plan_record.nom,
    'owner_email', request_record.owner_email,
    'message', 'Régie et abonnement créés. Owner doit être créé via backend avec auth.admin.createUser()'
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION validate_adhesion_request IS 'Valide une demande d''adhésion et crée régie + subscription (owner profile créé via backend)';

-- ============================================================================
-- FONCTION : reject_adhesion_request()
-- Description : Rejeter une demande avec raison
-- ============================================================================

CREATE OR REPLACE FUNCTION reject_adhesion_request(
  request_id UUID,
  admin_id UUID,
  reason TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  request_record RECORD;
BEGIN
  -- Récupérer la demande
  SELECT * INTO request_record
  FROM adhesion_requests
  WHERE id = request_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Demande introuvable');
  END IF;
  
  -- Vérifier statut
  IF request_record.status != 'pending' THEN
    RETURN json_build_object('success', false, 'error', 'Demande déjà traitée');
  END IF;
  
  -- Marquer comme rejetée
  UPDATE adhesion_requests
  SET 
    status = 'rejected',
    validated_at = NOW(),
    validated_by = admin_id,
    rejection_reason = reason,
    updated_at = NOW()
  WHERE id = request_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Demande rejetée',
    'owner_email', request_record.owner_email
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION reject_adhesion_request IS 'Rejette une demande d''adhésion avec raison optionnelle';

-- ============================================================================
-- VUE : adhesion_requests_summary (pour dashboard admin JETC)
-- ============================================================================

CREATE OR REPLACE VIEW adhesion_requests_summary AS
SELECT 
  ar.id,
  ar.regie_name,
  ar.city,
  ar.country,
  ar.plan_requested,
  ar.logements_estimes,
  ar.owner_firstname || ' ' || ar.owner_lastname AS owner_name,
  ar.owner_email,
  ar.owner_phone,
  ar.status,
  ar.created_at,
  ar.validated_at,
  p.nom || ' ' || p.prenom AS validated_by_name,
  ar.rejection_reason,
  
  -- Infos plan demandé
  pl.prix_mensuel AS plan_prix,
  pl.max_logements AS plan_max_logements,
  pl.max_users AS plan_max_users,
  
  -- Stats estimations vs limites plan
  CASE 
    WHEN pl.max_logements IS NOT NULL AND ar.logements_estimes > pl.max_logements THEN true
    ELSE false
  END AS over_logements_limit,
  
  CASE 
    WHEN pl.max_users IS NOT NULL AND ar.nb_users_estimes > pl.max_users THEN true
    ELSE false
  END AS over_users_limit
  
FROM adhesion_requests ar
LEFT JOIN profiles p ON p.id = ar.validated_by
LEFT JOIN plans pl ON pl.nom = ar.plan_requested
ORDER BY 
  CASE ar.status
    WHEN 'pending' THEN 1
    WHEN 'approved' THEN 2
    WHEN 'rejected' THEN 3
    WHEN 'cancelled' THEN 4
  END,
  ar.created_at DESC;

COMMENT ON VIEW adhesion_requests_summary IS 'Vue résumée des demandes d''adhésion pour dashboard admin JETC';

-- ============================================================================
-- VÉRIFICATIONS POST-MIGRATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Table adhesion_requests créée';
  RAISE NOTICE '✓ Policies RLS configurées (public INSERT, admin JETC SELECT/UPDATE/DELETE)';
  RAISE NOTICE '✓ Fonctions créées :';
  RAISE NOTICE '  - validate_adhesion_request(request_id, admin_id)';
  RAISE NOTICE '  - reject_adhesion_request(request_id, admin_id, reason)';
  RAISE NOTICE '✓ Vue adhesion_requests_summary créée';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT : Backend doit créer auth.users via supabase.auth.admin.createUser()';
  RAISE NOTICE '✓ Migration 05_adhesion_requests.sql terminée';
END $$;
