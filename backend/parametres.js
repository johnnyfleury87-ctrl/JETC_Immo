// ============================================================================
// Fichier : api/parametres.js
// Description : API de gestion des paramètres d'application (Étape 15)
// ============================================================================

import { supabaseServer } from "./_supabase.js";

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
// ENDPOINT 1 : Récupérer les paramètres de son entité
// GET /api/parametres
// ============================================================================
export async function getParametres(req, res) {
  try {
    const userId = req.user.id;
    const profile = await getUserEntity(userId);

    let query = supabaseServer.from("parametres_application").select("*");

    if (profile.role === "regie" || profile.role === "locataire") {
      query = query.eq("regie_id", profile.regie_id);
    } else if (profile.role === "entreprise" || profile.role === "technicien") {
      query = query.eq("entreprise_id", profile.entreprise_id);
    } else if (profile.role === "admin_jtec") {
      // Admin peut demander les paramètres d'une entité spécifique
      const { regie_id, entreprise_id } = req.query;
      if (regie_id) {
        query = query.eq("regie_id", regie_id);
      } else if (entreprise_id) {
        query = query.eq("entreprise_id", entreprise_id);
      } else {
        return res
          .status(400)
          .json({ error: "Admin doit spécifier regie_id ou entreprise_id" });
      }
    }

    const { data: parametres, error } = await query.single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    // Si pas de paramètres, retourner les valeurs par défaut
    if (!parametres) {
      return res.json({
        parametres: null,
        message: "Aucun paramètre configuré. Valeurs par défaut utilisées.",
      });
    }

    return res.json({ parametres });
  } catch (error) {
    console.error("Erreur récupération paramètres:", error);
    return res.status(500).json({ error: error.message || "Erreur serveur" });
  }
}

// ============================================================================
// ENDPOINT 2 : Créer ou mettre à jour les paramètres
// PUT /api/parametres
// ============================================================================
export async function upsertParametres(req, res) {
  try {
    const userId = req.user.id;
    const profile = await getUserEntity(userId);

    // Vérifier les droits
    if (!["regie", "entreprise", "admin_jtec"].includes(profile.role)) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const {
      delai_reponse_max_heures,
      priorites_actives,
      categories_personnalisees,
      auto_assignation_tickets,
      duree_intervention_defaut_minutes,
      delai_alerte_retard_minutes,
      validation_rapport_obligatoire,
      signature_client_obligatoire,
      mode_facturation,
      delai_paiement_jours,
      tva_par_defaut,
      conditions_generales,
      email_notifications_auto,
      modeles_email,
      signature_email,
      webhook_actif,
      api_publique_active,
      cle_api_publique,
      logo_url,
      couleur_primaire,
      couleur_secondaire,
    } = req.body;

    // Construire l'objet de mise à jour
    const updates = {};

    // Identifier l'entité
    if (profile.role === "regie") {
      updates.regie_id = profile.regie_id;
    } else if (profile.role === "entreprise") {
      updates.entreprise_id = profile.entreprise_id;
    } else if (profile.role === "admin_jtec") {
      // Admin doit spécifier l'entité
      const { regie_id, entreprise_id } = req.body;
      if (regie_id) {
        updates.regie_id = regie_id;
      } else if (entreprise_id) {
        updates.entreprise_id = entreprise_id;
      } else {
        return res
          .status(400)
          .json({ error: "Spécifier regie_id ou entreprise_id" });
      }
    }

    // Ajouter les champs modifiables
    if (delai_reponse_max_heures !== undefined)
      updates.delai_reponse_max_heures = delai_reponse_max_heures;
    if (priorites_actives !== undefined)
      updates.priorites_actives = priorites_actives;
    if (categories_personnalisees !== undefined)
      updates.categories_personnalisees = categories_personnalisees;
    if (auto_assignation_tickets !== undefined)
      updates.auto_assignation_tickets = auto_assignation_tickets;
    if (duree_intervention_defaut_minutes !== undefined)
      updates.duree_intervention_defaut_minutes =
        duree_intervention_defaut_minutes;
    if (delai_alerte_retard_minutes !== undefined)
      updates.delai_alerte_retard_minutes = delai_alerte_retard_minutes;
    if (validation_rapport_obligatoire !== undefined)
      updates.validation_rapport_obligatoire = validation_rapport_obligatoire;
    if (signature_client_obligatoire !== undefined)
      updates.signature_client_obligatoire = signature_client_obligatoire;
    if (mode_facturation !== undefined)
      updates.mode_facturation = mode_facturation;
    if (delai_paiement_jours !== undefined)
      updates.delai_paiement_jours = delai_paiement_jours;
    if (tva_par_defaut !== undefined) updates.tva_par_defaut = tva_par_defaut;
    if (conditions_generales !== undefined)
      updates.conditions_generales = conditions_generales;
    if (email_notifications_auto !== undefined)
      updates.email_notifications_auto = email_notifications_auto;
    if (modeles_email !== undefined) updates.modeles_email = modeles_email;
    if (signature_email !== undefined)
      updates.signature_email = signature_email;
    if (webhook_actif !== undefined) updates.webhook_actif = webhook_actif;
    if (api_publique_active !== undefined)
      updates.api_publique_active = api_publique_active;
    if (cle_api_publique !== undefined)
      updates.cle_api_publique = cle_api_publique;
    if (logo_url !== undefined) updates.logo_url = logo_url;
    if (couleur_primaire !== undefined)
      updates.couleur_primaire = couleur_primaire;
    if (couleur_secondaire !== undefined)
      updates.couleur_secondaire = couleur_secondaire;

    // Déterminer la colonne unique pour upsert
    const onConflict = updates.regie_id ? "regie_id" : "entreprise_id";

    const { data: parametres, error } = await supabaseServer
      .from("parametres_application")
      .upsert(updates, { onConflict })
      .select()
      .single();

    if (error) throw error;

    return res.json({
      message: "Paramètres enregistrés",
      parametres,
    });
  } catch (error) {
    console.error("Erreur mise à jour paramètres:", error);
    return res.status(500).json({ error: error.message || "Erreur serveur" });
  }
}

// ============================================================================
// ENDPOINT 3 : Supprimer les paramètres (admin uniquement)
// DELETE /api/parametres/:id
// ============================================================================
export async function deleteParametres(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Vérifier que c'est un admin
    const { data: profile, error: profileError } = await supabaseServer
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError || profile.role !== "admin_jtec") {
      return res
        .status(403)
        .json({ error: "Accès réservé aux administrateurs" });
    }

    const { error } = await supabaseServer
      .from("parametres_application")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return res.json({ message: "Paramètres supprimés" });
  } catch (error) {
    console.error("Erreur suppression paramètres:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
