-- ============================================================================
-- Script : create_admin_jetc.sql
-- Description : Création de l'utilisateur admin JETC (johnny.fleury87@gmail.com)
-- Date : 2025-12-14
-- ============================================================================
-- 
-- ⚠️ IMPORTANT : Ce script doit être exécuté avec les privilèges postgres
-- dans le Supabase SQL Editor.
--
-- PRÉREQUIS :
-- L'utilisateur DOIT DÉJÀ EXISTER dans auth.users (créé via magic link).
-- Pour créer l'utilisateur :
--   1. Supabase Dashboard → Authentication → Users → Invite User
--   2. Email : johnny.fleury87@gmail.com
--   3. Cliquez sur "Invite User"
--
-- Ce script crée uniquement le profile admin_jtec.
-- ============================================================================

DO $$
DECLARE
  admin_user_id UUID;
  existing_profile_id UUID;
BEGIN
  -- ============================================================================
  -- ÉTAPE 1 : Vérifier que l'utilisateur existe dans auth.users
  -- ============================================================================
  
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'johnny.fleury87@gmail.com';
  
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION '
    ❌ ERREUR : Utilisateur non trouvé dans auth.users
    
    ➡️  ACTION REQUISE :
    1. Allez dans Supabase Dashboard
    2. Authentication → Users → Invite User
    3. Email : johnny.fleury87@gmail.com
    4. Cliquez sur "Invite User"
    5. Attendez de recevoir le magic link
    6. Cliquez sur le lien pour activer le compte
    7. Relancez ce script
    ';
  END IF;
  
  RAISE NOTICE '✓ Utilisateur trouvé dans auth.users : %', admin_user_id;
  
  -- ============================================================================
  -- ÉTAPE 2 : Vérifier si un profile existe déjà
  -- ============================================================================
  
  SELECT id INTO existing_profile_id
  FROM profiles
  WHERE id = admin_user_id;
  
  IF existing_profile_id IS NOT NULL THEN
    -- Profile existe déjà, on le met à jour vers admin_jtec
    RAISE NOTICE 'ℹ️  Profile existant détecté, mise à jour vers admin_jtec...';
    
    UPDATE profiles
    SET 
      role = 'admin_jtec',
      prenom = 'Johnny',
      nom = 'Fleury',
      regie_id = NULL,
      entreprise_id = NULL,
      is_demo = false,
      updated_at = NOW()
    WHERE id = admin_user_id;
    
    RAISE NOTICE '✓ Profile mis à jour vers admin_jtec';
    
  ELSE
    -- ============================================================================
    -- ÉTAPE 3 : Créer le profile admin_jtec
    -- ============================================================================
    -- 
    -- ⚠️ GESTION DU TRIGGER handle_new_user()
    -- Le trigger on_auth_user_created crée automatiquement un profile 'locataire'
    -- lors de l'insertion dans auth.users. Comme nous créons l'utilisateur 
    -- AVANT via l'interface (magic link), le trigger a déjà créé un profile.
    -- Si ce n'est pas le cas, nous créons le profile manuellement.
    -- 
    -- La contrainte check_role_consistency autorise :
    --   - role = 'admin_jtec' (sans regie_id ni entreprise_id)
    -- ============================================================================
    
    RAISE NOTICE 'ℹ️  Aucun profile existant, création du profile admin_jtec...';
    
    INSERT INTO profiles (
      id,
      email,
      prenom,
      nom,
      role,
      regie_id,
      entreprise_id,
      is_demo,
      created_at,
      updated_at
    )
    VALUES (
      admin_user_id,
      'johnny.fleury87@gmail.com',
      'Johnny',
      'Fleury',
      'admin_jtec',
      NULL,  -- admin_jtec n'appartient à aucune régie
      NULL,  -- admin_jtec n'appartient à aucune entreprise
      false, -- Pas un compte démo
      NOW(),
      NOW()
    );
    
    RAISE NOTICE '✓ Profile admin_jtec créé avec succès';
  END IF;
  
  -- ============================================================================
  -- ÉTAPE 4 : Vérification finale
  -- ============================================================================
  
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ ADMIN JETC CRÉÉ AVEC SUCCÈS';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Détails du compte :';
  RAISE NOTICE '   Email       : johnny.fleury87@gmail.com';
  RAISE NOTICE '   UUID        : %', admin_user_id;
  RAISE NOTICE '   Rôle        : admin_jtec';
  RAISE NOTICE '   Prénom      : Johnny';
  RAISE NOTICE '   Nom         : Fleury';
  RAISE NOTICE '   Is Demo     : false';
  RAISE NOTICE '   Regie ID    : NULL';
  RAISE NOTICE '   Entreprise  : NULL';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 CONNEXION :';
  RAISE NOTICE '   1. Allez sur votre application';
  RAISE NOTICE '   2. Cliquez sur le magic link reçu par email';
  RAISE NOTICE '   3. Vous serez redirigé vers /admin/jetc';
  RAISE NOTICE '';
  RAISE NOTICE '🛡️  PROTECTIONS EN PLACE :';
  RAISE NOTICE '   ✓ Accès autorisé   : /admin/jetc';
  RAISE NOTICE '   ✗ Accès refusé     : /locataire/*';
  RAISE NOTICE '   ✗ Accès refusé     : /regie/*';
  RAISE NOTICE '   ✗ Accès refusé     : /entreprise/*';
  RAISE NOTICE '   ✗ Accès refusé     : /technicien/*';
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  
END $$;

-- ============================================================================
-- VÉRIFICATION : Afficher le profile créé
-- ============================================================================

SELECT 
  id,
  email,
  prenom,
  nom,
  role,
  regie_id,
  entreprise_id,
  is_demo,
  created_at
FROM profiles
WHERE email = 'johnny.fleury87@gmail.com';

-- ============================================================================
-- NOTES IMPORTANTES
-- ============================================================================
--
-- 1. TRIGGER handle_new_user()
--    Le trigger on_auth_user_created insère automatiquement un profile 
--    'locataire' lors de la création d'un utilisateur dans auth.users.
--    Cela peut causer un conflit avec la contrainte check_role_consistency.
--    
--    SOLUTION : Ce script met à jour le profile après création pour le
--    convertir en admin_jtec, ce qui respecte la contrainte.
--
-- 2. CONTRAINTE check_role_consistency
--    Cette contrainte vérifie que :
--    - admin_jtec : aucune liaison requise (OK ✓)
--    - locataire/regie : regie_id requis
--    - entreprise/technicien : entreprise_id requis
--
-- 3. REDIRECTION AUTOMATIQUE
--    Le fichier lib/auth.js redirige automatiquement admin_jtec vers /admin/jetc
--
-- 4. PROTECTIONS DES ROUTES
--    Les pages client utilisent requireRole() qui bloque admin_jtec :
--    - pages/locataire/*.js : requireRole(['locataire'])
--    - pages/regie/*.js : requireRole(['regie'])
--    - pages/entreprise/*.js : requireRole(['entreprise'])
--    - pages/technicien/*.js : requireRole(['technicien'])
--
-- 5. ACCÈS ADMIN
--    La page /admin/jetc vérifie :
--    if (profile.role !== 'admin_jtec') { redirect('/') }
--
-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
