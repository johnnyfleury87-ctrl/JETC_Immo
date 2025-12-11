-- ============================================================================
-- Fichier : 03_views.sql
-- Description : Vues SQL pour statistiques et agrégations
-- ============================================================================

-- ============================================================================
-- VUE 1 : Statistiques globales de la plateforme (Étape 14)
-- ============================================================================

CREATE OR REPLACE VIEW vue_stats_globales AS
SELECT
  -- Compteurs généraux
  (SELECT COUNT(*) FROM regies WHERE is_demo = false) as total_regies,
  (SELECT COUNT(*) FROM regies WHERE is_demo = false AND subscription_actif = true) as regies_actives,
  (SELECT COUNT(*) FROM entreprises WHERE is_demo = false) as total_entreprises,
  (SELECT COUNT(*) FROM entreprises WHERE is_demo = false AND subscription_actif = true) as entreprises_actives,
  (SELECT COUNT(*) FROM profiles WHERE is_demo = false AND role = 'technicien') as total_techniciens,
  (SELECT COUNT(*) FROM immeubles WHERE is_demo = false) as total_immeubles,
  (SELECT COUNT(*) FROM logements WHERE is_demo = false) as total_logements,
  (SELECT COUNT(*) FROM locataires WHERE is_demo = false AND statut = 'actif') as total_locataires_actifs,
  
  -- Activité
  (SELECT COUNT(*) FROM tickets WHERE is_demo = false) as total_tickets,
  (SELECT COUNT(*) FROM tickets WHERE is_demo = false AND statut IN ('nouveau', 'en_attente_diffusion', 'diffusé')) as tickets_en_attente,
  (SELECT COUNT(*) FROM missions WHERE is_demo = false) as total_missions,
  (SELECT COUNT(*) FROM missions WHERE is_demo = false AND statut IN ('en_attente', 'planifiée', 'en_route', 'en_cours')) as missions_en_cours,
  (SELECT COUNT(*) FROM missions WHERE is_demo = false AND statut = 'terminée') as missions_terminees,
  (SELECT COUNT(*) FROM factures WHERE is_demo = false) as total_factures,
  (SELECT COUNT(*) FROM factures WHERE is_demo = false AND statut_paiement = 'payée') as factures_payees,
  
  -- Revenus estimés
  (SELECT COALESCE(SUM(montant_facture), 0) FROM subscriptions WHERE is_demo = false AND statut IN ('essai', 'actif')) as revenus_mensuels_recurrents,
  (SELECT COALESCE(SUM(montant_ttc), 0) FROM factures WHERE is_demo = false AND statut_paiement = 'payée') as volume_factures_payees,
  (SELECT COALESCE(SUM(montant_ttc), 0) FROM factures WHERE is_demo = false AND statut_paiement IN ('en_attente', 'envoyée')) as volume_factures_en_attente,
  
  -- Abonnements
  (SELECT COUNT(*) FROM subscriptions WHERE is_demo = false AND statut = 'actif') as abonnements_actifs,
  (SELECT COUNT(*) FROM subscriptions WHERE is_demo = false AND statut = 'essai') as abonnements_essai,
  (SELECT COUNT(*) FROM subscriptions WHERE is_demo = false AND statut = 'annule' AND date_annulation > NOW() - INTERVAL '30 days') as abonnements_annules_30j;

-- ============================================================================
-- VUE 2 : Abonnements par plan (Étape 14)
-- ============================================================================

CREATE OR REPLACE VIEW vue_abonnements_par_plan AS
SELECT
  p.id as plan_id,
  p.nom as plan_nom,
  p.type_entite,
  p.prix_mensuel,
  p.prix_annuel,
  COUNT(s.id) as nombre_abonnements,
  COUNT(CASE WHEN s.statut = 'actif' THEN 1 END) as abonnements_actifs,
  COUNT(CASE WHEN s.statut = 'essai' THEN 1 END) as abonnements_essai,
  COUNT(CASE WHEN s.statut = 'annule' THEN 1 END) as abonnements_annules,
  SUM(CASE WHEN s.statut IN ('actif', 'essai') THEN s.montant_facture ELSE 0 END) as revenu_mensuel_plan
FROM plans p
LEFT JOIN subscriptions s ON s.plan_id = p.id AND s.is_demo = false
WHERE p.is_demo = false
GROUP BY p.id, p.nom, p.type_entite, p.prix_mensuel, p.prix_annuel
ORDER BY nombre_abonnements DESC;

-- ============================================================================
-- VUE 3 : Tickets par statut et priorité (Étape 14)
-- ============================================================================

CREATE OR REPLACE VIEW vue_tickets_par_statut AS
SELECT
  t.statut,
  t.priorite,
  COUNT(*) as nombre,
  COUNT(CASE WHEN t.created_at > NOW() - INTERVAL '7 days' THEN 1 END) as cette_semaine,
  COUNT(CASE WHEN t.created_at > NOW() - INTERVAL '30 days' THEN 1 END) as ce_mois,
  AVG(EXTRACT(EPOCH FROM (t.date_acceptation - t.created_at)) / 3600) as delai_moyen_acceptation_heures
FROM tickets t
WHERE t.is_demo = false
GROUP BY t.statut, t.priorite
ORDER BY t.statut, t.priorite;

-- ============================================================================
-- VUE 4 : Missions par statut (Étape 14)
-- ============================================================================

CREATE OR REPLACE VIEW vue_missions_par_statut AS
SELECT
  m.statut,
  COUNT(*) as nombre,
  COUNT(CASE WHEN m.created_at > NOW() - INTERVAL '7 days' THEN 1 END) as cette_semaine,
  COUNT(CASE WHEN m.created_at > NOW() - INTERVAL '30 days' THEN 1 END) as ce_mois,
  COUNT(CASE WHEN m.est_en_retard = true THEN 1 END) as en_retard,
  AVG(EXTRACT(EPOCH FROM (m.date_intervention_fin - m.date_intervention_debut)) / 60) as duree_moyenne_minutes
FROM missions m
WHERE m.is_demo = false
GROUP BY m.statut
ORDER BY m.statut;

-- ============================================================================
-- VUE 5 : Factures par statut (Étape 14)
-- ============================================================================

CREATE OR REPLACE VIEW vue_factures_par_statut AS
SELECT
  f.statut_paiement,
  COUNT(*) as nombre,
  COUNT(CASE WHEN f.date_emission > CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as cette_semaine,
  COUNT(CASE WHEN f.date_emission > CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as ce_mois,
  SUM(f.montant_ttc) as montant_total,
  AVG(f.montant_ttc) as montant_moyen,
  AVG(CASE WHEN f.date_paiement IS NOT NULL THEN EXTRACT(EPOCH FROM (f.date_paiement::timestamp - f.date_emission::timestamp)) / 86400 ELSE NULL END) as delai_moyen_paiement_jours
FROM factures f
WHERE f.is_demo = false
GROUP BY f.statut_paiement
ORDER BY f.statut_paiement;

-- ============================================================================
-- VUE 6 : Top régies par activité (Étape 14)
-- ============================================================================

CREATE OR REPLACE VIEW vue_top_regies AS
SELECT
  r.id,
  r.nom,
  r.email,
  r.subscription_actif,
  p.nom as plan_nom,
  COUNT(DISTINCT i.id) as nombre_immeubles,
  COUNT(DISTINCT l.id) as nombre_logements,
  COUNT(DISTINCT loc.id) as nombre_locataires,
  COUNT(DISTINCT t.id) as nombre_tickets,
  COUNT(DISTINCT t.id) FILTER (WHERE t.created_at > NOW() - INTERVAL '30 days') as tickets_ce_mois,
  r.created_at as date_inscription
FROM regies r
LEFT JOIN plans p ON p.id = r.plan_id
LEFT JOIN immeubles i ON i.regie_id = r.id AND i.is_demo = false
LEFT JOIN logements l ON l.immeuble_id = i.id AND l.is_demo = false
LEFT JOIN locataires loc ON loc.logement_id = l.id AND loc.is_demo = false
LEFT JOIN tickets t ON t.regie_id = r.id AND t.is_demo = false
WHERE r.is_demo = false
GROUP BY r.id, r.nom, r.email, r.subscription_actif, p.nom, r.created_at
ORDER BY nombre_tickets DESC
LIMIT 50;

-- ============================================================================
-- VUE 7 : Top entreprises par activité (Étape 14)
-- ============================================================================

CREATE OR REPLACE VIEW vue_top_entreprises AS
SELECT
  e.id,
  e.nom,
  e.email,
  e.specialites,
  e.subscription_actif,
  p.nom as plan_nom,
  COUNT(DISTINCT pr.id) as nombre_techniciens,
  COUNT(DISTINCT m.id) as nombre_missions,
  COUNT(DISTINCT m.id) FILTER (WHERE m.statut = 'terminée') as missions_terminees,
  COUNT(DISTINCT m.id) FILTER (WHERE m.created_at > NOW() - INTERVAL '30 days') as missions_ce_mois,
  COUNT(DISTINCT f.id) as nombre_factures,
  SUM(f.montant_ttc) FILTER (WHERE f.statut_paiement = 'payée') as chiffre_affaires,
  e.created_at as date_inscription
FROM entreprises e
LEFT JOIN plans p ON p.id = e.plan_id
LEFT JOIN profiles pr ON pr.entreprise_id = e.id AND pr.role = 'technicien' AND pr.is_demo = false
LEFT JOIN missions m ON m.entreprise_id = e.id AND m.is_demo = false
LEFT JOIN factures f ON f.entreprise_id = e.id AND f.is_demo = false
WHERE e.is_demo = false
GROUP BY e.id, e.nom, e.email, e.specialites, e.subscription_actif, p.nom, e.created_at
ORDER BY nombre_missions DESC
LIMIT 50;

-- ============================================================================
-- VUE 8 : Évolution mensuelle (Étape 14)
-- ============================================================================

CREATE OR REPLACE VIEW vue_evolution_mensuelle AS
SELECT
  DATE_TRUNC('month', date_series.mois) as mois,
  
  -- Nouvelles inscriptions
  COUNT(DISTINCT r.id) FILTER (WHERE DATE_TRUNC('month', r.created_at) = DATE_TRUNC('month', date_series.mois)) as nouvelles_regies,
  COUNT(DISTINCT e.id) FILTER (WHERE DATE_TRUNC('month', e.created_at) = DATE_TRUNC('month', date_series.mois)) as nouvelles_entreprises,
  
  -- Activité
  COUNT(DISTINCT t.id) FILTER (WHERE DATE_TRUNC('month', t.created_at) = DATE_TRUNC('month', date_series.mois)) as tickets_crees,
  COUNT(DISTINCT m.id) FILTER (WHERE DATE_TRUNC('month', m.created_at) = DATE_TRUNC('month', date_series.mois)) as missions_creees,
  COUNT(DISTINCT m.id) FILTER (WHERE DATE_TRUNC('month', m.date_intervention_fin) = DATE_TRUNC('month', date_series.mois) AND m.statut = 'terminée') as missions_terminees,
  
  -- Facturation
  COUNT(DISTINCT f.id) FILTER (WHERE DATE_TRUNC('month', f.date_emission::timestamp) = DATE_TRUNC('month', date_series.mois)) as factures_emises,
  SUM(f.montant_ttc) FILTER (WHERE DATE_TRUNC('month', f.date_emission::timestamp) = DATE_TRUNC('month', date_series.mois)) as montant_facture,
  SUM(f.montant_ttc) FILTER (WHERE DATE_TRUNC('month', f.date_paiement::timestamp) = DATE_TRUNC('month', date_series.mois) AND f.statut_paiement = 'payée') as montant_paye
  
FROM generate_series(
  DATE_TRUNC('month', NOW() - INTERVAL '12 months'),
  DATE_TRUNC('month', NOW()),
  '1 month'::interval
) as date_series(mois)
LEFT JOIN regies r ON r.is_demo = false
LEFT JOIN entreprises e ON e.is_demo = false
LEFT JOIN tickets t ON t.is_demo = false
LEFT JOIN missions m ON m.is_demo = false
LEFT JOIN factures f ON f.is_demo = false
GROUP BY DATE_TRUNC('month', date_series.mois)
ORDER BY mois DESC;

-- ============================================================================
-- VUE 9 : Abonnements expirant bientôt (Étape 14)
-- ============================================================================

CREATE OR REPLACE VIEW vue_abonnements_expirant AS
SELECT
  s.id as subscription_id,
  COALESCE(r.nom, e.nom) as entite_nom,
  COALESCE(r.email, e.email) as entite_email,
  CASE 
    WHEN s.regie_id IS NOT NULL THEN 'regie'
    WHEN s.entreprise_id IS NOT NULL THEN 'entreprise'
  END as type_entite,
  p.nom as plan_nom,
  s.statut,
  s.date_fin,
  s.date_prochain_paiement,
  EXTRACT(DAY FROM (s.date_fin::timestamp - NOW())) as jours_restants,
  s.montant_facture
FROM subscriptions s
LEFT JOIN regies r ON r.id = s.regie_id
LEFT JOIN entreprises e ON e.id = s.entreprise_id
LEFT JOIN plans p ON p.id = s.plan_id
WHERE s.is_demo = false
  AND s.statut IN ('actif', 'essai')
  AND s.date_fin <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY s.date_fin ASC;

-- Note : Les vues sont accessibles uniquement par Admin JTEC via les policies RLS

