-- ============================================================================
-- Fichier : 01_tables.sql
-- Description : Définition de toutes les tables métier
-- ============================================================================

-- Ce fichier sera complété lors des étapes suivantes
-- Tables prévues :
--   - profiles (utilisateurs avec rôles)
--   - regies
--   - entreprises
--   - techniciens
--   - immeubles
--   - logements
--   - locataires
--   - tickets
--   - missions
--   - factures
--   - messages
--   - materiel + tables pivot
--   - plans
--   - subscriptions
--   - notifications

-- Structure minimale pour commencer (sera complétée à l'étape 1)

-- ============================================================================
-- Table : profiles
-- Description : Profils utilisateurs avec rôles et liaison Supabase Auth
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('locataire', 'regie', 'entreprise', 'technicien', 'admin_jtec')),
  email TEXT NOT NULL UNIQUE,
  nom TEXT,
  prenom TEXT,
  telephone TEXT,
  adresse TEXT,
  code_postal TEXT,
  ville TEXT,
  
  -- Liaisons aux entités métier (selon le rôle)
  regie_id UUID, -- Si role = 'regie' ou 'locataire'
  entreprise_id UUID, -- Si role = 'entreprise' ou 'technicien'
  
  -- Métadonnées
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index pour améliorer les performances
  CONSTRAINT check_role_consistency CHECK (
    (role = 'admin_jtec') OR
    (role IN ('regie', 'locataire') AND regie_id IS NOT NULL) OR
    (role IN ('entreprise', 'technicien') AND entreprise_id IS NOT NULL)
  )
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_regie_id ON profiles(regie_id);
CREATE INDEX IF NOT EXISTS idx_profiles_entreprise_id ON profiles(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_demo ON profiles(is_demo);

-- Activation de RLS sur la table profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table : regies
-- Description : Régies immobilières
-- ============================================================================

CREATE TABLE IF NOT EXISTS regies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL,
  siret TEXT UNIQUE,
  email TEXT NOT NULL,
  telephone TEXT,
  adresse TEXT,
  code_postal TEXT,
  ville TEXT,
  
  -- Informations de contact
  nom_responsable TEXT,
  prenom_responsable TEXT,
  telephone_responsable TEXT,
  email_responsable TEXT,
  
  -- Abonnement et modules
  plan_id UUID, -- Lien vers la table plans (à créer plus tard)
  subscription_actif BOOLEAN DEFAULT true,
  date_fin_abonnement TIMESTAMP WITH TIME ZONE,
  
  -- Métadonnées
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_regies_is_demo ON regies(is_demo);
CREATE INDEX IF NOT EXISTS idx_regies_plan_id ON regies(plan_id);

-- Activation de RLS sur la table regies
ALTER TABLE regies ENABLE ROW LEVEL SECURITY;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_regies_updated_at
  BEFORE UPDATE ON regies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table : entreprises
-- Description : Entreprises prestataires de services
-- ============================================================================

CREATE TABLE IF NOT EXISTS entreprises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL,
  siret TEXT UNIQUE,
  email TEXT NOT NULL,
  telephone TEXT,
  adresse TEXT,
  code_postal TEXT,
  ville TEXT,
  
  -- Informations de contact
  nom_responsable TEXT,
  prenom_responsable TEXT,
  telephone_responsable TEXT,
  email_responsable TEXT,
  
  -- Spécialités et compétences
  specialites TEXT[], -- ['plomberie', 'électricité', 'serrurerie', etc.]
  rayon_intervention_km INTEGER DEFAULT 50,
  
  -- Abonnement et modules
  plan_id UUID, -- Lien vers la table plans (à créer plus tard)
  subscription_actif BOOLEAN DEFAULT true,
  date_fin_abonnement TIMESTAMP WITH TIME ZONE,
  
  -- Métadonnées
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_entreprises_is_demo ON entreprises(is_demo);
CREATE INDEX IF NOT EXISTS idx_entreprises_plan_id ON entreprises(plan_id);
CREATE INDEX IF NOT EXISTS idx_entreprises_specialites ON entreprises USING GIN (specialites);

-- Activation de RLS sur la table entreprises
ALTER TABLE entreprises ENABLE ROW LEVEL SECURITY;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_entreprises_updated_at
  BEFORE UPDATE ON entreprises
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table : immeubles
-- Description : Immeubles gérés par les régies
-- ============================================================================

CREATE TABLE IF NOT EXISTS immeubles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  regie_id UUID NOT NULL,
  
  -- Informations de l'immeuble
  nom TEXT, -- Nom ou désignation de l'immeuble
  adresse TEXT NOT NULL,
  code_postal TEXT NOT NULL,
  ville TEXT NOT NULL,
  nombre_etages INTEGER,
  annee_construction INTEGER,
  
  -- Métadonnées
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_immeubles_regie_id ON immeubles(regie_id);
CREATE INDEX IF NOT EXISTS idx_immeubles_is_demo ON immeubles(is_demo);
CREATE INDEX IF NOT EXISTS idx_immeubles_code_postal ON immeubles(code_postal);

-- Activation de RLS sur la table immeubles
ALTER TABLE immeubles ENABLE ROW LEVEL SECURITY;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_immeubles_updated_at
  BEFORE UPDATE ON immeubles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table : logements
-- Description : Logements dans les immeubles
-- ============================================================================

CREATE TABLE IF NOT EXISTS logements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  immeuble_id UUID NOT NULL,
  
  -- Informations du logement
  numero TEXT NOT NULL, -- Ex: "Apt 12", "Rez-de-chaussée droite", "Étage 3 - Porte A"
  etage INTEGER,
  superficie_m2 NUMERIC(6,2),
  nombre_pieces INTEGER,
  type_logement TEXT CHECK (type_logement IN ('studio', 'T1', 'T2', 'T3', 'T4', 'T5+', 'autre')),
  
  -- État et disponibilité
  statut TEXT DEFAULT 'occupé' CHECK (statut IN ('occupé', 'vacant', 'en_travaux', 'hors_service')),
  
  -- Métadonnées
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte d'unicité : un numéro de logement par immeuble
  CONSTRAINT unique_logement_per_immeuble UNIQUE (immeuble_id, numero)
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_logements_immeuble_id ON logements(immeuble_id);
CREATE INDEX IF NOT EXISTS idx_logements_is_demo ON logements(is_demo);
CREATE INDEX IF NOT EXISTS idx_logements_statut ON logements(statut);

-- Activation de RLS sur la table logements
ALTER TABLE logements ENABLE ROW LEVEL SECURITY;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_logements_updated_at
  BEFORE UPDATE ON logements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table : locataires
-- Description : Locataires occupant les logements
-- ============================================================================

CREATE TABLE IF NOT EXISTS locataires (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL UNIQUE, -- Lien vers le profil utilisateur (1-to-1)
  logement_id UUID NOT NULL,
  
  -- Informations du bail
  date_entree DATE,
  date_sortie DATE,
  loyer_mensuel NUMERIC(10,2),
  charges_mensuelles NUMERIC(10,2),
  depot_garantie NUMERIC(10,2),
  
  -- Statut
  statut TEXT DEFAULT 'actif' CHECK (statut IN ('actif', 'en_préavis', 'parti', 'suspendu')),
  
  -- Métadonnées
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_locataires_profile_id ON locataires(profile_id);
CREATE INDEX IF NOT EXISTS idx_locataires_logement_id ON locataires(logement_id);
CREATE INDEX IF NOT EXISTS idx_locataires_is_demo ON locataires(is_demo);
CREATE INDEX IF NOT EXISTS idx_locataires_statut ON locataires(statut);

-- Activation de RLS sur la table locataires
ALTER TABLE locataires ENABLE ROW LEVEL SECURITY;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_locataires_updated_at
  BEFORE UPDATE ON locataires
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table : tickets
-- Description : Tickets de demande d'intervention créés par les locataires
-- ============================================================================

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  locataire_id UUID NOT NULL,
  logement_id UUID NOT NULL,
  regie_id UUID NOT NULL,
  
  -- Informations du ticket
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  categorie TEXT CHECK (categorie IN (
    'plomberie', 'électricité', 'serrurerie', 'chauffage', 
    'vitrerie', 'peinture', 'menuiserie', 'toiture',
    'ascenseur', 'espaces_communs', 'nuisibles', 'autre'
  )),
  
  -- Priorité et statut
  priorite TEXT DEFAULT 'normale' CHECK (priorite IN ('basse', 'normale', 'haute', 'urgente')),
  statut TEXT DEFAULT 'nouveau' CHECK (statut IN (
    'nouveau', 'en_attente_diffusion', 'diffusé', 
    'accepté', 'en_cours', 'terminé', 'annulé', 'refusé'
  )),
  
  -- Mode de diffusion (Étape 6)
  diffusion_mode TEXT DEFAULT 'general' CHECK (diffusion_mode IN ('general', 'restreint')),
  entreprises_autorisees UUID[], -- Liste des entreprises autorisées en mode restreint
  
  -- Dates importantes
  date_souhaitee_intervention DATE,
  date_acceptation TIMESTAMP WITH TIME ZONE,
  date_cloture TIMESTAMP WITH TIME ZONE,
  
  -- Métadonnées
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_tickets_locataire_id ON tickets(locataire_id);
CREATE INDEX IF NOT EXISTS idx_tickets_logement_id ON tickets(logement_id);
CREATE INDEX IF NOT EXISTS idx_tickets_regie_id ON tickets(regie_id);
CREATE INDEX IF NOT EXISTS idx_tickets_statut ON tickets(statut);
CREATE INDEX IF NOT EXISTS idx_tickets_priorite ON tickets(priorite);
CREATE INDEX IF NOT EXISTS idx_tickets_categorie ON tickets(categorie);
CREATE INDEX IF NOT EXISTS idx_tickets_diffusion_mode ON tickets(diffusion_mode);
CREATE INDEX IF NOT EXISTS idx_tickets_entreprises_autorisees ON tickets USING GIN (entreprises_autorisees);
CREATE INDEX IF NOT EXISTS idx_tickets_is_demo ON tickets(is_demo);

-- Activation de RLS sur la table tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table : missions
-- Description : Missions créées par les entreprises après acceptation d'un ticket
-- ============================================================================

CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL UNIQUE, -- Un ticket = une seule mission (empêche les doublons)
  entreprise_id UUID NOT NULL,
  technicien_id UUID, -- Sera assigné lors de l'Étape 8
  
  -- Informations de la mission
  titre TEXT NOT NULL,
  description TEXT,
  
  -- Statut de la mission
  statut TEXT DEFAULT 'en_attente' CHECK (statut IN (
    'en_attente', 'planifiée', 'en_route', 'en_cours', 
    'en_pause', 'terminée', 'annulée', 'reportée'
  )),
  
  -- Planification
  date_intervention_prevue TIMESTAMP WITH TIME ZONE,
  date_intervention_debut TIMESTAMP WITH TIME ZONE,
  date_intervention_fin TIMESTAMP WITH TIME ZONE,
  duree_estimee_minutes INTEGER, -- Durée estimée en minutes
  
  -- Informations complémentaires
  notes_internes TEXT, -- Notes privées de l'entreprise
  materiel_necessaire TEXT[], -- Liste du matériel nécessaire
  
  -- Gestion des retards (Étape 9)
  est_en_retard BOOLEAN DEFAULT false,
  motif_retard TEXT,
  nouvelle_date_prevue TIMESTAMP WITH TIME ZONE,
  
  -- Rapport d'intervention (Étape 9)
  rapport_intervention TEXT,
  travaux_realises TEXT,
  materiel_utilise TEXT[],
  photos_urls TEXT[], -- URLs des photos dans Supabase Storage
  
  -- Signature (Étape 9)
  signature_client_url TEXT, -- URL de la signature dans Supabase Storage
  signature_technicien_url TEXT,
  date_signature TIMESTAMP WITH TIME ZONE,
  
  -- Facturation (Étape 10)
  montant_estime NUMERIC(10,2),
  montant_final NUMERIC(10,2),
  facture_id UUID, -- Lien vers la table factures (à créer)
  
  -- Métadonnées
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_missions_ticket_id ON missions(ticket_id);
CREATE INDEX IF NOT EXISTS idx_missions_entreprise_id ON missions(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_missions_technicien_id ON missions(technicien_id);
CREATE INDEX IF NOT EXISTS idx_missions_statut ON missions(statut);
CREATE INDEX IF NOT EXISTS idx_missions_date_intervention_prevue ON missions(date_intervention_prevue);
CREATE INDEX IF NOT EXISTS idx_missions_is_demo ON missions(is_demo);
CREATE INDEX IF NOT EXISTS idx_missions_est_en_retard ON missions(est_en_retard);

-- Activation de RLS sur la table missions
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_missions_updated_at
  BEFORE UPDATE ON missions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table : factures
-- Description : Factures générées pour les missions terminées
-- ============================================================================

CREATE TABLE IF NOT EXISTS factures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL UNIQUE, -- Une mission = une seule facture
  entreprise_id UUID NOT NULL,
  regie_id UUID NOT NULL,
  
  -- Informations de facturation
  numero_facture TEXT UNIQUE NOT NULL, -- Format: FAC-YYYYMMDD-XXXXX
  date_emission DATE NOT NULL DEFAULT CURRENT_DATE,
  date_echeance DATE NOT NULL,
  
  -- Montants
  montant_ht NUMERIC(10,2) NOT NULL,
  taux_tva NUMERIC(5,2) DEFAULT 20.00, -- TVA en %
  montant_tva NUMERIC(10,2) GENERATED ALWAYS AS (montant_ht * taux_tva / 100) STORED,
  montant_ttc NUMERIC(10,2) GENERATED ALWAYS AS (montant_ht + (montant_ht * taux_tva / 100)) STORED,
  
  -- Statut de paiement
  statut_paiement TEXT DEFAULT 'en_attente' CHECK (statut_paiement IN (
    'en_attente', 'envoyée', 'payée', 'payée_partiellement', 
    'en_retard', 'annulée', 'litige'
  )),
  
  -- Informations de paiement
  date_paiement DATE,
  montant_paye NUMERIC(10,2) DEFAULT 0,
  mode_paiement TEXT CHECK (mode_paiement IN (
    'virement', 'cheque', 'especes', 'carte_bancaire', 'prelevement', 'autre'
  )),
  reference_paiement TEXT, -- Numéro de transaction, référence chèque, etc.
  
  -- Détails de la facture
  description TEXT,
  notes TEXT, -- Notes internes
  conditions_paiement TEXT, -- Ex: "Paiement à 30 jours"
  
  -- Documents associés
  pdf_url TEXT, -- URL du PDF dans Supabase Storage
  
  -- Relances
  nb_relances INTEGER DEFAULT 0,
  date_derniere_relance DATE,
  
  -- Métadonnées
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_factures_mission_id ON factures(mission_id);
CREATE INDEX IF NOT EXISTS idx_factures_entreprise_id ON factures(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_factures_regie_id ON factures(regie_id);
CREATE INDEX IF NOT EXISTS idx_factures_numero_facture ON factures(numero_facture);
CREATE INDEX IF NOT EXISTS idx_factures_statut_paiement ON factures(statut_paiement);
CREATE INDEX IF NOT EXISTS idx_factures_date_emission ON factures(date_emission);
CREATE INDEX IF NOT EXISTS idx_factures_date_echeance ON factures(date_echeance);
CREATE INDEX IF NOT EXISTS idx_factures_is_demo ON factures(is_demo);

-- Activation de RLS sur la table factures
ALTER TABLE factures ENABLE ROW LEVEL SECURITY;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_factures_updated_at
  BEFORE UPDATE ON factures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour générer un numéro de facture unique
CREATE OR REPLACE FUNCTION generate_numero_facture()
RETURNS TEXT AS $$
DECLARE
  date_part TEXT;
  counter INTEGER;
  numero TEXT;
BEGIN
  -- Format: FAC-YYYYMMDD-XXXXX
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  
  -- Compter le nombre de factures du jour
  SELECT COUNT(*) + 1 INTO counter
  FROM factures
  WHERE date_emission = CURRENT_DATE;
  
  -- Générer le numéro
  numero := 'FAC-' || date_part || '-' || LPAD(counter::TEXT, 5, '0');
  
  RETURN numero;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Table : messages
-- Description : Messagerie entre les différents acteurs (Étape 11)
-- ============================================================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Expéditeur et destinataire
  sender_id UUID NOT NULL, -- Profile ID de l'expéditeur
  recipient_id UUID NOT NULL, -- Profile ID du destinataire
  
  -- Contexte du message (optionnel)
  ticket_id UUID, -- Si le message concerne un ticket
  mission_id UUID, -- Si le message concerne une mission
  facture_id UUID, -- Si le message concerne une facture
  
  -- Contenu du message
  sujet TEXT,
  contenu TEXT NOT NULL,
  
  -- Pièces jointes (URLs dans Supabase Storage)
  attachments_urls TEXT[],
  
  -- Statut de lecture
  lu BOOLEAN DEFAULT false,
  date_lecture TIMESTAMP WITH TIME ZONE,
  
  -- Type de message
  type_message TEXT DEFAULT 'standard' CHECK (type_message IN (
    'standard', 'system', 'notification', 'urgence'
  )),
  
  -- Pour les réponses (threading)
  parent_message_id UUID, -- ID du message parent si c'est une réponse
  
  -- Métadonnées
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_ticket_id ON messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_messages_mission_id ON messages(mission_id);
CREATE INDEX IF NOT EXISTS idx_messages_facture_id ON messages(facture_id);
CREATE INDEX IF NOT EXISTS idx_messages_parent_message_id ON messages(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_lu ON messages(lu);
CREATE INDEX IF NOT EXISTS idx_messages_type_message ON messages(type_message);
CREATE INDEX IF NOT EXISTS idx_messages_is_demo ON messages(is_demo);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Index composite pour les conversations
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, recipient_id, created_at DESC);

-- Activation de RLS sur la table messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table : notifications
-- Description : Notifications des événements importants (Étape 12)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Destinataire de la notification
  user_id UUID NOT NULL, -- Profile ID du destinataire
  
  -- Type et contenu de la notification
  type_notification TEXT NOT NULL CHECK (type_notification IN (
    'nouveau_ticket', 'ticket_diffuse', 'ticket_accepte', 'ticket_refuse',
    'mission_planifiee', 'mission_assignee', 'mission_modifiee',
    'intervention_demarree', 'intervention_terminee', 'intervention_retard',
    'facture_creee', 'facture_envoyee', 'facture_payee', 'facture_en_retard',
    'message_recu', 'message_urgent',
    'system', 'autre'
  )),
  
  titre TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Contexte de la notification (optionnel)
  ticket_id UUID,
  mission_id UUID,
  facture_id UUID,
  message_id UUID,
  
  -- Action associée (URL ou route frontend)
  action_url TEXT, -- Ex: "/tickets/123", "/missions/456"
  action_label TEXT, -- Ex: "Voir le ticket", "Accepter la mission"
  
  -- Priorité
  priorite TEXT DEFAULT 'normale' CHECK (priorite IN ('basse', 'normale', 'haute', 'urgente')),
  
  -- Statut
  lu BOOLEAN DEFAULT false,
  date_lecture TIMESTAMP WITH TIME ZONE,
  archivee BOOLEAN DEFAULT false,
  
  -- Canal de notification (pour les préférences utilisateur)
  canal TEXT[] DEFAULT ARRAY['in_app'], -- ['in_app', 'email', 'push']
  
  -- Métadonnées
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type_notification ON notifications(type_notification);
CREATE INDEX IF NOT EXISTS idx_notifications_ticket_id ON notifications(ticket_id);
CREATE INDEX IF NOT EXISTS idx_notifications_mission_id ON notifications(mission_id);
CREATE INDEX IF NOT EXISTS idx_notifications_facture_id ON notifications(facture_id);
CREATE INDEX IF NOT EXISTS idx_notifications_message_id ON notifications(message_id);
CREATE INDEX IF NOT EXISTS idx_notifications_lu ON notifications(lu);
CREATE INDEX IF NOT EXISTS idx_notifications_archivee ON notifications(archivee);
CREATE INDEX IF NOT EXISTS idx_notifications_priorite ON notifications(priorite);
CREATE INDEX IF NOT EXISTS idx_notifications_is_demo ON notifications(is_demo);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Index composite pour les notifications non lues
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, lu, created_at DESC) WHERE lu = false;

-- Activation de RLS sur la table notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table : plans
-- Description : Plans d'abonnement pour régies et entreprises (Étape 13)
-- ============================================================================

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Informations du plan
  nom TEXT NOT NULL UNIQUE, -- Ex: "Gratuit", "Essentiel", "Premium", "Entreprise"
  description TEXT,
  
  -- Type de plan
  type_entite TEXT NOT NULL CHECK (type_entite IN ('regie', 'entreprise', 'both')),
  
  -- Tarification
  prix_mensuel NUMERIC(10,2) NOT NULL DEFAULT 0,
  prix_annuel NUMERIC(10,2), -- Prix annuel si différent (économie)
  devise TEXT DEFAULT 'EUR',
  
  -- Période d'essai
  periode_essai_jours INTEGER DEFAULT 0,
  
  -- Limites du plan
  max_immeubles INTEGER, -- NULL = illimité
  max_logements INTEGER,
  max_locataires INTEGER,
  max_tickets_par_mois INTEGER,
  max_entreprises_partenaires INTEGER, -- Pour régies
  max_missions_par_mois INTEGER, -- Pour entreprises
  max_techniciens INTEGER, -- Pour entreprises
  max_stockage_mb INTEGER, -- Espace de stockage pour photos/documents
  
  -- Fonctionnalités incluses
  features JSONB DEFAULT '{}'::jsonb, -- Ex: {"messagerie": true, "notifications_push": false, "api_access": false}
  
  -- Modules payants
  module_facturation BOOLEAN DEFAULT false,
  module_planning BOOLEAN DEFAULT false,
  module_reporting BOOLEAN DEFAULT false,
  module_api BOOLEAN DEFAULT false,
  
  -- Statut et visibilité
  est_actif BOOLEAN DEFAULT true,
  est_visible BOOLEAN DEFAULT true, -- Afficher sur la page tarifs
  ordre_affichage INTEGER DEFAULT 0, -- Pour tri sur page tarifs
  
  -- Métadonnées
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_plans_type_entite ON plans(type_entite);
CREATE INDEX IF NOT EXISTS idx_plans_est_actif ON plans(est_actif);
CREATE INDEX IF NOT EXISTS idx_plans_est_visible ON plans(est_visible);
CREATE INDEX IF NOT EXISTS idx_plans_is_demo ON plans(is_demo);

-- Activation de RLS sur la table plans
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table : subscriptions
-- Description : Abonnements des régies et entreprises (Étape 13)
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Entité abonnée (régie OU entreprise, pas les deux)
  regie_id UUID,
  entreprise_id UUID,
  
  -- Plan souscrit
  plan_id UUID NOT NULL,
  
  -- Statut de l'abonnement
  statut TEXT DEFAULT 'actif' CHECK (statut IN (
    'essai', 'actif', 'suspendu', 'annule', 'expire'
  )),
  
  -- Dates importantes
  date_debut DATE NOT NULL DEFAULT CURRENT_DATE,
  date_fin_essai DATE, -- Fin de la période d'essai
  date_fin DATE, -- Date de fin prévue (renouvellement)
  date_annulation DATE, -- Date d'annulation si applicable
  date_derniere_facture DATE,
  date_prochain_paiement DATE,
  
  -- Facturation
  frequence_paiement TEXT DEFAULT 'mensuel' CHECK (frequence_paiement IN ('mensuel', 'annuel')),
  montant_facture NUMERIC(10,2) NOT NULL,
  
  -- Méthode de paiement (à compléter avec Stripe/autres)
  mode_paiement TEXT CHECK (mode_paiement IN (
    'carte_bancaire', 'virement', 'prelevement', 'autre'
  )),
  
  -- Tracking usage (pour limites du plan)
  usage_immeubles INTEGER DEFAULT 0,
  usage_logements INTEGER DEFAULT 0,
  usage_locataires INTEGER DEFAULT 0,
  usage_tickets_mois_actuel INTEGER DEFAULT 0,
  usage_missions_mois_actuel INTEGER DEFAULT 0,
  usage_stockage_mb NUMERIC(10,2) DEFAULT 0,
  date_reset_usage DATE, -- Date du dernier reset des compteurs mensuels
  
  -- Notes et historique
  notes TEXT,
  historique JSONB DEFAULT '[]'::jsonb, -- Historique des changements de plan
  
  -- Contrainte : soit regie_id, soit entreprise_id, mais pas les deux
  CONSTRAINT check_one_entity CHECK (
    (regie_id IS NOT NULL AND entreprise_id IS NULL) OR
    (regie_id IS NULL AND entreprise_id IS NOT NULL)
  ),
  
  -- Métadonnées
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_subscriptions_regie_id ON subscriptions(regie_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_entreprise_id ON subscriptions(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_statut ON subscriptions(statut);
CREATE INDEX IF NOT EXISTS idx_subscriptions_date_fin ON subscriptions(date_fin);
CREATE INDEX IF NOT EXISTS idx_subscriptions_date_prochain_paiement ON subscriptions(date_prochain_paiement);
CREATE INDEX IF NOT EXISTS idx_subscriptions_is_demo ON subscriptions(is_demo);

-- Activation de RLS sur la table subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour vérifier les limites du plan
CREATE OR REPLACE FUNCTION check_plan_limit(
  subscription_uuid UUID,
  limit_type TEXT,
  increment INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  sub_record RECORD;
  plan_record RECORD;
  current_usage INTEGER;
  plan_limit INTEGER;
BEGIN
  -- Récupérer l'abonnement
  SELECT * INTO sub_record FROM subscriptions WHERE id = subscription_uuid;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Récupérer le plan
  SELECT * INTO plan_record FROM plans WHERE id = sub_record.plan_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Vérifier selon le type de limite
  CASE limit_type
    WHEN 'immeubles' THEN
      current_usage := sub_record.usage_immeubles;
      plan_limit := plan_record.max_immeubles;
    WHEN 'logements' THEN
      current_usage := sub_record.usage_logements;
      plan_limit := plan_record.max_logements;
    WHEN 'locataires' THEN
      current_usage := sub_record.usage_locataires;
      plan_limit := plan_record.max_locataires;
    WHEN 'tickets' THEN
      current_usage := sub_record.usage_tickets_mois_actuel;
      plan_limit := plan_record.max_tickets_par_mois;
    WHEN 'missions' THEN
      current_usage := sub_record.usage_missions_mois_actuel;
      plan_limit := plan_record.max_missions_par_mois;
    WHEN 'techniciens' THEN
      -- Compter directement dans la table profiles
      SELECT COUNT(*) INTO current_usage 
      FROM profiles 
      WHERE entreprise_id = sub_record.entreprise_id 
      AND role = 'technicien';
      plan_limit := plan_record.max_techniciens;
    ELSE
      RETURN false;
  END CASE;
  
  -- NULL signifie illimité
  IF plan_limit IS NULL THEN
    RETURN true;
  END IF;
  
  -- Vérifier si on peut incrémenter
  RETURN (current_usage + increment) <= plan_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Table : preferences_utilisateur
-- Description : Préférences personnalisées par utilisateur (Étape 15)
-- ============================================================================

CREATE TABLE IF NOT EXISTS preferences_utilisateur (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Apparence
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  langue TEXT DEFAULT 'fr' CHECK (langue IN ('fr', 'en', 'es', 'de')),
  taille_police TEXT DEFAULT 'medium' CHECK (taille_police IN ('small', 'medium', 'large')),
  
  -- Notifications
  notifications_email BOOLEAN DEFAULT true,
  notifications_push BOOLEAN DEFAULT true,
  notifications_in_app BOOLEAN DEFAULT true,
  notifications_types JSONB DEFAULT '["nouveau_ticket", "mission_planifiee", "facture_creee", "message_recu"]'::JSONB,
  
  -- Affichage
  vue_par_defaut TEXT DEFAULT 'tableau' CHECK (vue_par_defaut IN ('tableau', 'liste', 'grille', 'kanban')),
  elements_par_page INTEGER DEFAULT 20 CHECK (elements_par_page BETWEEN 10 AND 100),
  afficher_tickets_clotures BOOLEAN DEFAULT false,
  afficher_missions_terminees BOOLEAN DEFAULT false,
  
  -- Dashboard
  widgets_dashboard JSONB DEFAULT '["stats", "tickets_recents", "missions_en_cours"]'::JSONB,
  ordre_widgets JSONB DEFAULT '[]'::JSONB,
  
  -- Timezone et format
  timezone TEXT DEFAULT 'Europe/Paris',
  format_date TEXT DEFAULT 'DD/MM/YYYY' CHECK (format_date IN ('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD')),
  format_heure TEXT DEFAULT '24h' CHECK (format_heure IN ('12h', '24h')),
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- ============================================================================
-- Table : parametres_application
-- Description : Paramètres globaux configurables par entité (Étape 15)
-- ============================================================================

CREATE TABLE IF NOT EXISTS parametres_application (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  regie_id UUID REFERENCES regies(id) ON DELETE CASCADE,
  entreprise_id UUID REFERENCES entreprises(id) ON DELETE CASCADE,
  
  -- Validation : une seule entité doit être définie
  CHECK (
    (regie_id IS NOT NULL AND entreprise_id IS NULL) OR
    (regie_id IS NULL AND entreprise_id IS NOT NULL)
  ),
  
  -- Tickets
  delai_reponse_max_heures INTEGER DEFAULT 48,
  priorites_actives JSONB DEFAULT '["basse", "normale", "haute", "urgente"]'::JSONB,
  categories_personnalisees JSONB DEFAULT '[]'::JSONB,
  auto_assignation_tickets BOOLEAN DEFAULT false,
  
  -- Missions
  duree_intervention_defaut_minutes INTEGER DEFAULT 120,
  delai_alerte_retard_minutes INTEGER DEFAULT 30,
  validation_rapport_obligatoire BOOLEAN DEFAULT true,
  signature_client_obligatoire BOOLEAN DEFAULT true,
  
  -- Facturation
  mode_facturation TEXT DEFAULT 'mission' CHECK (mode_facturation IN ('mission', 'forfait', 'regie')),
  delai_paiement_jours INTEGER DEFAULT 30,
  tva_par_defaut NUMERIC(5,2) DEFAULT 20.00,
  conditions_generales TEXT,
  
  -- Communication
  email_notifications_auto BOOLEAN DEFAULT true,
  modeles_email JSONB DEFAULT '{}'::JSONB,
  signature_email TEXT,
  
  -- API et intégrations
  webhook_actif BOOLEAN DEFAULT false,
  api_publique_active BOOLEAN DEFAULT false,
  cle_api_publique TEXT,
  
  -- Logo et branding
  logo_url TEXT,
  couleur_primaire TEXT DEFAULT '#1E40AF',
  couleur_secondaire TEXT DEFAULT '#10B981',
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(regie_id),
  UNIQUE(entreprise_id)
);

-- ============================================================================
-- Table : webhooks
-- Description : Configuration des webhooks pour événements système (Étape 15)
-- ============================================================================

CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  regie_id UUID REFERENCES regies(id) ON DELETE CASCADE,
  entreprise_id UUID REFERENCES entreprises(id) ON DELETE CASCADE,
  
  -- Validation : une seule entité doit être définie
  CHECK (
    (regie_id IS NOT NULL AND entreprise_id IS NULL) OR
    (regie_id IS NULL AND entreprise_id IS NOT NULL)
  ),
  
  -- Configuration du webhook
  nom TEXT NOT NULL,
  url TEXT NOT NULL,
  methode TEXT DEFAULT 'POST' CHECK (methode IN ('POST', 'PUT', 'PATCH')),
  headers JSONB DEFAULT '{}'::JSONB,
  secret TEXT, -- Pour signature HMAC
  
  -- Événements à écouter
  evenements JSONB NOT NULL DEFAULT '[]'::JSONB,
  -- Types possibles : 
  -- ticket_cree, ticket_diffuse, ticket_accepte, ticket_cloture
  -- mission_creee, mission_planifiee, mission_en_cours, mission_terminee
  -- facture_creee, facture_payee, message_recu, notification_urgente
  
  -- État et monitoring
  est_actif BOOLEAN DEFAULT true,
  retry_max INTEGER DEFAULT 3,
  retry_delai_secondes INTEGER DEFAULT 60,
  timeout_secondes INTEGER DEFAULT 30,
  
  -- Statistiques
  nb_appels_total INTEGER DEFAULT 0,
  nb_appels_succes INTEGER DEFAULT 0,
  nb_appels_echec INTEGER DEFAULT 0,
  dernier_appel TIMESTAMP WITH TIME ZONE,
  dernier_statut TEXT,
  dernier_message_erreur TEXT,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_webhooks_regie ON webhooks(regie_id) WHERE regie_id IS NOT NULL;
CREATE INDEX idx_webhooks_entreprise ON webhooks(entreprise_id) WHERE entreprise_id IS NOT NULL;
CREATE INDEX idx_webhooks_actif ON webhooks(est_actif);

-- ============================================================================
-- Table : logs_activite
-- Description : Journal d'audit des actions importantes (Étape 15)
-- ============================================================================

CREATE TABLE IF NOT EXISTS logs_activite (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Type d'action
  action TEXT NOT NULL,
  -- Exemples: login, logout, create_ticket, update_mission, delete_facture, 
  --           export_data, change_plan, webhook_called
  
  entite_type TEXT,
  -- Type d'entité concernée: ticket, mission, facture, logement, etc.
  
  entite_id UUID,
  -- ID de l'entité concernée
  
  -- Détails
  description TEXT,
  donnees_avant JSONB,
  donnees_apres JSONB,
  
  -- Contexte
  ip_address INET,
  user_agent TEXT,
  endpoint TEXT,
  methode_http TEXT,
  
  -- Résultat
  statut TEXT CHECK (statut IN ('success', 'error', 'warning')),
  code_erreur TEXT,
  message_erreur TEXT,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_logs_user ON logs_activite(user_id);
CREATE INDEX idx_logs_action ON logs_activite(action);
CREATE INDEX idx_logs_entite ON logs_activite(entite_type, entite_id);
CREATE INDEX idx_logs_created ON logs_activite(created_at DESC);
CREATE INDEX idx_logs_statut ON logs_activite(statut);

-- Note : Les autres tables seront ajoutées progressivement selon les étapes du cahier des charges
