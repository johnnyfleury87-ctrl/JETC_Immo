-- ============================================================================
-- Fichier : 02_relations.sql
-- Description : Définition des relations entre tables
-- ============================================================================

-- Ce fichier sera complété lors de la création des tables correspondantes
-- Relations prévues :
--   - tickets → locataires → logements → immeubles → régies
--   - missions → tickets / entreprises / techniciens
--   - messages → missions / sender / receiver
--   - factures → missions → entreprises / régies
--   - subscriptions → regies / entreprises → plans

-- ============================================================================
-- ÉTAPE 2 : Relations pour les régies
-- ============================================================================

-- Ajouter la contrainte de clé étrangère pour profiles → regies
ALTER TABLE profiles
  ADD CONSTRAINT fk_profiles_regie
  FOREIGN KEY (regie_id)
  REFERENCES regies(id)
  ON DELETE SET NULL;

-- ============================================================================
-- ÉTAPE 3 : Relations pour les entreprises
-- ============================================================================

-- Ajouter la contrainte de clé étrangère pour profiles → entreprises
ALTER TABLE profiles
  ADD CONSTRAINT fk_profiles_entreprise
  FOREIGN KEY (entreprise_id)
  REFERENCES entreprises(id)
  ON DELETE SET NULL;

-- ============================================================================
-- ÉTAPE 4 : Relations pour les immeubles et logements
-- ============================================================================

-- Ajouter la contrainte de clé étrangère pour immeubles → regies
ALTER TABLE immeubles
  ADD CONSTRAINT fk_immeubles_regie
  FOREIGN KEY (regie_id)
  REFERENCES regies(id)
  ON DELETE CASCADE;

-- Ajouter la contrainte de clé étrangère pour logements → immeubles
ALTER TABLE logements
  ADD CONSTRAINT fk_logements_immeuble
  FOREIGN KEY (immeuble_id)
  REFERENCES immeubles(id)
  ON DELETE CASCADE;

-- ============================================================================
-- ÉTAPE 5 : Relations pour les locataires
-- ============================================================================

-- Ajouter la contrainte de clé étrangère pour locataires → profiles
ALTER TABLE locataires
  ADD CONSTRAINT fk_locataires_profile
  FOREIGN KEY (profile_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- Ajouter la contrainte de clé étrangère pour locataires → logements
ALTER TABLE locataires
  ADD CONSTRAINT fk_locataires_logement
  FOREIGN KEY (logement_id)
  REFERENCES logements(id)
  ON DELETE CASCADE;

-- ============================================================================
-- ÉTAPE 6 : Relations pour les tickets
-- ============================================================================

-- Ajouter la contrainte de clé étrangère pour tickets → locataires
ALTER TABLE tickets
  ADD CONSTRAINT fk_tickets_locataire
  FOREIGN KEY (locataire_id)
  REFERENCES locataires(id)
  ON DELETE CASCADE;

-- Ajouter la contrainte de clé étrangère pour tickets → logements
ALTER TABLE tickets
  ADD CONSTRAINT fk_tickets_logement
  FOREIGN KEY (logement_id)
  REFERENCES logements(id)
  ON DELETE CASCADE;

-- Ajouter la contrainte de clé étrangère pour tickets → regies
ALTER TABLE tickets
  ADD CONSTRAINT fk_tickets_regie
  FOREIGN KEY (regie_id)
  REFERENCES regies(id)
  ON DELETE CASCADE;

-- ============================================================================
-- ÉTAPE 7 : Relations pour les missions
-- ============================================================================

-- Ajouter la contrainte de clé étrangère pour missions → tickets
ALTER TABLE missions
  ADD CONSTRAINT fk_missions_ticket
  FOREIGN KEY (ticket_id)
  REFERENCES tickets(id)
  ON DELETE CASCADE;

-- Ajouter la contrainte de clé étrangère pour missions → entreprises
ALTER TABLE missions
  ADD CONSTRAINT fk_missions_entreprise
  FOREIGN KEY (entreprise_id)
  REFERENCES entreprises(id)
  ON DELETE CASCADE;

-- ============================================================================
-- ÉTAPE 8 : Relations pour les techniciens
-- ============================================================================

-- Ajouter la contrainte de clé étrangère pour missions → techniciens (profiles)
-- Note : Les techniciens sont des profils avec role='technicien' dans la table profiles
ALTER TABLE missions
  ADD CONSTRAINT fk_missions_technicien
  FOREIGN KEY (technicien_id)
  REFERENCES profiles(id)
  ON DELETE SET NULL;

-- ============================================================================
-- ÉTAPE 10 : Relations pour les factures
-- ============================================================================

-- Ajouter la contrainte de clé étrangère pour factures → missions
ALTER TABLE factures
  ADD CONSTRAINT fk_factures_mission
  FOREIGN KEY (mission_id)
  REFERENCES missions(id)
  ON DELETE CASCADE;

-- Ajouter la contrainte de clé étrangère pour factures → entreprises
ALTER TABLE factures
  ADD CONSTRAINT fk_factures_entreprise
  FOREIGN KEY (entreprise_id)
  REFERENCES entreprises(id)
  ON DELETE CASCADE;

-- Ajouter la contrainte de clé étrangère pour factures → regies
ALTER TABLE factures
  ADD CONSTRAINT fk_factures_regie
  FOREIGN KEY (regie_id)
  REFERENCES regies(id)
  ON DELETE CASCADE;

-- Mettre à jour la contrainte pour missions.facture_id
ALTER TABLE missions
  ADD CONSTRAINT fk_missions_facture
  FOREIGN KEY (facture_id)
  REFERENCES factures(id)
  ON DELETE SET NULL;

-- ============================================================================
-- Relations pour la table messages (Étape 11)
-- ============================================================================

-- Ajouter la contrainte de clé étrangère pour messages → profiles (sender)
ALTER TABLE messages
  ADD CONSTRAINT fk_messages_sender
  FOREIGN KEY (sender_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- Ajouter la contrainte de clé étrangère pour messages → profiles (recipient)
ALTER TABLE messages
  ADD CONSTRAINT fk_messages_recipient
  FOREIGN KEY (recipient_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- Ajouter la contrainte de clé étrangère pour messages → tickets (optionnel)
ALTER TABLE messages
  ADD CONSTRAINT fk_messages_ticket
  FOREIGN KEY (ticket_id)
  REFERENCES tickets(id)
  ON DELETE CASCADE;

-- Ajouter la contrainte de clé étrangère pour messages → missions (optionnel)
ALTER TABLE messages
  ADD CONSTRAINT fk_messages_mission
  FOREIGN KEY (mission_id)
  REFERENCES missions(id)
  ON DELETE CASCADE;

-- Ajouter la contrainte de clé étrangère pour messages → factures (optionnel)
ALTER TABLE messages
  ADD CONSTRAINT fk_messages_facture
  FOREIGN KEY (facture_id)
  REFERENCES factures(id)
  ON DELETE CASCADE;

-- Ajouter la contrainte de clé étrangère pour messages → messages (parent, threading)
ALTER TABLE messages
  ADD CONSTRAINT fk_messages_parent
  FOREIGN KEY (parent_message_id)
  REFERENCES messages(id)
  ON DELETE SET NULL;

-- ============================================================================
-- Relations pour la table notifications (Étape 12)
-- ============================================================================

-- Ajouter la contrainte de clé étrangère pour notifications → profiles (user)
ALTER TABLE notifications
  ADD CONSTRAINT fk_notifications_user
  FOREIGN KEY (user_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- Ajouter la contrainte de clé étrangère pour notifications → tickets (optionnel)
ALTER TABLE notifications
  ADD CONSTRAINT fk_notifications_ticket
  FOREIGN KEY (ticket_id)
  REFERENCES tickets(id)
  ON DELETE CASCADE;

-- Ajouter la contrainte de clé étrangère pour notifications → missions (optionnel)
ALTER TABLE notifications
  ADD CONSTRAINT fk_notifications_mission
  FOREIGN KEY (mission_id)
  REFERENCES missions(id)
  ON DELETE CASCADE;

-- Ajouter la contrainte de clé étrangère pour notifications → factures (optionnel)
ALTER TABLE notifications
  ADD CONSTRAINT fk_notifications_facture
  FOREIGN KEY (facture_id)
  REFERENCES factures(id)
  ON DELETE CASCADE;

-- Ajouter la contrainte de clé étrangère pour notifications → messages (optionnel)
ALTER TABLE notifications
  ADD CONSTRAINT fk_notifications_message
  FOREIGN KEY (message_id)
  REFERENCES messages(id)
  ON DELETE CASCADE;

-- ============================================================================
-- Relations pour les tables plans et subscriptions (Étape 13)
-- ============================================================================

-- Ajouter la contrainte de clé étrangère pour subscriptions → plans
ALTER TABLE subscriptions
  ADD CONSTRAINT fk_subscriptions_plan
  FOREIGN KEY (plan_id)
  REFERENCES plans(id)
  ON DELETE RESTRICT; -- Empêche la suppression d'un plan utilisé

-- Ajouter la contrainte de clé étrangère pour subscriptions → regies (optionnel)
ALTER TABLE subscriptions
  ADD CONSTRAINT fk_subscriptions_regie
  FOREIGN KEY (regie_id)
  REFERENCES regies(id)
  ON DELETE CASCADE;

-- Ajouter la contrainte de clé étrangère pour subscriptions → entreprises (optionnel)
ALTER TABLE subscriptions
  ADD CONSTRAINT fk_subscriptions_entreprise
  FOREIGN KEY (entreprise_id)
  REFERENCES entreprises(id)
  ON DELETE CASCADE;

-- Mettre à jour la contrainte pour regies.plan_id
ALTER TABLE regies
  ADD CONSTRAINT fk_regies_plan
  FOREIGN KEY (plan_id)
  REFERENCES plans(id)
  ON DELETE SET NULL;

-- Mettre à jour la contrainte pour entreprises.plan_id
ALTER TABLE entreprises
  ADD CONSTRAINT fk_entreprises_plan
  FOREIGN KEY (plan_id)
  REFERENCES plans(id)
  ON DELETE SET NULL;

-- Note : Les autres relations seront ajoutées progressivement selon les étapes
