import { supabaseServer } from "./_supabase.js";
import { authenticateUser } from "./profile.js";

/**
 * POST /api/logements
 * Création d'un nouveau logement
 *
 * Body attendu :
 * {
 *   immeuble_id: uuid (obligatoire),
 *   numero: string (obligatoire),
 *   etage?: number,
 *   superficie_m2?: number,
 *   nombre_pieces?: number,
 *   type_logement?: 'studio' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5+' | 'autre',
 *   statut?: 'occupé' | 'vacant' | 'en_travaux' | 'hors_service',
 *   is_demo?: boolean
 * }
 */
export async function createLogement(req, res) {
  try {
    const {
      immeuble_id,
      numero,
      etage,
      superficie_m2,
      nombre_pieces,
      type_logement,
      statut = "vacant",
      is_demo = false,
    } = req.body;

    // Validation des champs obligatoires
    if (!immeuble_id || !numero) {
      return res.status(400).json({
        error: "Les champs immeuble_id et numero sont obligatoires",
      });
    }

    const userProfile = req.profile;

    // Vérification du rôle
    if (userProfile.role !== "regie" && userProfile.role !== "admin_jtec") {
      return res.status(403).json({
        error: "Vous n'avez pas les droits pour créer un logement",
      });
    }

    // Vérifier que l'immeuble existe et appartient à la régie
    const { data: immeubleData, error: immeubleError } = await supabaseServer
      .from("immeubles")
      .select("*")
      .eq("id", immeuble_id)
      .single();

    if (immeubleError || !immeubleData) {
      return res.status(404).json({
        error: "Immeuble non trouvé",
      });
    }

    // Vérifier les droits sur l'immeuble
    if (
      userProfile.role === "regie" &&
      userProfile.regie_id !== immeubleData.regie_id
    ) {
      return res.status(403).json({
        error: "Vous n'avez pas accès à cet immeuble",
      });
    }

    // Création du logement
    const { data: logementData, error: logementError } = await supabaseServer
      .from("logements")
      .insert({
        immeuble_id,
        numero,
        etage,
        superficie_m2,
        nombre_pieces,
        type_logement,
        statut,
        is_demo,
      })
      .select()
      .single();

    if (logementError) {
      console.error("Erreur création logement:", logementError);

      // Gestion de l'erreur d'unicité
      if (logementError.code === "23505") {
        return res.status(400).json({
          error: "Un logement avec ce numéro existe déjà dans cet immeuble",
        });
      }

      return res.status(500).json({
        error: "Erreur lors de la création du logement",
        details: logementError.message,
      });
    }

    return res.status(201).json({
      message: "Logement créé avec succès",
      logement: logementData,
    });
  } catch (error) {
    console.error("Erreur serveur lors de la création du logement:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}

/**
 * GET /api/logements
 * Liste les logements
 * Query params :
 * - immeuble_id: filtrer par immeuble
 * - statut: filtrer par statut
 */
export async function listLogements(req, res) {
  try {
    const userProfile = req.profile;
    const { immeuble_id, statut } = req.query;

    let query = supabaseServer
      .from("logements")
      .select(
        `
        *,
        immeubles:immeuble_id (
          id,
          nom,
          adresse,
          code_postal,
          ville,
          regie_id
        )
      `
      )
      .order("created_at", { ascending: false });

    // Filtres
    if (immeuble_id) {
      query = query.eq("immeuble_id", immeuble_id);
    }
    if (statut) {
      query = query.eq("statut", statut);
    }

    const { data: logementsData, error: logementsError } = await query;

    if (logementsError) {
      console.error("Erreur récupération logements:", logementsError);
      return res.status(500).json({
        error: "Erreur lors de la récupération des logements",
      });
    }

    // Filtrer selon le rôle (si pas d'immeuble_id spécifié)
    let filteredLogements = logementsData;
    if (userProfile.role === "regie" && !immeuble_id) {
      filteredLogements = logementsData.filter(
        (logement) => logement.immeubles?.regie_id === userProfile.regie_id
      );
    } else if (userProfile.role !== "admin_jtec" && !immeuble_id) {
      return res.status(403).json({
        error: "Accès refusé",
      });
    }

    return res.status(200).json({
      logements: filteredLogements,
      total: filteredLogements.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des logements:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
}

/**
 * GET /api/logements/:id
 * Récupération d'un logement spécifique
 */
export async function getLogement(req, res) {
  try {
    const { id } = req.params;
    const userProfile = req.profile;

    // Récupération du logement avec l'immeuble
    const { data: logementData, error: logementError } = await supabaseServer
      .from("logements")
      .select(
        `
        *,
        immeubles:immeuble_id (
          id,
          nom,
          adresse,
          code_postal,
          ville,
          regie_id
        )
      `
      )
      .eq("id", id)
      .single();

    if (logementError || !logementData) {
      return res.status(404).json({
        error: "Logement non trouvé",
      });
    }

    // Vérification des droits d'accès
    if (
      userProfile.role !== "admin_jtec" &&
      userProfile.regie_id !== logementData.immeubles?.regie_id
    ) {
      return res.status(403).json({
        error: "Vous n'avez pas accès à ce logement",
      });
    }

    return res.status(200).json({
      logement: logementData,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du logement:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
}

/**
 * PUT /api/logements/:id
 * Mise à jour d'un logement
 */
export async function updateLogement(req, res) {
  try {
    const { id } = req.params;
    const userProfile = req.profile;

    // Vérifier que le logement existe
    const { data: existingLogement, error: fetchError } = await supabaseServer
      .from("logements")
      .select(
        `
        *,
        immeubles:immeuble_id (regie_id)
      `
      )
      .eq("id", id)
      .single();

    if (fetchError || !existingLogement) {
      return res.status(404).json({
        error: "Logement non trouvé",
      });
    }

    // Vérification des droits
    if (
      userProfile.role !== "admin_jtec" &&
      userProfile.regie_id !== existingLogement.immeubles?.regie_id
    ) {
      return res.status(403).json({
        error: "Vous n'avez pas les droits pour modifier ce logement",
      });
    }

    const {
      numero,
      etage,
      superficie_m2,
      nombre_pieces,
      type_logement,
      statut,
    } = req.body;

    // Construire l'objet de mise à jour
    const updates = {};
    if (numero !== undefined) updates.numero = numero;
    if (etage !== undefined) updates.etage = etage;
    if (superficie_m2 !== undefined) updates.superficie_m2 = superficie_m2;
    if (nombre_pieces !== undefined) updates.nombre_pieces = nombre_pieces;
    if (type_logement !== undefined) updates.type_logement = type_logement;
    if (statut !== undefined) updates.statut = statut;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: "Aucun champ à mettre à jour",
      });
    }

    // Mise à jour du logement
    const { data: updatedLogement, error: updateError } = await supabaseServer
      .from("logements")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Erreur mise à jour logement:", updateError);

      // Gestion de l'erreur d'unicité
      if (updateError.code === "23505") {
        return res.status(400).json({
          error: "Un logement avec ce numéro existe déjà dans cet immeuble",
        });
      }

      return res.status(500).json({
        error: "Erreur lors de la mise à jour du logement",
        details: updateError.message,
      });
    }

    return res.status(200).json({
      message: "Logement mis à jour avec succès",
      logement: updatedLogement,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du logement:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
}

/**
 * DELETE /api/logements/:id
 * Suppression d'un logement
 */
export async function deleteLogement(req, res) {
  try {
    const { id } = req.params;
    const userProfile = req.profile;

    // Vérifier que le logement existe
    const { data: existingLogement, error: fetchError } = await supabaseServer
      .from("logements")
      .select(
        `
        *,
        immeubles:immeuble_id (regie_id)
      `
      )
      .eq("id", id)
      .single();

    if (fetchError || !existingLogement) {
      return res.status(404).json({
        error: "Logement non trouvé",
      });
    }

    // Vérification des droits
    if (
      userProfile.role !== "admin_jtec" &&
      userProfile.regie_id !== existingLogement.immeubles?.regie_id
    ) {
      return res.status(403).json({
        error: "Vous n'avez pas les droits pour supprimer ce logement",
      });
    }

    // Suppression du logement
    const { error: deleteError } = await supabaseServer
      .from("logements")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Erreur suppression logement:", deleteError);
      return res.status(500).json({
        error: "Erreur lors de la suppression du logement",
        details: deleteError.message,
      });
    }

    return res.status(200).json({
      message: "Logement supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du logement:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
}

// Exporter le middleware d'authentification
export { authenticateUser };
