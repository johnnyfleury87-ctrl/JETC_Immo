-- ============================================================================
-- Script de migration complète - JETC_Immo
-- Exécuter ce fichier complet dans l'éditeur SQL Supabase
-- Durée estimée: 2-3 minutes
-- ============================================================================

-- ============================================================================
-- PARTIE 1/7 : INITIALISATION
-- ============================================================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Créer le schéma public si nécessaire
CREATE SCHEMA IF NOT EXISTS public;

-- ============================================================================
-- PARTIE 2/7 : TABLES (Copier depuis 01_tables.sql)
-- ============================================================================

-- Note: Copier ici le contenu COMPLET de supabase/schema/01_tables.sql
-- Trop long pour être inclus ici, utiliser le fichier directement

-- ============================================================================
-- PARTIE 3/7 : RELATIONS (Copier depuis 02_relations.sql)
-- ============================================================================

-- Note: Copier ici le contenu de supabase/schema/02_relations.sql

-- ============================================================================
-- PARTIE 4/7 : VUES SQL (Copier depuis 03_views.sql)
-- ============================================================================

-- Note: Copier ici le contenu de supabase/schema/03_views.sql

-- ============================================================================
-- PARTIE 5/7 : FONCTIONS (Copier depuis 04_functions.sql)
-- ============================================================================

-- Note: Copier ici le contenu de supabase/schema/04_functions.sql

-- ============================================================================
-- PARTIE 6/7 : TRIGGERS (Copier depuis 05_triggers.sql)
-- ============================================================================

-- Note: Copier ici le contenu de supabase/schema/05_triggers.sql

-- ============================================================================
-- PARTIE 7/7 : VÉRIFICATION
-- ============================================================================

-- Vérifier les tables créées
SELECT 
  table_name,
  (SELECT COUNT(*) 
   FROM information_schema.columns 
   WHERE table_schema = 'public' 
   AND table_name = t.table_name) as nb_colonnes
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;

-- Devrait retourner 17 tables

-- Vérifier les foreign keys
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- Vérifier les vues
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public';

-- Devrait retourner 9 vues

-- Vérifier les fonctions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION';

-- ============================================================================
-- INSTRUCTIONS APRÈS EXÉCUTION:
-- ============================================================================
-- 
-- 1. Exécuter tous les fichiers de politiques RLS:
--    - supabase/policies/10_policies_profiles.sql
--    - supabase/policies/11_policies_regies.sql
--    - ... (jusqu'à 26_policies_logs_activite.sql)
--
-- 2. Configurer Storage:
--    - supabase/storage/storage_buckets.sql
--
-- 3. (Optionnel) Charger les données de démo:
--    - supabase/demo/seed_demo.sql
--
-- ============================================================================
