// ============================================================================
// Fichier : api/webhooks.js
// Description : API de gestion des webhooks (Étape 15)
// ============================================================================

import { supabaseServer } from "./_supabase.js";
import crypto from "crypto";

// ============================================================================
// Helper : Récupérer l'entité de l'utilisateur
// ============================================================================
async function getUserEntity(userId) {
  const { data: profile, error } = await supabaseServer
    .from("profiles")
    .select("role, regie_id, entreprise_id")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    throw new Error("Profil non trouvé");
  }

  return profile;
}

// ============================================================================
// Helper : Appeler un webhook
// ============================================================================
export async function callWebhook(webhookId, eventType, payload) {
  try {
    const { data: webhook, error } = await supabaseServer
      .from("webhooks")
      .select("*")
      .eq("id", webhookId)
      .eq("est_actif", true)
      .single();

    if (error || !webhook) {
      console.log("Webhook non trouvé ou inactif:", webhookId);
      return;
    }

    // Vérifier que l'événement est dans la liste
    if (!webhook.evenements.includes(eventType)) {
      return;
    }

    // Préparer la signature HMAC si secret défini
    const timestamp = Date.now();
    const body = JSON.stringify({ event: eventType, timestamp, data: payload });

    let signature = null;
    if (webhook.secret) {
      signature = crypto
        .createHmac("sha256", webhook.secret)
        .update(body)
        .digest("hex");
    }

    // Préparer les headers
    const headers = {
      "Content-Type": "application/json",
      "X-Webhook-Event": eventType,
      "X-Webhook-Timestamp": timestamp.toString(),
      ...webhook.headers,
    };

    if (signature) {
      headers["X-Webhook-Signature"] = signature;
    }

    // Effectuer l'appel avec retry
    let lastError = null;
    let success = false;

    for (let attempt = 0; attempt <= webhook.retry_max; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          webhook.timeout_secondes * 1000
        );

        const response = await fetch(webhook.url, {
          method: webhook.methode,
          headers,
          body,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          success = true;
          break;
        } else {
          lastError = `HTTP ${response.status}: ${await response.text()}`;
        }
      } catch (err) {
        lastError = err.message;
      }

      // Attendre avant le prochain retry
      if (attempt < webhook.retry_max) {
        await new Promise((resolve) =>
          setTimeout(resolve, webhook.retry_delai_secondes * 1000)
        );
      }
    }

    // Mettre à jour les statistiques
    const updates = {
      nb_appels_total: webhook.nb_appels_total + 1,
      dernier_appel: new Date().toISOString(),
      dernier_statut: success ? "success" : "error",
    };

    if (success) {
      updates.nb_appels_succes = webhook.nb_appels_succes + 1;
      updates.dernier_message_erreur = null;
    } else {
      updates.nb_appels_echec = webhook.nb_appels_echec + 1;
      updates.dernier_message_erreur = lastError;
    }

    await supabaseServer.from("webhooks").update(updates).eq("id", webhookId);

    return success;
  } catch (error) {
    console.error("Erreur appel webhook:", error);
    return false;
  }
}

// ============================================================================
// ENDPOINT 1 : Lister les webhooks de son entité
// GET /api/webhooks
// ============================================================================
export async function listWebhooks(req, res) {
  try {
    const userId = req.user.id;
    const profile = await getUserEntity(userId);

    let query = supabaseServer
      .from("webhooks")
      .select("*")
      .order("created_at", { ascending: false });

    if (profile.role === "regie") {
      query = query.eq("regie_id", profile.regie_id);
    } else if (profile.role === "entreprise") {
      query = query.eq("entreprise_id", profile.entreprise_id);
    } else if (profile.role === "admin_jtec") {
      // Admin voit tous les webhooks (ou filtré par query params)
      const { regie_id, entreprise_id } = req.query;
      if (regie_id) {
        query = query.eq("regie_id", regie_id);
      } else if (entreprise_id) {
        query = query.eq("entreprise_id", entreprise_id);
      }
    } else {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const { data: webhooks, error } = await query;

    if (error) throw error;

    return res.json({ webhooks });
  } catch (error) {
    console.error("Erreur liste webhooks:", error);
    return res.status(500).json({ error: error.message || "Erreur serveur" });
  }
}

// ============================================================================
// ENDPOINT 2 : Créer un webhook
// POST /api/webhooks
// ============================================================================
export async function createWebhook(req, res) {
  try {
    const userId = req.user.id;
    const profile = await getUserEntity(userId);

    if (!["regie", "entreprise", "admin_jtec"].includes(profile.role)) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const {
      nom,
      url,
      methode,
      headers,
      secret,
      evenements,
      retry_max,
      retry_delai_secondes,
      timeout_secondes,
    } = req.body;

    // Validation
    if (!nom || !url || !evenements || evenements.length === 0) {
      return res.status(400).json({
        error: "Champs obligatoires: nom, url, evenements",
      });
    }

    const webhook = {
      nom,
      url,
      methode: methode || "POST",
      headers: headers || {},
      evenements,
      est_actif: true,
    };

    // Identifier l'entité
    if (profile.role === "regie") {
      webhook.regie_id = profile.regie_id;
    } else if (profile.role === "entreprise") {
      webhook.entreprise_id = profile.entreprise_id;
    } else if (profile.role === "admin_jtec") {
      const { regie_id, entreprise_id } = req.body;
      if (regie_id) {
        webhook.regie_id = regie_id;
      } else if (entreprise_id) {
        webhook.entreprise_id = entreprise_id;
      } else {
        return res
          .status(400)
          .json({ error: "Spécifier regie_id ou entreprise_id" });
      }
    }

    if (secret) webhook.secret = secret;
    if (retry_max !== undefined) webhook.retry_max = retry_max;
    if (retry_delai_secondes !== undefined)
      webhook.retry_delai_secondes = retry_delai_secondes;
    if (timeout_secondes !== undefined)
      webhook.timeout_secondes = timeout_secondes;

    const { data: newWebhook, error } = await supabaseServer
      .from("webhooks")
      .insert(webhook)
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      message: "Webhook créé",
      webhook: newWebhook,
    });
  } catch (error) {
    console.error("Erreur création webhook:", error);
    return res.status(500).json({ error: error.message || "Erreur serveur" });
  }
}

// ============================================================================
// ENDPOINT 3 : Récupérer un webhook
// GET /api/webhooks/:id
// ============================================================================
export async function getWebhook(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data: webhook, error } = await supabaseServer
      .from("webhooks")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !webhook) {
      return res.status(404).json({ error: "Webhook non trouvé" });
    }

    return res.json({ webhook });
  } catch (error) {
    console.error("Erreur récupération webhook:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// ============================================================================
// ENDPOINT 4 : Mettre à jour un webhook
// PUT /api/webhooks/:id
// ============================================================================
export async function updateWebhook(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const {
      nom,
      url,
      methode,
      headers,
      secret,
      evenements,
      est_actif,
      retry_max,
      retry_delai_secondes,
      timeout_secondes,
    } = req.body;

    const updates = {};
    if (nom !== undefined) updates.nom = nom;
    if (url !== undefined) updates.url = url;
    if (methode !== undefined) updates.methode = methode;
    if (headers !== undefined) updates.headers = headers;
    if (secret !== undefined) updates.secret = secret;
    if (evenements !== undefined) updates.evenements = evenements;
    if (est_actif !== undefined) updates.est_actif = est_actif;
    if (retry_max !== undefined) updates.retry_max = retry_max;
    if (retry_delai_secondes !== undefined)
      updates.retry_delai_secondes = retry_delai_secondes;
    if (timeout_secondes !== undefined)
      updates.timeout_secondes = timeout_secondes;

    const { data: webhook, error } = await supabaseServer
      .from("webhooks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.json({
      message: "Webhook mis à jour",
      webhook,
    });
  } catch (error) {
    console.error("Erreur mise à jour webhook:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// ============================================================================
// ENDPOINT 5 : Supprimer un webhook
// DELETE /api/webhooks/:id
// ============================================================================
export async function deleteWebhook(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabaseServer
      .from("webhooks")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return res.json({ message: "Webhook supprimé" });
  } catch (error) {
    console.error("Erreur suppression webhook:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// ============================================================================
// ENDPOINT 6 : Tester un webhook
// POST /api/webhooks/:id/test
// ============================================================================
export async function testWebhook(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data: webhook, error } = await supabaseServer
      .from("webhooks")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !webhook) {
      return res.status(404).json({ error: "Webhook non trouvé" });
    }

    const testPayload = {
      test: true,
      message: "Ceci est un test de webhook",
      timestamp: new Date().toISOString(),
    };

    const success = await callWebhook(id, "test", testPayload);

    return res.json({
      message: success ? "Webhook testé avec succès" : "Échec du test webhook",
      success,
    });
  } catch (error) {
    console.error("Erreur test webhook:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
