import { supabaseServer } from "./_supabase.js";
import { authenticateUser } from "./profile.js";

/**
 * POST /api/immeubles
 * Création d'un nouvel immeuble
 * 
 * Body attendu :
 * {
 *   nom?: string,
 *   adresse: string (obligatoire),
 *   code_postal: string (obligatoire),
 *   ville: string (obligatoire),
 *   nombre_etages?: number,
 *   annee_construction?: number,
 *   is_demo?: boolean
 * }
 */
export async function createImmeuble(req, res) {
  try {
    const {
      nom,
      adresse,
      code_postal,
      ville,
      nombre_etages,
      annee_construction,
      is_demo = false,
    } = req.body;

    // Validation des champs obligatoires
    if (!adresse || !code_postal || !ville) {
      return res.status(400).json({
        error: "Les champs adresse, code_postal et ville sont obligatoires",
      });
    }

    const userProfile = req.profile;

    // Vérification du rôle : seul régie ou admin_jtec
    if (userProfile.role !== 'regie' && userProfile.role !== 'admin_jtec') {
      return res.status(403).json({
        error: "Vous n'avez pas les droits pour créer un immeuble",
      });
    }

    // Déterminer la régie_id
    let regie_id;
    if (userProfile.role === 'regie') {
      regie_id = userProfile.regie_id;
      if (!regie_id) {
        return res.status(400).json({
          error: "Votre profil n'est pas associé à une régie",
        });
      }
    } else if (userProfile.role === 'admin_jtec') {
      // Admin doit spécifier la régie
      regie_id = req.body.regie_id;
      if (!regie_id) {
        return res.status(400).json({
          error: "Le champ regie_id est obligatoire pour les administrateurs",
        });
      }
    }

    // Création de l'immeuble
    const { data: immeubleData, error: immeubleError } = await supabaseServer
      .from("immeubles")
      .insert({
        regie_id,
        nom,
        adresse,
        code_postal,
        ville,
        nombre_etages,
        annee_construction,
        is_demo,
      })
      .select()
      .single();

    if (immeubleError) {
      console.error("Erreur création immeuble:", immeubleError);
      return res.status(500).json({
        error: "Erreur lors de la création de l'immeuble",
        details: immeubleError.message,
      });
    }

    return res.status(201).json({
      message: "Immeuble créé avec succès",
      immeuble: immeubleData,
    });

  } catch (error) {
    console.error("Erreur serveur lors de la création de l'immeuble:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}

/**
 * GET /api/immeubles
 * Liste les immeubles de la régie connectée ou tous (admin)
 */
export async function listImmeubles(req, res) {
  try {
    const userProfile = req.profile;

    let query = supabaseServer
      .from("immeubles")
      .select("*")
      .order("created_at", { ascending: false });

    // Filtrer selon le rôle
    if (userProfile.role === 'regie') {
      query = query.eq("regie_id", userProfile.regie_id);
    } else if (userProfile.role !== 'admin_jtec') {
      return res.status(403).json({
        error: "Accès refusé",
      });
    }

    const { data: immeublesData, error: immeublesError } = await query;

    if (immeublesError) {
      console.error("Erreur récupération immeubles:", immeublesError);
      return res.status(500).json({
        error: "Erreur lors de la récupération des immeubles",
      });
    }

    return res.status(200).json({
      immeubles: immeublesData,
      total: immeublesData.length,
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des immeubles:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
}

/**
 * GET /api/immeubles/:id
 * Récupération d'un immeuble spécifique
 */
export async function getImmeuble(req, res) {
  try {
    const { id } = req.params;
    const userProfile = req.profile;

    // Récupération de l'immeuble
    const { data: immeubleData, error: immeubleError } = await supabaseServer
      .from("immeubles")
      .select("*")
      .eq("id", id)
      .single();

    if (immeubleError || !immeubleData) {
      return res.status(404).json({
        error: "Immeuble non trouvé",
      });
    }

    // Vérification des droits d'accès
    if (
      userProfile.role !== 'admin_jtec' &&
      userProfile.regie_id !== immeubleData.regie_id
    ) {
      return res.status(403).json({
        error: "Vous n'avez pas accès à cet immeuble",
      });
    }

    return res.status(200).json({
      immeuble: immeubleData,
    });

  } catch (error) {
    console.error("Erreur lors de la récupération de l'immeuble:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
}

/**
 * PUT /api/immeubles/:id
 * Mise à jour d'un immeuble
 */
export async function updateImmeuble(req, res) {
  try {
    const { id } = req.params;
    const userProfile = req.profile;

    // Vérifier que l'immeuble existe et appartient à la régie
    const { data: existingImmeuble, error: fetchError } = await supabaseServer
      .from("immeubles")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingImmeuble) {
      return res.status(404).json({
        error: "Immeuble non trouvé",
      });
    }

    // Vérification des droits
    if (
      userProfile.role !== 'admin_jtec' &&
      userProfile.regie_id !== existingImmeuble.regie_id
    ) {
      return res.status(403).json({
        error: "Vous n'avez pas les droits pour modifier cet immeuble",
      });
    }

    const {
      nom,
      adresse,
      code_postal,
      ville,
      nombre_etages,
      annee_construction,
    } = req.body;

    // Construire l'objet de mise à jour
    const updates = {};
    if (nom !== undefined) updates.nom = nom;
    if (adresse !== undefined) updates.adresse = adresse;
    if (code_postal !== undefined) updates.code_postal = code_postal;
    if (ville !== undefined) updates.ville = ville;
    if (nombre_etages !== undefined) updates.nombre_etages = nombre_etages;
    if (annee_construction !== undefined) updates.annee_construction = annee_construction;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: "Aucun champ à mettre à jour",
      });
    }

    // Mise à jour de l'immeuble
    const { data: updatedImmeuble, error: updateError } = await supabaseServer
      .from("immeubles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Erreur mise à jour immeuble:", updateError);
      return res.status(500).json({
        error: "Erreur lors de la mise à jour de l'immeuble",
        details: updateError.message,
      });
    }

    return res.status(200).json({
      message: "Immeuble mis à jour avec succès",
      immeuble: updatedImmeuble,
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'immeuble:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
}

/**
 * DELETE /api/immeubles/:id
 * Suppression d'un immeuble
 */
export async function deleteImmeuble(req, res) {
  try {
    const { id } = req.params;
    const userProfile = req.profile;

    // Vérifier que l'immeuble existe et appartient à la régie
    const { data: existingImmeuble, error: fetchError } = await supabaseServer
      .from("immeubles")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingImmeuble) {
      return res.status(404).json({
        error: "Immeuble non trouvé",
      });
    }

    // Vérification des droits
    if (
      userProfile.role !== 'admin_jtec' &&
      userProfile.regie_id !== existingImmeuble.regie_id
    ) {
      return res.status(403).json({
        error: "Vous n'avez pas les droits pour supprimer cet immeuble",
      });
    }

    // Suppression de l'immeuble
    const { error: deleteError } = await supabaseServer
      .from("immeubles")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Erreur suppression immeuble:", deleteError);
      return res.status(500).json({
        error: "Erreur lors de la suppression de l'immeuble",
        details: deleteError.message,
      });
    }

    return res.status(200).json({
      message: "Immeuble supprimé avec succès",
    });

  } catch (error) {
    console.error("Erreur lors de la suppression de l'immeuble:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
}

// Exporter le middleware d'authentification
export { authenticateUser };
