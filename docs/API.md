# 📚 Documentation API - JETC_Immo

## Vue d'ensemble

API RESTful complète pour la plateforme SaaS de gestion immobilière JETC_Immo.

**Base URL:** `http://localhost:3000/api`  
**Authentification:** Bearer Token (JWT Supabase)  
**Format:** JSON

---

## 🔐 Authentification

### Inscription

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "motdepasse123",
  "role": "regie|entreprise|locataire|technicien",
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "0612345678",
  "is_demo": false
}

Response 201:
{
  "message": "Utilisateur créé avec succès",
  "user": { "id": "uuid", "email": "...", "role": "..." },
  "session": { "access_token": "jwt_token", "refresh_token": "..." }
}
```

### Connexion

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "motdepasse123"
}

Response 200:
{
  "message": "Connexion réussie",
  "user": { ... },
  "session": { "access_token": "jwt_token" }
}
```

**Utilisation du token:**

```http
Authorization: Bearer {access_token}
```

---

## 👤 Profil Utilisateur

### GET /api/profile

Récupérer son profil.

**Response 200:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "regie",
    "nom": "Dupont",
    "prenom": "Jean",
    "telephone": "0612345678",
    "regie_id": "uuid",
    "entreprise_id": null
  }
}
```

### PUT /api/profile

Mettre à jour son profil.

**Body:**

```json
{
  "nom": "Nouveau Nom",
  "prenom": "Nouveau Prénom",
  "telephone": "0698765432",
  "adresse": "123 Rue Example",
  "code_postal": "75001",
  "ville": "Paris"
}
```

---

## 🏢 Régies

### POST /api/regies

Créer une régie (admin ou auto-création).

**Body:**

```json
{
  "nom": "Régie Parisienne",
  "siret": "12345678901234",
  "email": "contact@regie.fr",
  "telephone": "0123456789",
  "adresse": "10 Rue de la Paix",
  "code_postal": "75001",
  "ville": "Paris",
  "nom_responsable": "Martin",
  "prenom_responsable": "Sophie"
}
```

### GET /api/regies

Lister les régies (admin voit toutes, régie voit la sienne).

### GET /api/regies/:id

Détails d'une régie.

### PUT /api/regies/:id

Modifier une régie.

---

## 🏗️ Entreprises

### POST /api/entreprises

Créer une entreprise prestataire.

**Body:**

```json
{
  "nom": "Plomberie Express",
  "siret": "98765432109876",
  "email": "contact@plomberie.fr",
  "telephone": "0198765432",
  "specialites": ["Plomberie", "Chauffage"],
  "zone_intervention": "Île-de-France",
  "tarif_horaire": 65.0
}
```

### GET /api/entreprises

Lister les entreprises.

### GET /api/entreprises/:id

Détails d'une entreprise.

### PUT /api/entreprises/:id

Modifier une entreprise.

---

## 🏘️ Immeubles

### POST /api/immeubles

Créer un immeuble (régie uniquement).

**Body:**

```json
{
  "nom": "Résidence Les Chênes",
  "adresse": "45 Avenue des Fleurs",
  "code_postal": "75015",
  "ville": "Paris",
  "nb_etages": 5,
  "nb_logements": 20,
  "annee_construction": 1995
}
```

### GET /api/immeubles

Lister les immeubles (filtrés par régie).

### GET /api/immeubles/:id

Détails d'un immeuble.

### PUT /api/immeubles/:id

Modifier un immeuble.

### DELETE /api/immeubles/:id

Supprimer un immeuble.

---

## 🏠 Logements

### POST /api/logements

Créer un logement dans un immeuble.

**Body:**

```json
{
  "immeuble_id": "uuid",
  "numero": "3A",
  "etage": 3,
  "type": "T3",
  "superficie": 65.5,
  "nb_pieces": 3,
  "loyer": 1200.0,
  "charges": 150.0
}
```

### GET /api/logements

Lister les logements.

**Query params:** `?immeuble_id=uuid`

### GET /api/logements/:id

Détails d'un logement.

### PUT /api/logements/:id

Modifier un logement.

### DELETE /api/logements/:id

Supprimer un logement.

---

## 👥 Locataires

### POST /api/locataires

Créer un locataire.

**Body:**

```json
{
  "logement_id": "uuid",
  "nom": "Durand",
  "prenom": "Marie",
  "email": "marie.durand@email.com",
  "telephone": "0612345678",
  "date_entree": "2024-01-15"
}
```

### GET /api/locataires

Lister les locataires.

**Query params:** `?logement_id=uuid&immeuble_id=uuid`

### GET /api/locataires/:id

Détails d'un locataire.

### PUT /api/locataires/:id

Modifier un locataire.

### DELETE /api/locataires/:id

Supprimer un locataire (soft delete).

---

## 🎫 Tickets

### POST /api/tickets

Créer un ticket d'intervention.

**Body:**

```json
{
  "logement_id": "uuid",
  "locataire_id": "uuid",
  "titre": "Fuite d'eau dans la salle de bain",
  "description": "L'eau coule sous l'évier depuis ce matin",
  "categorie": "Plomberie",
  "priorite": "haute",
  "date_souhaitee_intervention": "2024-12-15T10:00:00Z"
}
```

**Catégories:** Plomberie, Électricité, Chauffage, Serrurerie, Vitrerie, Maçonnerie, Autre  
**Priorités:** basse, normale, haute, urgente  
**Statuts:** nouveau, diffuse, en_attente_devis, accepte, en_cours, termine, cloture, annule

### GET /api/tickets

Lister les tickets (filtrés selon rôle).

**Query params:** `?statut=nouveau&priorite=haute&logement_id=uuid`

### GET /api/tickets/:id

Détails d'un ticket.

### PUT /api/tickets/:id

Modifier un ticket.

**Body (régie):**

```json
{
  "statut": "diffuse",
  "priorite": "urgente",
  "date_souhaitee_intervention": "2024-12-16T09:00:00Z"
}
```

### PUT /api/tickets/:id/diffuse

Diffuser un ticket aux entreprises (régie uniquement).

**Body:**

```json
{
  "diffusion_mode": "general|restreint",
  "entreprises_autorisees": ["uuid1", "uuid2"]
}
```

### DELETE /api/tickets/:id

Supprimer un ticket.

---

## 🔧 Missions

### POST /api/missions/accept-ticket

Accepter un ticket et créer une mission (entreprise uniquement).

**Body:**

```json
{
  "ticket_id": "uuid",
  "titre": "Réparation fuite",
  "description": "Intervention pour réparer la fuite",
  "date_intervention_prevue": "2024-12-16T14:00:00Z",
  "duree_estimee_minutes": 120,
  "montant_estime": 350.0,
  "materiel_necessaire": "Joint, silicone, clé à molette"
}
```

### GET /api/missions

Lister les missions.

**Query params:** `?statut=planifiee&ticket_id=uuid`

**Statuts:** planifiee, en_cours, terminee, annulee

### GET /api/missions/:id

Détails d'une mission.

### PUT /api/missions/:id

Modifier une mission.

### PUT /api/missions/:id/assign-technicien

Assigner un technicien à une mission.

**Body:**

```json
{
  "technicien_id": "uuid",
  "date_intervention_prevue": "2024-12-16T14:00:00Z"
}
```

### DELETE /api/missions/:id

Supprimer une mission.

---

## 👷 Techniciens

### POST /api/techniciens

Créer un technicien (entreprise uniquement).

**Body:**

```json
{
  "nom": "Laurent",
  "prenom": "Pierre",
  "email": "pierre.laurent@plomberie.fr",
  "telephone": "0623456789",
  "specialites": ["Plomberie", "Chauffage"],
  "numero_carte_pro": "12345ABC"
}
```

### GET /api/techniciens

Lister les techniciens de son entreprise.

### GET /api/techniciens/:id

Détails d'un technicien.

### PUT /api/techniciens/:id

Modifier un technicien.

### DELETE /api/techniciens/:id

Supprimer un technicien.

### GET /api/techniciens/:id/missions

Lister les missions d'un technicien.

---

## 🛠️ Interventions

### PUT /api/interventions/:id/start

Démarrer une intervention (technicien).

**Body:**

```json
{
  "date_debut_reel": "2024-12-16T14:05:00Z"
}
```

### PUT /api/interventions/:id/pause

Mettre en pause une intervention.

### PUT /api/interventions/:id/report-delay

Signaler un retard.

**Body:**

```json
{
  "motif_retard": "Embouteillages",
  "nouvelle_date_prevue": "2024-12-16T15:30:00Z"
}
```

### PUT /api/interventions/:id/complete

Terminer une intervention avec rapport.

**Body:**

```json
{
  "date_fin_reel": "2024-12-16T16:30:00Z",
  "travaux_realises": "Remplacement du joint + application silicone",
  "materiel_utilise": ["Joint 40mm", "Silicone sanitaire"],
  "rapport_intervention": "Intervention réussie, fuite réparée",
  "montant_final": 380.0
}
```

### PUT /api/interventions/:id/add-signature

Ajouter une signature (client ou technicien).

**Body:**

```json
{
  "type": "client|technicien",
  "signature_data_url": "data:image/png;base64,..."
}
```

### POST /api/interventions/:id/upload-photo

Générer une URL signée pour upload photo.

**Response:**

```json
{
  "uploadUrl": "https://supabase.co/storage/...",
  "publicUrl": "https://...",
  "path": "missions/uuid/photo_123.jpg"
}
```

### GET /api/interventions/:id/photos

Récupérer les URLs des photos d'une intervention.

---

## 💰 Factures

### POST /api/factures

Créer une facture depuis une mission terminée.

**Body:**

```json
{
  "mission_id": "uuid",
  "date_emission": "2024-12-16",
  "date_echeance": "2025-01-15",
  "montant_ht": 316.67,
  "tva_taux": 20.0,
  "montant_ttc": 380.0,
  "notes": "Paiement par virement"
}
```

**Numéro facture généré automatiquement:** `FAC-2024-00001`

### GET /api/factures

Lister les factures.

**Query params:** `?statut_paiement=en_attente&mission_id=uuid`

**Statuts:** en_attente, payee, en_retard, annulee

### GET /api/factures/:id

Détails d'une facture.

### PUT /api/factures/:id

Modifier une facture.

### PUT /api/factures/:id/pay

Marquer une facture comme payée (régie).

**Body:**

```json
{
  "date_paiement": "2024-12-20",
  "mode_paiement": "virement",
  "reference_paiement": "VIR123456"
}
```

### DELETE /api/factures/:id

Supprimer une facture.

---

## 💬 Messagerie

### POST /api/messages

Envoyer un message.

**Body:**

```json
{
  "recipient_id": "uuid",
  "sujet": "Question sur intervention",
  "contenu": "Bonjour, je souhaite...",
  "type_message": "standard",
  "ticket_id": "uuid",
  "attachments_urls": ["url1", "url2"]
}
```

**Types:** standard, system, notification, urgence

### GET /api/messages/conversations

Lister ses conversations avec nombre de non lus.

### GET /api/messages/conversation/:userId

Récupérer tous les messages avec un utilisateur.

### PUT /api/messages/:id/read

Marquer un message comme lu.

### PUT /api/messages/conversation/:userId/read-all

Marquer toute une conversation comme lue.

### GET /api/messages/context/:type/:id

Récupérer les messages liés à un contexte (ticket/mission/facture).

### GET /api/messages/unread-count

Compter les messages non lus.

### DELETE /api/messages/:id

Supprimer un message (15 minutes max).

---

## 🔔 Notifications

### GET /api/notifications

Lister les notifications.

**Query params:** `?lu=false&type=nouveau_ticket&limit=50`

**Types:** nouveau_ticket, mission_planifiee, mission_en_cours, mission_terminee, facture_creee, facture_payee, message_recu, retard_signale, ticket_diffuse, ticket_accepte, ticket_refuse, abonnement_expire, limite_atteinte, webhook_echec, alerte_systeme, autre

**Priorités:** basse, normale, haute, urgente

### GET /api/notifications/:id

Détails d'une notification.

### PUT /api/notifications/:id/read

Marquer comme lue.

### PUT /api/notifications/read-all

Marquer toutes comme lues.

### PUT /api/notifications/:id/archive

Archiver une notification.

### GET /api/notifications/unread-count

Compter les notifications non lues.

### DELETE /api/notifications/:id

Supprimer une notification (seulement si archivée).

### POST /api/notifications (admin)

Créer une notification manuellement.

---

## 📦 Plans & Abonnements

### GET /api/plans

Lister les plans disponibles.

**Query params:** `?type_entite=regie&est_visible=true`

**Response:**

```json
{
  "plans": [
    {
      "id": "uuid",
      "nom": "Plan Starter",
      "type_entite": "regie",
      "prix_mensuel": 49.0,
      "prix_annuel": 490.0,
      "max_immeubles": 10,
      "max_logements": 50,
      "max_tickets_par_mois": 100,
      "features": { "reporting": true, "api": false },
      "module_facturation": true
    }
  ]
}
```

### GET /api/plans/:id

Détails d'un plan.

### POST /api/plans (admin)

Créer un plan.

### PUT /api/plans/:id (admin)

Modifier un plan.

### POST /api/subscriptions

Créer un abonnement.

**Body:**

```json
{
  "plan_id": "uuid",
  "frequence_paiement": "mensuel|annuel"
}
```

### GET /api/subscriptions/current

Récupérer son abonnement actif.

### PUT /api/subscriptions/:id/change-plan

Changer de plan.

**Body:**

```json
{
  "nouveau_plan_id": "uuid"
}
```

### PUT /api/subscriptions/:id/cancel

Annuler un abonnement.

### GET /api/subscriptions/check-limit/:limit_type

Vérifier si on peut créer une ressource.

**limit_type:** immeubles, logements, locataires, tickets, missions, techniciens

---

## 📊 Dashboard Admin

### GET /api/admin/stats

Statistiques globales de la plateforme.

**Response:**

```json
{
  "stats": {
    "total_regies": 150,
    "regies_actives": 120,
    "total_entreprises": 80,
    "entreprises_actives": 65,
    "revenus_mensuels_recurrents": 12500.0,
    "abonnements_actifs": 185,
    "tickets_en_attente": 45
  }
}
```

### GET /api/admin/stats/subscriptions-by-plan

Abonnements par plan.

### GET /api/admin/stats/tickets

Statistiques tickets (par statut et priorité).

### GET /api/admin/stats/missions

Statistiques missions.

### GET /api/admin/stats/factures

Statistiques factures.

### GET /api/admin/top/regies

Top 50 régies par activité.

### GET /api/admin/top/entreprises

Top 50 entreprises par CA.

### GET /api/admin/stats/evolution

Évolution sur 12 mois.

### GET /api/admin/subscriptions/expiring

Abonnements expirant dans 30 jours.

### GET /api/admin/regies

Liste paginée des régies.

**Query params:** `?page=1&limit=20&search=paris&subscription_actif=true`

### GET /api/admin/entreprises

Liste paginée des entreprises.

### GET /api/admin/users

Liste paginée des utilisateurs.

**Query params:** `?role=regie`

### PUT /api/admin/subscriptions/:id/toggle

Suspendre/activer un abonnement.

**Body:**

```json
{
  "statut": "actif|suspendu|annule"
}
```

---

## ⚙️ Préférences Utilisateur

### GET /api/preferences

Récupérer ses préférences (avec valeurs par défaut).

### PUT /api/preferences

Mettre à jour ses préférences.

**Body:**

```json
{
  "theme": "dark",
  "langue": "fr",
  "notifications_email": true,
  "notifications_push": false,
  "vue_par_defaut": "kanban",
  "elements_par_page": 50,
  "widgets_dashboard": ["stats", "tickets_recents", "missions_en_cours"],
  "timezone": "Europe/Paris",
  "format_date": "DD/MM/YYYY"
}
```

### POST /api/preferences/reset

Réinitialiser aux valeurs par défaut.

---

## 🔧 Paramètres Application

### GET /api/parametres

Récupérer les paramètres de son entité.

### PUT /api/parametres

Mettre à jour les paramètres.

**Body:**

```json
{
  "delai_reponse_max_heures": 24,
  "priorites_actives": ["normale", "haute", "urgente"],
  "auto_assignation_tickets": true,
  "mode_facturation": "mission",
  "tva_par_defaut": 20.0,
  "webhook_actif": true,
  "logo_url": "https://...",
  "couleur_primaire": "#1E40AF"
}
```

### DELETE /api/parametres/:id (admin)

Supprimer des paramètres.

---

## 🔗 Webhooks

### GET /api/webhooks

Lister ses webhooks.

### POST /api/webhooks

Créer un webhook.

**Body:**

```json
{
  "nom": "Notification Slack",
  "url": "https://hooks.slack.com/services/...",
  "methode": "POST",
  "headers": { "Content-Type": "application/json" },
  "secret": "mon_secret_hmac",
  "evenements": ["ticket_cree", "mission_terminee", "facture_payee"],
  "retry_max": 3,
  "timeout_secondes": 30
}
```

**Événements disponibles:**

- ticket_cree, ticket_diffuse, ticket_accepte, ticket_cloture
- mission_creee, mission_planifiee, mission_en_cours, mission_terminee
- facture_creee, facture_payee
- message_recu, notification_urgente

### GET /api/webhooks/:id

Détails d'un webhook.

### PUT /api/webhooks/:id

Modifier un webhook.

### DELETE /api/webhooks/:id

Supprimer un webhook.

### POST /api/webhooks/:id/test

Tester un webhook.

---

## 📜 Logs d'Activité

### GET /api/logs

Lister les logs (ses logs ou tous si admin).

**Query params:** `?action=login&statut=error&date_debut=2024-12-01&limit=100&page=1`

### GET /api/logs/:id

Détails d'un log.

### GET /api/logs/stats (admin)

Statistiques d'activité.

**Query params:** `?periode=7` (derniers X jours)

### DELETE /api/logs/cleanup (admin)

Nettoyer les anciens logs.

**Body:**

```json
{
  "jours_retention": 90
}
```

### GET /api/logs/export (admin)

Exporter les logs en CSV.

---

## 🔒 Sécurité

### Authentification

Toutes les routes (sauf `/auth/*`) nécessitent un token JWT valide.

### Row Level Security (RLS)

Politiques PostgreSQL garantissent l'isolation des données:

- Régie voit uniquement ses immeubles/logements/locataires
- Entreprise voit uniquement ses missions/techniciens
- Locataire voit uniquement ses tickets
- Admin voit tout

### Webhooks HMAC

Signature des payloads webhook avec `X-Webhook-Signature` (SHA-256).

### Logs d'audit

Toutes les actions importantes sont enregistrées dans `logs_activite`.

---

## 📦 Codes d'erreur

| Code | Description                      |
| ---- | -------------------------------- |
| 200  | Succès                           |
| 201  | Ressource créée                  |
| 400  | Requête invalide                 |
| 401  | Non authentifié                  |
| 403  | Accès refusé                     |
| 404  | Ressource non trouvée            |
| 409  | Conflit (ex: email déjà utilisé) |
| 500  | Erreur serveur                   |

**Format erreur:**

```json
{
  "error": "Description de l'erreur"
}
```

---

## 🚀 Exemples d'intégration

### Créer un ticket complet

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"regie@example.com","password":"password"}'

# 2. Créer un ticket
curl -X POST http://localhost:3000/api/tickets \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "logement_id":"uuid",
    "locataire_id":"uuid",
    "titre":"Fuite d'eau",
    "description":"Urgent",
    "categorie":"Plomberie",
    "priorite":"urgente"
  }'

# 3. Diffuser le ticket
curl -X PUT http://localhost:3000/api/tickets/{id}/diffuse \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"diffusion_mode":"general"}'
```

### Suivre une mission (entreprise)

```bash
# 1. Accepter le ticket
curl -X POST http://localhost:3000/api/missions/accept-ticket \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_id":"uuid",
    "titre":"Réparation",
    "date_intervention_prevue":"2024-12-16T14:00:00Z",
    "montant_estime":350
  }'

# 2. Assigner un technicien
curl -X PUT http://localhost:3000/api/missions/{id}/assign-technicien \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"technicien_id":"uuid"}'

# 3. Démarrer l'intervention
curl -X PUT http://localhost:3000/api/interventions/{id}/start \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"date_debut_reel":"2024-12-16T14:05:00Z"}'

# 4. Terminer l'intervention
curl -X PUT http://localhost:3000/api/interventions/{id}/complete \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "date_fin_reel":"2024-12-16T16:00:00Z",
    "travaux_realises":"Réparation effectuée",
    "montant_final":380
  }'

# 5. Créer la facture
curl -X POST http://localhost:3000/api/factures \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "mission_id":"uuid",
    "montant_ht":316.67,
    "tva_taux":20,
    "montant_ttc":380
  }'
```

---

## 📞 Support

- **Documentation technique:** `/docs/API.md`
- **Guide déploiement:** `/docs/DEPLOYMENT.md`
- **Issues GitHub:** https://github.com/johnnyfleury87-ctrl/JETC_Immo/issues
