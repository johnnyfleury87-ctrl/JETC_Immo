import express from "express";
import { supabaseServer } from "./_supabase.js";
import { register } from "./auth/register.js";
import { login } from "./auth/login.js";
import { authenticateUser, getProfile, updateProfile } from "./profile.js";
import { createRegie, getRegie, updateRegie, listRegies } from "./regies.js";
import {
  createEntreprise,
  getEntreprise,
  updateEntreprise,
  listEntreprises,
} from "./entreprises.js";
import {
  createImmeuble,
  getImmeuble,
  updateImmeuble,
  deleteImmeuble,
  listImmeubles,
} from "./immeubles.js";
import {
  createLogement,
  getLogement,
  updateLogement,
  deleteLogement,
  listLogements,
} from "./logements.js";
import {
  createLocataire,
  getLocataire,
  updateLocataire,
  deleteLocataire,
  listLocataires,
} from "./locataires.js";
import {
  createTicket,
  getTicket,
  updateTicket,
  deleteTicket,
  listTickets,
  diffuseTicket,
} from "./tickets.js";
import {
  acceptTicket,
  getMission,
  updateMission,
  deleteMission,
  listMissions,
  assignTechnicien,
} from "./missions.js";
import {
  createTechnicien,
  getTechnicien,
  updateTechnicien,
  deleteTechnicien,
  listTechniciens,
  getTechnicienMissions,
} from "./techniciens.js";
import {
  startIntervention,
  pauseIntervention,
  reportDelay,
  completeIntervention,
  addSignature,
  getPhotoUploadUrl,
  getInterventionPhotos,
} from "./interventions.js";
import {
  createFacture,
  getFacture,
  updateFacture,
  deleteFacture,
  listFactures,
  markFacturePaid,
} from "./factures.js";
import {
  sendMessage,
  getConversation,
  markAsRead,
  markConversationAsRead,
  listConversations,
  getContextMessages,
  getUnreadCount,
  deleteMessage,
} from "./messages.js";
import {
  listNotifications,
  getNotification,
  markAsRead as markNotificationAsRead,
  markAllAsRead,
  archiveNotification,
  getUnreadCount as getNotificationUnreadCount,
  deleteNotification,
  createNotification,
} from "./notifications.js";
import {
  listPlans,
  getPlan,
  createPlan,
  updatePlan,
  createSubscription,
  getCurrentSubscription,
  changePlan,
  cancelSubscription,
  checkLimit,
} from "./subscriptions.js";
import {
  getGlobalStats,
  getSubscriptionsByPlan,
  getTicketsStats,
  getMissionsStats,
  getFacturesStats,
  getTopRegies,
  getTopEntreprises,
  getEvolutionMensuelle,
  getExpiringSubscriptions,
  listAllRegies,
  listAllEntreprises,
  listAllUsers,
  toggleSubscription,
} from "./admin.js";
import {
  getPreferences,
  upsertPreferences,
  resetPreferences,
} from "./preferences.js";
import {
  getParametres,
  upsertParametres,
  deleteParametres,
} from "./parametres.js";
import {
  listWebhooks,
  createWebhook,
  getWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook,
} from "./webhooks.js";
import {
  listLogs,
  getLog,
  getLogsStats,
  cleanupLogs,
  exportLogs,
} from "./logs.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Route de test de l'API
app.get("/", (req, res) => {
  res.json({
    message: "✅ API JETC_Immo opérationnelle",
    mode: process.env.MODE || "demo",
  });
});

// Route de santé / health check
app.get("/api/health", async (req, res) => {
  try {
    // Vérification de la connexion à Supabase
    const { data, error } = await supabaseServer
      .from("profiles")
      .select("count")
      .limit(1);

    if (error) throw error;

    res.json({
      status: "healthy",
      database: "connected",
      mode: process.env.MODE || "demo",
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
    });
  }
});

// ============================================================================
// ROUTES AUTHENTIFICATION (Étape 1)
// ============================================================================

// Inscription
app.post("/api/auth/register", register);

// Connexion
app.post("/api/auth/login", login);

// ============================================================================
// ROUTES PROFIL (Étape 1)
// ============================================================================

// Récupérer son profil (authentification requise)
app.get("/api/profile", authenticateUser, getProfile);

// Mettre à jour son profil (authentification requise)
app.put("/api/profile", authenticateUser, updateProfile);

// ============================================================================
// ROUTES RÉGIES (Étape 2)
// ============================================================================

// Créer une régie
app.post("/api/regies", authenticateUser, createRegie);

// Lister toutes les régies (admin uniquement)
app.get("/api/regies", authenticateUser, listRegies);

// Récupérer une régie spécifique
app.get("/api/regies/:id", authenticateUser, getRegie);

// Mettre à jour une régie
app.put("/api/regies/:id", authenticateUser, updateRegie);

// ============================================================================
// ROUTES ENTREPRISES (Étape 3)
// ============================================================================

// Créer une entreprise
app.post("/api/entreprises", authenticateUser, createEntreprise);

// Lister toutes les entreprises (admin ou régie)
app.get("/api/entreprises", authenticateUser, listEntreprises);

// Récupérer une entreprise spécifique
app.get("/api/entreprises/:id", authenticateUser, getEntreprise);

// Mettre à jour une entreprise
app.put("/api/entreprises/:id", authenticateUser, updateEntreprise);

// ============================================================================
// ROUTES IMMEUBLES (Étape 4)
// ============================================================================

// Créer un immeuble
app.post("/api/immeubles", authenticateUser, createImmeuble);

// Lister tous les immeubles
app.get("/api/immeubles", authenticateUser, listImmeubles);

// Récupérer un immeuble spécifique
app.get("/api/immeubles/:id", authenticateUser, getImmeuble);

// Mettre à jour un immeuble
app.put("/api/immeubles/:id", authenticateUser, updateImmeuble);

// Supprimer un immeuble
app.delete("/api/immeubles/:id", authenticateUser, deleteImmeuble);

// ============================================================================
// ROUTES LOGEMENTS (Étape 4)
// ============================================================================

// Créer un logement
app.post("/api/logements", authenticateUser, createLogement);

// Lister tous les logements
app.get("/api/logements", authenticateUser, listLogements);

// Récupérer un logement spécifique
app.get("/api/logements/:id", authenticateUser, getLogement);

// Mettre à jour un logement
app.put("/api/logements/:id", authenticateUser, updateLogement);

// Supprimer un logement
app.delete("/api/logements/:id", authenticateUser, deleteLogement);

// ============================================================================
// ROUTES LOCATAIRES (Étape 5)
// ============================================================================

// Créer un locataire
app.post("/api/locataires", authenticateUser, createLocataire);

// Lister tous les locataires
app.get("/api/locataires", authenticateUser, listLocataires);

// Récupérer un locataire spécifique
app.get("/api/locataires/:id", authenticateUser, getLocataire);

// Mettre à jour un locataire
app.put("/api/locataires/:id", authenticateUser, updateLocataire);

// Supprimer un locataire
app.delete("/api/locataires/:id", authenticateUser, deleteLocataire);

// ============================================================================
// ROUTES TICKETS (Étape 6)
// ============================================================================

// Créer un ticket
app.post("/api/tickets", authenticateUser, createTicket);

// Lister tous les tickets
app.get("/api/tickets", authenticateUser, listTickets);

// Récupérer un ticket spécifique
app.get("/api/tickets/:id", authenticateUser, getTicket);

// Mettre à jour un ticket
app.put("/api/tickets/:id", authenticateUser, updateTicket);

// Diffuser un ticket aux entreprises (régie uniquement)
app.put("/api/tickets/:id/diffuse", authenticateUser, diffuseTicket);

// Supprimer un ticket
app.delete("/api/tickets/:id", authenticateUser, deleteTicket);

// ============================================================================
// ROUTES MISSIONS (Étape 7)
// ============================================================================

// Accepter un ticket et créer une mission
app.post("/api/missions/accept-ticket", authenticateUser, acceptTicket);

// Lister toutes les missions
app.get("/api/missions", authenticateUser, listMissions);

// Récupérer une mission spécifique
app.get("/api/missions/:id", authenticateUser, getMission);

// Mettre à jour une mission
app.put("/api/missions/:id", authenticateUser, updateMission);

// Supprimer une mission
app.delete("/api/missions/:id", authenticateUser, deleteMission);

// Assigner un technicien à une mission
app.put(
  "/api/missions/:id/assign-technicien",
  authenticateUser,
  assignTechnicien
);

// ============================================================================
// ROUTES TECHNICIENS (Étape 8)
// ============================================================================

// Créer un technicien
app.post("/api/techniciens", authenticateUser, createTechnicien);

// Lister tous les techniciens
app.get("/api/techniciens", authenticateUser, listTechniciens);

// Récupérer un technicien spécifique
app.get("/api/techniciens/:id", authenticateUser, getTechnicien);

// Mettre à jour un technicien
app.put("/api/techniciens/:id", authenticateUser, updateTechnicien);

// Supprimer un technicien
app.delete("/api/techniciens/:id", authenticateUser, deleteTechnicien);

// Récupérer les missions d'un technicien
app.get(
  "/api/techniciens/:id/missions",
  authenticateUser,
  getTechnicienMissions
);

// ============================================================================
// ROUTES INTERVENTIONS (Étape 9)
// ============================================================================

// Démarrer une intervention
app.put("/api/interventions/:id/start", authenticateUser, startIntervention);

// Mettre en pause une intervention
app.put("/api/interventions/:id/pause", authenticateUser, pauseIntervention);

// Signaler un retard
app.put("/api/interventions/:id/report-delay", authenticateUser, reportDelay);

// Terminer une intervention avec rapport
app.put(
  "/api/interventions/:id/complete",
  authenticateUser,
  completeIntervention
);

// Ajouter une signature
app.put("/api/interventions/:id/add-signature", authenticateUser, addSignature);

// Générer URL pour upload photo
app.post(
  "/api/interventions/:id/upload-photo",
  authenticateUser,
  getPhotoUploadUrl
);

// Récupérer les photos d'une intervention
app.get(
  "/api/interventions/:id/photos",
  authenticateUser,
  getInterventionPhotos
);

// ============================================================================
// ROUTES FACTURES (Étape 10)
// ============================================================================

// Créer une facture depuis une mission terminée
app.post("/api/factures", authenticateUser, createFacture);

// Lister toutes les factures
app.get("/api/factures", authenticateUser, listFactures);

// Récupérer une facture spécifique
app.get("/api/factures/:id", authenticateUser, getFacture);

// Mettre à jour une facture
app.put("/api/factures/:id", authenticateUser, updateFacture);

// Marquer une facture comme payée (régie)
app.put("/api/factures/:id/pay", authenticateUser, markFacturePaid);

// Supprimer une facture
app.delete("/api/factures/:id", authenticateUser, deleteFacture);

// ============================================================================
// ROUTES MESSAGES (Étape 11)
// ============================================================================

// Envoyer un message
app.post("/api/messages", authenticateUser, sendMessage);

// Lister les conversations
app.get("/api/messages/conversations", authenticateUser, listConversations);

// Récupérer une conversation avec un utilisateur
app.get(
  "/api/messages/conversation/:userId",
  authenticateUser,
  getConversation
);

// Marquer un message comme lu
app.put("/api/messages/:id/read", authenticateUser, markAsRead);

// Marquer tous les messages d'une conversation comme lus
app.put(
  "/api/messages/conversation/:userId/read-all",
  authenticateUser,
  markConversationAsRead
);

// Récupérer les messages liés à un contexte (ticket/mission/facture)
app.get(
  "/api/messages/context/:type/:id",
  authenticateUser,
  getContextMessages
);

// Compter les messages non lus
app.get("/api/messages/unread-count", authenticateUser, getUnreadCount);

// Supprimer un message
app.delete("/api/messages/:id", authenticateUser, deleteMessage);

// ============================================================================
// ROUTES NOTIFICATIONS (Étape 12)
// ============================================================================

// Lister les notifications
app.get("/api/notifications", authenticateUser, listNotifications);

// Récupérer une notification
app.get("/api/notifications/:id", authenticateUser, getNotification);

// Marquer une notification comme lue
app.put(
  "/api/notifications/:id/read",
  authenticateUser,
  markNotificationAsRead
);

// Marquer toutes les notifications comme lues
app.put("/api/notifications/read-all", authenticateUser, markAllAsRead);

// Archiver une notification
app.put(
  "/api/notifications/:id/archive",
  authenticateUser,
  archiveNotification
);

// Compter les notifications non lues
app.get(
  "/api/notifications/unread-count",
  authenticateUser,
  getNotificationUnreadCount
);

// Supprimer une notification archivée
app.delete("/api/notifications/:id", authenticateUser, deleteNotification);

// Créer une notification manuelle (admin uniquement)
app.post("/api/notifications", authenticateUser, createNotification);

// ============================================================================
// ROUTES PLANS & SUBSCRIPTIONS (Étape 13)
// ============================================================================

// Lister les plans disponibles
app.get("/api/plans", authenticateUser, listPlans);

// Récupérer un plan
app.get("/api/plans/:id", authenticateUser, getPlan);

// Créer un plan (admin uniquement)
app.post("/api/plans", authenticateUser, createPlan);

// Mettre à jour un plan (admin uniquement)
app.put("/api/plans/:id", authenticateUser, updatePlan);

// Créer un abonnement
app.post("/api/subscriptions", authenticateUser, createSubscription);

// Récupérer l'abonnement actif
app.get("/api/subscriptions/current", authenticateUser, getCurrentSubscription);

// Changer de plan
app.put("/api/subscriptions/:id/change-plan", authenticateUser, changePlan);

// Annuler un abonnement
app.put("/api/subscriptions/:id/cancel", authenticateUser, cancelSubscription);

// Vérifier les limites du plan
app.get(
  "/api/subscriptions/check-limit/:limit_type",
  authenticateUser,
  checkLimit
);

// ============================================================================
// ROUTES ADMIN DASHBOARD (Étape 14)
// ============================================================================

// Statistiques globales
app.get("/api/admin/stats", authenticateUser, getGlobalStats);

// Statistiques abonnements par plan
app.get(
  "/api/admin/stats/subscriptions-by-plan",
  authenticateUser,
  getSubscriptionsByPlan
);

// Statistiques tickets
app.get("/api/admin/stats/tickets", authenticateUser, getTicketsStats);

// Statistiques missions
app.get("/api/admin/stats/missions", authenticateUser, getMissionsStats);

// Statistiques factures
app.get("/api/admin/stats/factures", authenticateUser, getFacturesStats);

// Top régies
app.get("/api/admin/top/regies", authenticateUser, getTopRegies);

// Top entreprises
app.get("/api/admin/top/entreprises", authenticateUser, getTopEntreprises);

// Évolution mensuelle
app.get("/api/admin/stats/evolution", authenticateUser, getEvolutionMensuelle);

// Abonnements expirant
app.get(
  "/api/admin/subscriptions/expiring",
  authenticateUser,
  getExpiringSubscriptions
);

// Liste régies (pagination)
app.get("/api/admin/regies", authenticateUser, listAllRegies);

// Liste entreprises (pagination)
app.get("/api/admin/entreprises", authenticateUser, listAllEntreprises);

// Liste utilisateurs (pagination)
app.get("/api/admin/users", authenticateUser, listAllUsers);

// Suspendre/Activer abonnement
app.put(
  "/api/admin/subscriptions/:id/toggle",
  authenticateUser,
  toggleSubscription
);

// ============================================================================
// ROUTES PRÉFÉRENCES UTILISATEUR (Étape 15)
// ============================================================================

// Récupérer les préférences
app.get("/api/preferences", authenticateUser, getPreferences);

// Créer/Mettre à jour les préférences
app.put("/api/preferences", authenticateUser, upsertPreferences);

// Réinitialiser les préférences
app.post("/api/preferences/reset", authenticateUser, resetPreferences);

// ============================================================================
// ROUTES PARAMÈTRES APPLICATION (Étape 15)
// ============================================================================

// Récupérer les paramètres de l'entité
app.get("/api/parametres", authenticateUser, getParametres);

// Créer/Mettre à jour les paramètres
app.put("/api/parametres", authenticateUser, upsertParametres);

// Supprimer les paramètres (admin uniquement)
app.delete("/api/parametres/:id", authenticateUser, deleteParametres);

// ============================================================================
// ROUTES WEBHOOKS (Étape 15)
// ============================================================================

// Lister les webhooks
app.get("/api/webhooks", authenticateUser, listWebhooks);

// Créer un webhook
app.post("/api/webhooks", authenticateUser, createWebhook);

// Récupérer un webhook
app.get("/api/webhooks/:id", authenticateUser, getWebhook);

// Mettre à jour un webhook
app.put("/api/webhooks/:id", authenticateUser, updateWebhook);

// Supprimer un webhook
app.delete("/api/webhooks/:id", authenticateUser, deleteWebhook);

// Tester un webhook
app.post("/api/webhooks/:id/test", authenticateUser, testWebhook);

// ============================================================================
// ROUTES LOGS D'ACTIVITÉ (Étape 15)
// ============================================================================

// Lister les logs
app.get("/api/logs", authenticateUser, listLogs);

// Récupérer un log
app.get("/api/logs/:id", authenticateUser, getLog);

// Statistiques des logs
app.get("/api/logs/stats", authenticateUser, getLogsStats);

// Nettoyer les anciens logs (admin)
app.delete("/api/logs/cleanup", authenticateUser, cleanupLogs);

// Exporter les logs (CSV)
app.get("/api/logs/export", authenticateUser, exportLogs);

// ============================================================================
// Gestion des routes 404
// ============================================================================

app.use((req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 Mode: ${process.env.MODE || "demo"}`);
  console.log(`📚 Routes disponibles:`);
  console.log(`   POST   /api/auth/register`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   GET    /api/profile`);
  console.log(`   PUT    /api/profile`);
  console.log(`   POST   /api/regies`);
  console.log(`   GET    /api/regies`);
  console.log(`   GET    /api/regies/:id`);
  console.log(`   PUT    /api/regies/:id`);
  console.log(`   POST   /api/entreprises`);
  console.log(`   GET    /api/entreprises`);
  console.log(`   GET    /api/entreprises/:id`);
  console.log(`   PUT    /api/entreprises/:id`);
  console.log(`   POST   /api/immeubles`);
  console.log(`   GET    /api/immeubles`);
  console.log(`   GET    /api/immeubles/:id`);
  console.log(`   PUT    /api/immeubles/:id`);
  console.log(`   DELETE /api/immeubles/:id`);
  console.log(`   POST   /api/logements`);
  console.log(`   GET    /api/logements`);
  console.log(`   GET    /api/logements/:id`);
  console.log(`   PUT    /api/logements/:id`);
  console.log(`   DELETE /api/logements/:id`);
  console.log(`   POST   /api/locataires`);
  console.log(`   GET    /api/locataires`);
  console.log(`   GET    /api/locataires/:id`);
  console.log(`   PUT    /api/locataires/:id`);
  console.log(`   DELETE /api/locataires/:id`);
  console.log(`   POST   /api/tickets`);
  console.log(`   GET    /api/tickets`);
  console.log(`   GET    /api/tickets/:id`);
  console.log(`   PUT    /api/tickets/:id`);
  console.log(`   PUT    /api/tickets/:id/diffuse`);
  console.log(`   DELETE /api/tickets/:id`);
  console.log(`   POST   /api/missions/accept-ticket`);
  console.log(`   GET    /api/missions`);
  console.log(`   GET    /api/missions/:id`);
  console.log(`   PUT    /api/missions/:id`);
  console.log(`   DELETE /api/missions/:id`);
  console.log(`   PUT    /api/missions/:id/assign-technicien`);
  console.log(`   POST   /api/techniciens`);
  console.log(`   GET    /api/techniciens`);
  console.log(`   GET    /api/techniciens/:id`);
  console.log(`   PUT    /api/techniciens/:id`);
  console.log(`   DELETE /api/techniciens/:id`);
  console.log(`   GET    /api/techniciens/:id/missions`);
  console.log(`   PUT    /api/interventions/:id/start`);
  console.log(`   PUT    /api/interventions/:id/pause`);
  console.log(`   PUT    /api/interventions/:id/report-delay`);
  console.log(`   PUT    /api/interventions/:id/complete`);
  console.log(`   PUT    /api/interventions/:id/add-signature`);
  console.log(`   POST   /api/interventions/:id/upload-photo`);
  console.log(`   GET    /api/interventions/:id/photos`);
  console.log(`   POST   /api/factures`);
  console.log(`   GET    /api/factures`);
  console.log(`   GET    /api/factures/:id`);
  console.log(`   PUT    /api/factures/:id`);
  console.log(`   PUT    /api/factures/:id/pay`);
  console.log(`   DELETE /api/factures/:id`);
  console.log(`   POST   /api/messages`);
  console.log(`   GET    /api/messages/conversations`);
  console.log(`   GET    /api/messages/conversation/:userId`);
  console.log(`   PUT    /api/messages/:id/read`);
  console.log(`   PUT    /api/messages/conversation/:userId/read-all`);
  console.log(`   GET    /api/messages/context/:type/:id`);
  console.log(`   GET    /api/messages/unread-count`);
  console.log(`   DELETE /api/messages/:id`);
  console.log(`   GET    /api/notifications`);
  console.log(`   GET    /api/notifications/:id`);
  console.log(`   PUT    /api/notifications/:id/read`);
  console.log(`   PUT    /api/notifications/read-all`);
  console.log(`   PUT    /api/notifications/:id/archive`);
  console.log(`   GET    /api/notifications/unread-count`);
  console.log(`   DELETE /api/notifications/:id`);
  console.log(`   POST   /api/notifications`);
  console.log(`   GET    /api/plans`);
  console.log(`   GET    /api/plans/:id`);
  console.log(`   POST   /api/plans`);
  console.log(`   PUT    /api/plans/:id`);
  console.log(`   POST   /api/subscriptions`);
  console.log(`   GET    /api/subscriptions/current`);
  console.log(`   PUT    /api/subscriptions/:id/change-plan`);
  console.log(`   PUT    /api/subscriptions/:id/cancel`);
  console.log(`   GET    /api/subscriptions/check-limit/:limit_type`);
  console.log(`   GET    /api/admin/stats`);
  console.log(`   GET    /api/admin/stats/subscriptions-by-plan`);
  console.log(`   GET    /api/admin/stats/tickets`);
  console.log(`   GET    /api/admin/stats/missions`);
  console.log(`   GET    /api/admin/stats/factures`);
  console.log(`   GET    /api/admin/top/regies`);
  console.log(`   GET    /api/admin/top/entreprises`);
  console.log(`   GET    /api/admin/stats/evolution`);
  console.log(`   GET    /api/admin/subscriptions/expiring`);
  console.log(`   GET    /api/admin/regies`);
  console.log(`   GET    /api/admin/entreprises`);
  console.log(`   GET    /api/admin/users`);
  console.log(`   PUT    /api/admin/subscriptions/:id/toggle`);
  console.log(`   GET    /api/preferences`);
  console.log(`   PUT    /api/preferences`);
  console.log(`   POST   /api/preferences/reset`);
  console.log(`   GET    /api/parametres`);
  console.log(`   PUT    /api/parametres`);
  console.log(`   DELETE /api/parametres/:id`);
  console.log(`   GET    /api/webhooks`);
  console.log(`   POST   /api/webhooks`);
  console.log(`   GET    /api/webhooks/:id`);
  console.log(`   PUT    /api/webhooks/:id`);
  console.log(`   DELETE /api/webhooks/:id`);
  console.log(`   POST   /api/webhooks/:id/test`);
  console.log(`   GET    /api/logs`);
  console.log(`   GET    /api/logs/:id`);
  console.log(`   GET    /api/logs/stats`);
  console.log(`   DELETE /api/logs/cleanup`);
  console.log(`   GET    /api/logs/export`);
});

export default app;
