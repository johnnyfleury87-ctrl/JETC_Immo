-- ================================================================
-- DIAGNOSTIC RLS + POLICIES - Supabase
-- ================================================================
-- À exécuter dans l'éditeur SQL Supabase pour diagnostiquer
-- les problèmes d'accès profiles causant des 500
-- ================================================================

-- 1) RLS activée sur les tables ?
-- ================================================================
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2) Liste toutes les policies par table
-- ================================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as using_expression,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3) Grants sur la table profiles
-- ================================================================
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY grantee, privilege_type;

-- 4) Structure de la table profiles (vérifier colonne role)
-- ================================================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 5) Test d'accès au profil de l'utilisateur connecté
-- ================================================================
-- IMPORTANT : Exécuter cette requête EN ÉTANT CONNECTÉ (pas en mode service_role)
-- Elle doit retourner VOTRE profil si RLS fonctionne
SELECT 
    id,
    email,
    role,
    prenom,
    nom,
    created_at
FROM profiles
WHERE id = auth.uid();

-- 6) Compter les profils accessibles (doit être >= 1 pour user connecté)
-- ================================================================
SELECT 
    COUNT(*) as accessible_profiles,
    auth.uid() as current_user_id
FROM profiles;

-- 7) Vérifier les policies profiles (détail)
-- ================================================================
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

-- 8) Tester si admin_jtec role existe dans les profiles
-- ================================================================
SELECT 
    role,
    COUNT(*) as count
FROM profiles
WHERE role = 'admin_jtec'
GROUP BY role;

-- ================================================================
-- RÉSULTATS ATTENDUS
-- ================================================================
-- 1) RLS doit être TRUE sur profiles
-- 2) Au moins une policy "Select own profile" ou similaire
-- 3) Grants: anon et authenticated doivent avoir SELECT
-- 4) Colonne 'role' doit exister (type text ou varchar)
-- 5) Le SELECT auth.uid() doit retourner VOTRE profile
-- 6) Count >= 1 si vous êtes connecté
-- 7) Au moins 1 admin_jtec doit exister
-- ================================================================

-- SI PROBLÈME DÉTECTÉ :
-- ================================================================
-- A) RLS = FALSE → Activer :
--    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
--
-- B) Pas de policy Select → Créer :
--    CREATE POLICY "Users can view own profile"
--    ON profiles FOR SELECT
--    USING (auth.uid() = id);
--
-- C) Colonne role manquante → Ajouter :
--    ALTER TABLE profiles ADD COLUMN role text;
--
-- D) Pas d'admin_jtec → Créer manuellement via Supabase Dashboard
-- ================================================================
