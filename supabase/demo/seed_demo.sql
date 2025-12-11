-- ============================================================================
-- Fichier : seed_demo.sql
-- Description : Données de démonstration pour tester le système
-- ============================================================================

-- Ce fichier sera complété progressivement selon les étapes
-- Contenu prévu :
--   - Comptes utilisateurs DEMO (locataire, régie, entreprise, technicien, admin)
--   - 1 régie DEMO avec ses paramètres
--   - 2-3 entreprises DEMO
--   - 3-5 techniciens DEMO
--   - Immeubles et logements fictifs
--   - Locataires fictifs
--   - Tickets d'exemple (ouverts, en cours, terminés)
--   - Missions d'exemple avec différents statuts
--   - Messages et notifications de test

-- Note : Toutes les données DEMO auront is_demo = true

-- ============================================================================
-- ÉTAPE 0 : Compte Admin JTEC pour les tests
-- ============================================================================

-- Ce compte sera créé manuellement dans Supabase Auth
-- puis lié via la table profiles

-- Exemple de structure (à exécuter après création du compte Auth) :
/*
INSERT INTO profiles (id, role, email, nom, prenom, is_demo)
VALUES (
  'UUID-DU-USER-AUTH', -- Remplacer par l'UUID réel
  'admin_jtec',
  'admin@jetc-demo.com',
  'Admin',
  'JTEC',
  true
);
*/

-- Note : Les données complètes seront ajoutées lors des étapes suivantes
