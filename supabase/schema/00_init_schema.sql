-- ============================================================================
-- Fichier : 00_init_schema.sql
-- Description : Initialisation du schéma et activation de RLS
-- ============================================================================

-- Activation des extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Note : Par défaut, nous utilisons le schéma public
-- Pour séparer DEMO et PRO, deux options :
--   OPTION A : Créer un schéma 'demo' séparé
--   OPTION B : Utiliser une colonne 'is_demo' dans chaque table

-- Activation de Row Level Security (RLS) sur toutes les tables
-- Les politiques RLS seront définies dans les fichiers /policies/*.sql

-- Configuration pour le mode DEMO/PRO
-- Les tables devront inclure une colonne is_demo BOOLEAN DEFAULT false
-- Les policies RLS devront filtrer selon cette colonne

-- Fonction utilitaire pour obtenir le mode actuel
CREATE OR REPLACE FUNCTION get_app_mode()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.mode', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'demo';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaire : Les tables seront créées dans 01_tables.sql
