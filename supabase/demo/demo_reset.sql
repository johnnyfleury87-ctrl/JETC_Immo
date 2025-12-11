-- ============================================================================
-- Fichier : demo_reset.sql
-- Description : Réinitialisation des données DEMO
-- ============================================================================

-- Ce script supprime toutes les données marquées is_demo = true
-- et relance le seed_demo.sql

-- ============================================================================
-- SUPPRESSION DES DONNÉES DEMO
-- ============================================================================

-- Note : L'ordre de suppression doit respecter les contraintes de clés étrangères

-- Supprimer les messages DEMO
DELETE FROM messages WHERE is_demo = true;

-- Supprimer les factures DEMO
DELETE FROM factures WHERE is_demo = true;

-- Supprimer les missions DEMO
DELETE FROM missions WHERE is_demo = true;

-- Supprimer les tickets DEMO
DELETE FROM tickets WHERE is_demo = true;

-- Supprimer les locataires DEMO
DELETE FROM locataires WHERE is_demo = true;

-- Supprimer les logements DEMO
DELETE FROM logements WHERE is_demo = true;

-- Supprimer les immeubles DEMO
DELETE FROM immeubles WHERE is_demo = true;

-- Supprimer les techniciens DEMO
DELETE FROM techniciens WHERE is_demo = true;

-- Supprimer les entreprises DEMO
DELETE FROM entreprises WHERE is_demo = true;

-- Supprimer les régies DEMO
DELETE FROM regies WHERE is_demo = true;

-- Supprimer les profils DEMO (sauf admin_jtec si nécessaire)
DELETE FROM profiles WHERE is_demo = true AND role != 'admin_jtec';

-- ============================================================================
-- RELANCER LE SEED DEMO
-- ============================================================================

-- Exécuter ensuite : \i seed_demo.sql
-- ou via l'interface Supabase

-- Note : Les tables seront créées lors des étapes suivantes
-- Ce fichier sera mis à jour en conséquence
