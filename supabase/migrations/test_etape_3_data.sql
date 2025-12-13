-- ============================================================================
-- Script de test : Préparation ÉTAPE 3
-- Date : 2025-12-13
-- Description : Créer admin_jtec et données de test pour dashboard
-- ============================================================================

-- ============================================================================
-- 1. CRÉER UN ADMIN JETC (si n'existe pas)
-- ============================================================================

-- ⚠️ PRÉREQUIS : Vous devez avoir créé un user dans Supabase Auth Dashboard
--    ou avoir un compte existant dont vous voulez changer le rôle

-- Option A : Modifier un compte existant
-- Remplacez 'VOTRE_EMAIL@example.com' par votre vrai email

UPDATE profiles 
SET role = 'admin_jtec'
WHERE email = 'VOTRE_EMAIL@example.com';

-- Vérifier
SELECT id, email, nom, prenom, role 
FROM profiles 
WHERE role = 'admin_jtec';

-- Résultat attendu : 1 ligne avec votre email et role = 'admin_jtec'

-- ============================================================================
-- 2. CRÉER DES DEMANDES DE TEST
-- ============================================================================

-- Demande 1 : En attente (pending)
INSERT INTO adhesion_requests (
  plan_requested,
  regie_name,
  city,
  country,
  logements_estimes,
  nb_admins_estimes,
  nb_users_estimes,
  nb_entreprises_estimees,
  owner_firstname,
  owner_lastname,
  owner_email,
  owner_phone,
  locataires_import_mode,
  motivation,
  status
) VALUES (
  'Pro',
  'Régie Test SA',
  'Genève',
  'Suisse',
  50,
  1,
  3,
  10,
  'Jean',
  'Dupont',
  'jean.dupont.test@example.com',
  '+41 22 123 45 67',
  'later',
  'Je souhaite moderniser la gestion de mes interventions',
  'pending'
);

-- Demande 2 : En attente (pending) avec estimations dépassant les limites
INSERT INTO adhesion_requests (
  plan_requested,
  regie_name,
  city,
  country,
  logements_estimes,
  nb_admins_estimes,
  nb_users_estimes,
  owner_firstname,
  owner_lastname,
  owner_email,
  owner_phone,
  motivation,
  status
) VALUES (
  'Essentiel',
  'Petite Régie SARL',
  'Lausanne',
  'Suisse',
  30, -- ⚠️ Dépasse la limite Essentiel (25 logements)
  1,
  5, -- ⚠️ Dépasse la limite Essentiel (2 users)
  'Marie',
  'Martin',
  'marie.martin.test@example.com',
  '+41 21 987 65 43',
  'Besoin d''une solution simple et efficace',
  'pending'
);

-- Demande 3 : En attente (pending) - Plan Premium
INSERT INTO adhesion_requests (
  plan_requested,
  regie_name,
  city,
  country,
  logements_estimes,
  nb_admins_estimes,
  nb_users_estimes,
  nb_entreprises_estimees,
  owner_firstname,
  owner_lastname,
  owner_email,
  owner_phone,
  locataires_import_mode,
  motivation,
  status
) VALUES (
  'Premium',
  'Grande Régie Immobilière SA',
  'Zurich',
  'Suisse',
  500,
  5,
  15,
  50,
  'Pierre',
  'Müller',
  'pierre.muller.test@example.com',
  '+41 44 123 45 67',
  'csv',
  'Gestion de portefeuille important, besoin de toutes les fonctionnalités',
  'pending'
);

-- Demande 4 : Validée (approved) - SIMULER une validation passée
-- ⚠️ Cette demande est fictive (pas de vraie régie créée)
INSERT INTO adhesion_requests (
  plan_requested,
  regie_name,
  city,
  country,
  logements_estimes,
  nb_admins_estimes,
  nb_users_estimes,
  owner_firstname,
  owner_lastname,
  owner_email,
  owner_phone,
  status,
  validated_at,
  validated_by,
  created_regie_id,
  created_subscription_id,
  created_owner_profile_id
) VALUES (
  'Pro',
  'Régie Validée SA',
  'Fribourg',
  'Suisse',
  80,
  2,
  4,
  'Sophie',
  'Bernard',
  'sophie.bernard.test@example.com',
  '+41 26 555 66 77',
  'approved',
  NOW() - INTERVAL '2 days', -- Validée il y a 2 jours
  (SELECT id FROM profiles WHERE role = 'admin_jtec' LIMIT 1), -- Admin qui a validé
  gen_random_uuid(), -- Fake regie_id
  gen_random_uuid(), -- Fake subscription_id
  gen_random_uuid()  -- Fake owner_profile_id
);

-- Demande 5 : Rejetée (rejected)
INSERT INTO adhesion_requests (
  plan_requested,
  regie_name,
  city,
  country,
  logements_estimes,
  nb_admins_estimes,
  nb_users_estimes,
  owner_firstname,
  owner_lastname,
  owner_email,
  owner_phone,
  motivation,
  status,
  validated_at,
  validated_by,
  rejection_reason
) VALUES (
  'Essentiel',
  'Régie Rejetée SARL',
  'Neuchâtel',
  'Suisse',
  10,
  1,
  2,
  'Luc',
  'Favre',
  'luc.favre.test@example.com',
  '+41 32 888 99 00',
  'Informations incomplètes dans la demande',
  'rejected',
  NOW() - INTERVAL '1 day', -- Rejetée hier
  (SELECT id FROM profiles WHERE role = 'admin_jtec' LIMIT 1),
  'Informations de contact incomplètes. Merci de nous recontacter avec votre SIRET et coordonnées bancaires.'
);

-- Demande 6 : En attente (pending) - Sans motivation
INSERT INTO adhesion_requests (
  plan_requested,
  regie_name,
  city,
  country,
  logements_estimes,
  nb_admins_estimes,
  nb_users_estimes,
  owner_firstname,
  owner_lastname,
  owner_email,
  owner_phone,
  status
) VALUES (
  'Pro',
  'Régie Express SA',
  'Vaud',
  'Suisse',
  100,
  1,
  5,
  'Thomas',
  'Roux',
  'thomas.roux.test@example.com',
  '+41 79 111 22 33',
  'pending'
);

-- ============================================================================
-- 3. VÉRIFIER LES DONNÉES INSÉRÉES
-- ============================================================================

-- Compter par statut
SELECT 
  status,
  COUNT(*) AS nombre
FROM adhesion_requests
GROUP BY status
ORDER BY 
  CASE status
    WHEN 'pending' THEN 1
    WHEN 'approved' THEN 2
    WHEN 'rejected' THEN 3
  END;

-- Résultat attendu :
-- status   | nombre
-- ---------|-------
-- pending  | 4
-- approved | 1
-- rejected | 1

-- ============================================================================
-- 4. VÉRIFIER LA VUE SUMMARY
-- ============================================================================

SELECT 
  id,
  regie_name,
  city,
  plan_requested,
  owner_name,
  owner_email,
  status,
  TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI') AS date_demande,
  validated_by_name,
  over_logements_limit,
  over_users_limit
FROM adhesion_requests_summary
ORDER BY created_at DESC;

-- Vérifier :
-- ✅ owner_name = prénom + nom
-- ✅ validated_by_name rempli pour approved/rejected
-- ✅ over_logements_limit = true pour "Petite Régie SARL" (30 > 25)
-- ✅ over_users_limit = true pour "Petite Régie SARL" (5 > 2)

-- ============================================================================
-- 5. TESTER LES RLS POLICIES
-- ============================================================================

-- Simuler requête frontend (en tant qu'admin_jtec)
-- ⚠️ Remplacer par votre vrai UUID admin
SET LOCAL jwt.claims.sub = 'VOTRE_UUID_ADMIN_JTEC';

-- Cette requête doit fonctionner (admin_jtec peut SELECT)
SELECT COUNT(*) FROM adhesion_requests;

-- Cette requête doit fonctionner (via la vue)
SELECT COUNT(*) FROM adhesion_requests_summary;

-- ============================================================================
-- 6. NETTOYER LES DONNÉES DE TEST (OPTIONNEL)
-- ============================================================================

-- ⚠️ À exécuter UNIQUEMENT si vous voulez supprimer toutes les demandes de test

-- DELETE FROM adhesion_requests 
-- WHERE owner_email LIKE '%.test@example.com';

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Admin JETC créé (ou modifié)';
  RAISE NOTICE '✓ 6 demandes de test insérées :';
  RAISE NOTICE '  - 4 pending (dont 1 avec limites dépassées)';
  RAISE NOTICE '  - 1 approved';
  RAISE NOTICE '  - 1 rejected';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Étape 3 prête à être testée !';
  RAISE NOTICE '   Connectez-vous avec le compte admin_jtec et allez sur /admin/jetc';
END $$;
