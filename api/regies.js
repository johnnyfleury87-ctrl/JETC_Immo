import { supabaseServer } from "./_supabase.js";
import { authenticateUser } from "./profile.js";

/**
 * POST /api/regies
 * Création d'une nouvelle régie
 * 
 * Body attendu :
 * {
 *   nom: string (obligatoire),
 *   siret?: string,
 *   email: string (obligatoire),
 *   telephone?: string,
 *   adresse?: string,
 *   code_postal?: string,
 *   ville?: string,
 *   nom_responsable?: string,
 *   prenom_responsable?: string,
 *   telephone_responsable?: string,
 *   email_responsable?: string,
 *   is_demo?: boolean
 * }
 */
export async function createRegie(req, res) {
  try {
    const {
      nom,
      siret,
      email,
      telephone,
      adresse,
      code_postal,
      ville,
      nom_responsable,
      prenom_responsable,
      telephone_responsable,
      email_responsable,
      is_demo = false,
    } = req.body;

    // Validation des champs obligatoires
    if (!nom || !email) {
      return res.status(400).json({
        error: "Les champs nom et email sont obligatoires",
      });
    }

    // Vérification du rôle : seul admin_jtec ou un utilisateur qui crée sa propre régie
    const userProfile = req.profile;
    if (userProfile.role !== 'admin_jtec' && userProfile.role !== 'regie') {
      return res.status(403).json({
        error: "Vous n'avez pas les droits pour créer une régie",
      });
    }

    // Si l'utilisateur a déjà une régie, il ne peut pas en créer une nouvelle
    if (userProfile.role === 'regie' && userProfile.regie_id) {
      return res.status(400).json({
        error: "Vous êtes déjà associé à une régie",
      });
    }

    // Vérification du SIRET unique si fourni
    if (siret) {
      const { data: existingSiret } = await supabaseServer
        .from("regies")
        .select("id")
        .eq("siret", siret)
        .single();

      if (existingSiret) {
        return res.status(400).json({
          error: "Ce SIRET est déjà utilisé par une autre régie",
        });
      }
    }

    // Création de la régie
    const { data: regieData, error: regieError } = await supabaseServer
      .from("regies")
      .insert({
        nom,
        siret,
        email,
        telephone,
        adresse,
        code_postal,
        ville,
        nom_responsable,
        prenom_responsable,
        telephone_responsable,
        email_responsable,
        is_demo,
      })
      .select()
      .single();

    if (regieError) {
      console.error("Erreur création régie:", regieError);
      return res.status(500).json({
        error: "Erreur lors de la création de la régie",
        details: regieError.message,
      });
    }

    // Si c'est l'utilisateur lui-même qui crée sa régie, lier son profil
    if (userProfile.role === 'regie' && !userProfile.regie_id) {
      const { error: updateProfileError } = await supabaseServer
        .from("profiles")
        .update({ regie_id: regieData.id })
        .eq("id", userProfile.id);

      if (updateProfileError) {
        console.error("Erreur liaison profil-régie:", updateProfileError);
        // On ne rollback pas la régie créée, mais on avertit
      }
    }

    return res.status(201).json({
      message: "Régie créée avec succès",
      regie: regieData,
    });

  } catch (error) {
    console.error("Erreur serveur lors de la création de la régie:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}

/**
 * GET /api/regies/:id
 * Récupération d'une régie spécifique
 */
export async function getRegie(req, res) {
  try {
    const { id } = req.params;
    const userProfile = req.profile;

    // Vérification des droits d'accès
    if (
      userProfile.role !== 'admin_jtec' &&
      userProfile.regie_id !== id
    ) {
      return res.status(403).json({
        error: "Vous n'avez pas accès à cette régie",
      });
    }

    // Récupération de la régie
    const { data: regieData, error: regieError } = await supabaseServer
      .from("regies")
      .select("*")
      .eq("id", id)
      .single();

    if (regieError || !regieData) {
      return res.status(404).json({
        error: "Régie non trouvée",
      });
    }

    return res.status(200).json({
      regie: regieData,
    });

  } catch (error) {
    console.error("Erreur lors de la récupération de la régie:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
}

/**
 * PUT /api/regies/:id
 * Mise à jour d'une régie
 * 
 * Body attendu : mêmes champs que POST (tous optionnels)
 */
export async function updateRegie(req, res) {
  try {
    const { id } = req.params;
    const userProfile = req.profile;

    // Vérification des droits d'accès
    if (
      userProfile.role !== 'admin_jtec' &&
      userProfile.regie_id !== id
    ) {
      return res.status(403).json({
        error: "Vous n'avez pas les droits pour modifier cette régie",
      });
    }

    const {
      nom,
      siret,
      email,
      telephone,
      adresse,
      code_postal,
      ville,
      nom_responsable,
      prenom_responsable,
      telephone_responsable,
      email_responsable,
    } = req.body;

    // Construire l'objet de mise à jour
    const updates = {};
    if (nom !== undefined) updates.nom = nom;
    if (siret !== undefined) updates.siret = siret;
    if (email !== undefined) updates.email = email;
    if (telephone !== undefined) updates.telephone = telephone;
    if (adresse !== undefined) updates.adresse = adresse;
    if (code_postal !== undefined) updates.code_postal = code_postal;
    if (ville !== undefined) updates.ville = ville;
    if (nom_responsable !== undefined) updates.nom_responsable = nom_responsable;
    if (prenom_responsable !== undefined) updates.prenom_responsable = prenom_responsable;
    if (telephone_responsable !== undefined) updates.telephone_responsable = telephone_responsable;
    if (email_responsable !== undefined) updates.email_responsable = email_responsable;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: "Aucun champ à mettre à jour",
      });
    }

    // Vérification du SIRET unique si modifié
    if (siret) {
      const { data: existingSiret } = await supabaseServer
        .from("regies")
        .select("id")
        .eq("siret", siret)
        .neq("id", id)
        .single();

      if (existingSiret) {
        return res.status(400).json({
          error: "Ce SIRET est déjà utilisé par une autre régie",
        });
      }
    }

    // Mise à jour de la régie
    const { data: updatedRegie, error: updateError } = await supabaseServer
      .from("regies")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Erreur mise à jour régie:", updateError);
      return res.status(500).json({
        error: "Erreur lors de la mise à jour de la régie",
        details: updateError.message,
      });
    }

    return res.status(200).json({
      message: "Régie mise à jour avec succès",
      regie: updatedRegie,
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour de la régie:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
}

/**
 * GET /api/regies
 * Liste toutes les régies (admin JTEC uniquement)
 */
export async function listRegies(req, res) {
  try {
    const userProfile = req.profile;

    // Seul admin JTEC peut lister toutes les régies
    if (userProfile.role !== 'admin_jtec') {
      return res.status(403).json({
        error: "Accès refusé : réservé aux administrateurs",
      });
    }

    // Récupération de toutes les régies
    const { data: regiesData, error: regiesError } = await supabaseServer
      .from("regies")
      .select("*")
      .order("created_at", { ascending: false });

    if (regiesError) {
      console.error("Erreur récupération régies:", regiesError);
      return res.status(500).json({
        error: "Erreur lors de la récupération des régies",
      });
    }

    return res.status(200).json({
      regies: regiesData,
      total: regiesData.length,
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des régies:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
}

// Exporter le middleware d'authentification pour réutilisation
export { authenticateUser };
