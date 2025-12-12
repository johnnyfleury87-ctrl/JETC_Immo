// ============================================================================
// Fichier : api/factures.js
// Description : Gestion des factures
// ============================================================================

import { supabase } from "./index.js";

// ============================================================================
// ENDPOINT 1 : Créer une facture depuis une mission terminée
// POST /api/factures
// Body: { mission_id, date_echeance (optionnel, par défaut +30 jours) }
// ============================================================================
export async function createFacture(req, res) {
  try {
    const { mission_id, date_echeance } = req.body;
    const userId = req.user.id;

    // Validation des champs requis
    if (!mission_id) {
      return res.status(400).json({ error: "mission_id est requis" });
    }

    // Récupérer la mission avec ses relations
    const { data: mission, error: missionError } = await supabase
      .from("missions")
      .select(
        `
        *,
        ticket:tickets(
          regie_id,
          logement:logements(
            immeuble:immeubles(
              regie_id
            )
          )
        ),
        entreprise:entreprises(
          id,
          nom
        )
      `
      )
      .eq("id", mission_id)
      .single();

    if (missionError || !mission) {
      return res.status(404).json({ error: "Mission non trouvée" });
    }

    // Vérifier que la mission est terminée
    if (mission.statut !== "terminée") {
      return res.status(400).json({
        error: "La mission doit être terminée pour créer une facture",
        statut_actuel: mission.statut,
      });
    }

    // Vérifier que l'utilisateur appartient à l'entreprise de la mission
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("entreprise_id, role")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({ error: "Profil non trouvé" });
    }

    if (profile.role !== "entreprise" && profile.role !== "admin_jtec") {
      return res
        .status(403)
        .json({ error: "Seules les entreprises peuvent créer des factures" });
    }

    if (
      profile.role === "entreprise" &&
      profile.entreprise_id !== mission.entreprise_id
    ) {
      return res.status(403).json({
        error: "Vous ne pouvez créer une facture que pour vos propres missions",
      });
    }

    // Vérifier qu'une facture n'existe pas déjà pour cette mission
    const { data: existingFacture, error: checkError } = await supabase
      .from("factures")
      .select("id")
      .eq("mission_id", mission_id)
      .maybeSingle();

    if (checkError) {
      return res.status(500).json({
        error: "Erreur lors de la vérification des factures existantes",
      });
    }

    if (existingFacture) {
      return res.status(409).json({
        error: "Une facture existe déjà pour cette mission",
        facture_id: existingFacture.id,
      });
    }

    // Récupérer le regie_id depuis le ticket
    const regie_id =
      mission.ticket?.regie_id || mission.ticket?.logement?.immeuble?.regie_id;

    if (!regie_id) {
      return res.status(400).json({
        error: "Impossible de déterminer la régie pour cette facture",
      });
    }

    // Calculer le montant HT à partir des informations de la mission
    // Par défaut, utiliser un tarif basé sur les heures (exemple simple)
    const montant_ht = mission.montant_intervention || 0;

    if (montant_ht <= 0) {
      return res.status(400).json({
        error:
          "Le montant de l'intervention doit être supérieur à 0. Veuillez mettre à jour la mission.",
      });
    }

    // Date d'échéance : +30 jours par défaut
    const dateEcheance =
      date_echeance ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Créer la facture (numero_facture, montant_tva et montant_ttc sont générés automatiquement)
    const { data: facture, error: createError } = await supabase
      .from("factures")
      .insert({
        mission_id,
        entreprise_id: mission.entreprise_id,
        regie_id: regie_id,
        date_emission: new Date().toISOString(),
        date_echeance: dateEcheance,
        montant_ht,
        taux_tva: 20, // Par défaut 20%
        statut_paiement: "en_attente",
      })
      .select()
      .single();

    if (createError) {
      console.error("Erreur création facture:", createError);
      return res
        .status(500)
        .json({ error: "Erreur lors de la création de la facture" });
    }

    // Mettre à jour la mission avec le facture_id
    const { error: updateError } = await supabase
      .from("missions")
      .update({ facture_id: facture.id })
      .eq("id", mission_id);

    if (updateError) {
      console.error("Erreur mise à jour mission:", updateError);
      // Non bloquant
    }

    return res.status(201).json({
      message: "Facture créée avec succès",
      facture,
    });
  } catch (error) {
    console.error("Erreur createFacture:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// ============================================================================
// ENDPOINT 2 : Lister les factures
// GET /api/factures
// Query params: statut_paiement, entreprise_id, regie_id
// ============================================================================
export async function listFactures(req, res) {
  try {
    const userId = req.user.id;
    const { statut_paiement, entreprise_id, regie_id } = req.query;

    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, entreprise_id, regie_id")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({ error: "Profil non trouvé" });
    }

    // Construire la requête de base avec les relations
    let query = supabase
      .from("factures")
      .select(
        `
        *,
        mission:missions(
          id,
          titre,
          description,
          statut,
          date_intervention_debut,
          date_intervention_fin,
          ticket:tickets(
            id,
            titre,
            logement:logements(
              reference,
              immeuble:immeubles(
                nom
              )
            )
          )
        ),
        entreprise:entreprises(
          id,
          nom,
          email,
          telephone
        ),
        regie:regies(
          id,
          nom,
          email,
          telephone
        )
      `
      )
      .order("created_at", { ascending: false });

    // Filtres selon le rôle
    if (profile.role === "entreprise" || profile.role === "technicien") {
      query = query.eq("entreprise_id", profile.entreprise_id);
    } else if (profile.role === "regie") {
      query = query.eq("regie_id", profile.regie_id);
    } else if (profile.role !== "admin_jtec") {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    // Filtres supplémentaires
    if (statut_paiement) {
      query = query.eq("statut_paiement", statut_paiement);
    }
    if (entreprise_id && profile.role === "admin_jtec") {
      query = query.eq("entreprise_id", entreprise_id);
    }
    if (regie_id && profile.role === "admin_jtec") {
      query = query.eq("regie_id", regie_id);
    }

    const { data: factures, error } = await query;

    if (error) {
      console.error("Erreur listFactures:", error);
      return res
        .status(500)
        .json({ error: "Erreur lors de la récupération des factures" });
    }

    return res.json({ factures });
  } catch (error) {
    console.error("Erreur listFactures:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// ============================================================================
// ENDPOINT 3 : Récupérer une facture par ID
// GET /api/factures/:id
// ============================================================================
export async function getFacture(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Récupérer la facture avec toutes les relations
    const { data: facture, error } = await supabase
      .from("factures")
      .select(
        `
        *,
        mission:missions(
          id,
          titre,
          description,
          statut,
          date_intervention_debut,
          date_intervention_fin,
          travaux_realises,
          ticket:tickets(
            id,
            titre,
            description,
            logement:logements(
              reference,
              adresse,
              immeuble:immeubles(
                nom,
                adresse
              )
            ),
            locataire:locataires(
              nom,
              prenom,
              email,
              telephone
            )
          ),
          technicien:profiles(
            id,
            nom,
            prenom,
            email
          )
        ),
        entreprise:entreprises(
          id,
          nom,
          email,
          telephone,
          siret,
          adresse
        ),
        regie:regies(
          id,
          nom,
          email,
          telephone,
          siret,
          adresse
        )
      `
      )
      .eq("id", id)
      .single();

    if (error || !facture) {
      return res.status(404).json({ error: "Facture non trouvée" });
    }

    return res.json({ facture });
  } catch (error) {
    console.error("Erreur getFacture:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// ============================================================================
// ENDPOINT 4 : Mettre à jour une facture
// PUT /api/factures/:id
// Body: champs à modifier (date_echeance, montant_ht, taux_tva, notes, etc.)
// ============================================================================
export async function updateFacture(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, entreprise_id, regie_id")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({ error: "Profil non trouvé" });
    }

    // Récupérer la facture existante
    const { data: existingFacture, error: fetchError } = await supabase
      .from("factures")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingFacture) {
      return res.status(404).json({ error: "Facture non trouvée" });
    }

    // Vérifier les permissions
    if (profile.role === "entreprise" || profile.role === "technicien") {
      // L'entreprise ne peut modifier que ses factures non payées
      if (existingFacture.entreprise_id !== profile.entreprise_id) {
        return res
          .status(403)
          .json({ error: "Vous ne pouvez modifier que vos propres factures" });
      }
      if (["payée", "annulée"].includes(existingFacture.statut_paiement)) {
        return res
          .status(403)
          .json({ error: "Cette facture ne peut plus être modifiée" });
      }
    } else if (profile.role === "regie") {
      // La régie ne peut modifier que le statut de paiement de ses factures
      if (existingFacture.regie_id !== profile.regie_id) {
        return res
          .status(403)
          .json({ error: "Vous ne pouvez modifier que vos propres factures" });
      }
      // Filtrer pour ne garder que les champs autorisés
      const allowedFields = [
        "statut_paiement",
        "date_paiement",
        "montant_paye",
        "mode_paiement",
        "reference_paiement",
        "notes",
      ];
      Object.keys(updates).forEach((key) => {
        if (!allowedFields.includes(key)) {
          delete updates[key];
        }
      });
    } else if (profile.role !== "admin_jtec") {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    // Champs non modifiables directement
    delete updates.id;
    delete updates.numero_facture;
    delete updates.mission_id;
    delete updates.entreprise_id;
    delete updates.regie_id;
    delete updates.montant_tva; // Calculé automatiquement
    delete updates.montant_ttc; // Calculé automatiquement
    delete updates.created_at;
    delete updates.updated_at;

    // Mettre à jour la facture
    const { data: updatedFacture, error: updateError } = await supabase
      .from("factures")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Erreur updateFacture:", updateError);
      return res
        .status(500)
        .json({ error: "Erreur lors de la mise à jour de la facture" });
    }

    return res.json({
      message: "Facture mise à jour avec succès",
      facture: updatedFacture,
    });
  } catch (error) {
    console.error("Erreur updateFacture:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// ============================================================================
// ENDPOINT 5 : Marquer une facture comme payée (régie)
// PUT /api/factures/:id/pay
// Body: { date_paiement, montant_paye, mode_paiement, reference_paiement }
// ============================================================================
export async function markFacturePaid(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { date_paiement, montant_paye, mode_paiement, reference_paiement } =
      req.body;

    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, regie_id")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({ error: "Profil non trouvé" });
    }

    // Seules les régies peuvent marquer une facture comme payée
    if (profile.role !== "regie" && profile.role !== "admin_jtec") {
      return res.status(403).json({
        error: "Seules les régies peuvent marquer une facture comme payée",
      });
    }

    // Récupérer la facture
    const { data: facture, error: fetchError } = await supabase
      .from("factures")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !facture) {
      return res.status(404).json({ error: "Facture non trouvée" });
    }

    // Vérifier que la facture appartient à la régie
    if (profile.role === "regie" && facture.regie_id !== profile.regie_id) {
      return res.status(403).json({
        error: "Vous ne pouvez marquer comme payée que vos propres factures",
      });
    }

    // Validation
    if (!montant_paye || montant_paye <= 0) {
      return res
        .status(400)
        .json({ error: "Le montant payé doit être supérieur à 0" });
    }

    // Déterminer le statut de paiement
    let statut_paiement = "payée";
    if (montant_paye < facture.montant_ttc) {
      statut_paiement = "payée_partiellement";
    }

    // Mettre à jour la facture
    const { data: updatedFacture, error: updateError } = await supabase
      .from("factures")
      .update({
        statut_paiement,
        date_paiement: date_paiement || new Date().toISOString(),
        montant_paye: montant_paye,
        mode_paiement: mode_paiement || null,
        reference_paiement: reference_paiement || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Erreur markFacturePaid:", updateError);
      return res
        .status(500)
        .json({ error: "Erreur lors du marquage de la facture comme payée" });
    }

    return res.json({
      message: "Facture marquée comme payée avec succès",
      facture: updatedFacture,
    });
  } catch (error) {
    console.error("Erreur markFacturePaid:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// ============================================================================
// ENDPOINT 6 : Supprimer une facture (annuler)
// DELETE /api/factures/:id
// ============================================================================
export async function deleteFacture(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, entreprise_id")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({ error: "Profil non trouvé" });
    }

    // Seules les entreprises peuvent supprimer leurs factures
    if (profile.role !== "entreprise" && profile.role !== "admin_jtec") {
      return res.status(403).json({
        error: "Seules les entreprises peuvent supprimer leurs factures",
      });
    }

    // Récupérer la facture
    const { data: facture, error: fetchError } = await supabase
      .from("factures")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !facture) {
      return res.status(404).json({ error: "Facture non trouvée" });
    }

    // Vérifier que la facture appartient à l'entreprise
    if (
      profile.role === "entreprise" &&
      facture.entreprise_id !== profile.entreprise_id
    ) {
      return res
        .status(403)
        .json({ error: "Vous ne pouvez supprimer que vos propres factures" });
    }

    // Vérifier que la facture n'est pas déjà payée
    if (!["en_attente", "annulée"].includes(facture.statut_paiement)) {
      return res.status(403).json({
        error:
          "Seules les factures en attente ou annulées peuvent être supprimées",
        statut_actuel: facture.statut_paiement,
      });
    }

    // Mettre à jour la mission pour retirer la référence à la facture
    if (facture.mission_id) {
      await supabase
        .from("missions")
        .update({ facture_id: null })
        .eq("id", facture.mission_id);
    }

    // Supprimer la facture
    const { error: deleteError } = await supabase
      .from("factures")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Erreur deleteFacture:", deleteError);
      return res
        .status(500)
        .json({ error: "Erreur lors de la suppression de la facture" });
    }

    return res.json({ message: "Facture supprimée avec succès" });
  } catch (error) {
    console.error("Erreur deleteFacture:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
