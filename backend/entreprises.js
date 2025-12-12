import { supabaseServer } from "./_supabase.js";
import { authenticateUser } from "./profile.js";

/**
 * POST /api/entreprises
 * Création d'une nouvelle entreprise
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
 *   specialites?: string[] (ex: ['plomberie', 'électricité']),
 *   rayon_intervention_km?: number,
 *   is_demo?: boolean
 * }
 */
export async function createEntreprise(req, res) {
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
      specialites = [],
      rayon_intervention_km = 50,
      is_demo = false,
    } = req.body;

    // Validation des champs obligatoires
    if (!nom || !email) {
      return res.status(400).json({
        error: "Les champs nom et email sont obligatoires",
      });
    }

    // Vérification du rôle : seul admin_jtec ou un utilisateur qui crée sa propre entreprise
    const userProfile = req.profile;
    if (
      userProfile.role !== "admin_jtec" &&
      userProfile.role !== "entreprise"
    ) {
      return res.status(403).json({
        error: "Vous n'avez pas les droits pour créer une entreprise",
      });
    }

    // Si l'utilisateur a déjà une entreprise, il ne peut pas en créer une nouvelle
    if (userProfile.role === "entreprise" && userProfile.entreprise_id) {
      return res.status(400).json({
        error: "Vous êtes déjà associé à une entreprise",
      });
    }

    // Vérification du SIRET unique si fourni
    if (siret) {
      const { data: existingSiret } = await supabaseServer
        .from("entreprises")
        .select("id")
        .eq("siret", siret)
        .single();

      if (existingSiret) {
        return res.status(400).json({
          error: "Ce SIRET est déjà utilisé par une autre entreprise",
        });
      }
    }

    // Validation des spécialités
    const validSpecialites = [
      "plomberie",
      "électricité",
      "serrurerie",
      "chauffage",
      "climatisation",
      "menuiserie",
      "peinture",
      "maçonnerie",
      "vitrerie",
      "toiture",
      "isolation",
      "jardinage",
      "nettoyage",
      "autre",
    ];

    if (specialites.length > 0) {
      const invalidSpecialites = specialites.filter(
        (s) => !validSpecialites.includes(s)
      );
      if (invalidSpecialites.length > 0) {
        return res.status(400).json({
          error: `Spécialités invalides : ${invalidSpecialites.join(", ")}`,
          valid_specialites: validSpecialites,
        });
      }
    }

    // Création de l'entreprise
    const { data: entrepriseData, error: entrepriseError } =
      await supabaseServer
        .from("entreprises")
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
          specialites,
          rayon_intervention_km,
          is_demo,
        })
        .select()
        .single();

    if (entrepriseError) {
      console.error("Erreur création entreprise:", entrepriseError);
      return res.status(500).json({
        error: "Erreur lors de la création de l'entreprise",
        details: entrepriseError.message,
      });
    }

    // Si c'est l'utilisateur lui-même qui crée son entreprise, lier son profil
    if (userProfile.role === "entreprise" && !userProfile.entreprise_id) {
      const { error: updateProfileError } = await supabaseServer
        .from("profiles")
        .update({ entreprise_id: entrepriseData.id })
        .eq("id", userProfile.id);

      if (updateProfileError) {
        console.error("Erreur liaison profil-entreprise:", updateProfileError);
      }
    }

    return res.status(201).json({
      message: "Entreprise créée avec succès",
      entreprise: entrepriseData,
    });
  } catch (error) {
    console.error("Erreur serveur lors de la création de l'entreprise:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}

/**
 * GET /api/entreprises/:id
 * Récupération d'une entreprise spécifique
 */
export async function getEntreprise(req, res) {
  try {
    const { id } = req.params;
    const userProfile = req.profile;

    // Vérification des droits d'accès
    if (
      userProfile.role !== "admin_jtec" &&
      userProfile.role !== "regie" &&
      userProfile.entreprise_id !== id
    ) {
      return res.status(403).json({
        error: "Vous n'avez pas accès à cette entreprise",
      });
    }

    // Récupération de l'entreprise
    const { data: entrepriseData, error: entrepriseError } =
      await supabaseServer
        .from("entreprises")
        .select("*")
        .eq("id", id)
        .single();

    if (entrepriseError || !entrepriseData) {
      return res.status(404).json({
        error: "Entreprise non trouvée",
      });
    }

    return res.status(200).json({
      entreprise: entrepriseData,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'entreprise:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
}

/**
 * PUT /api/entreprises/:id
 * Mise à jour d'une entreprise
 */
export async function updateEntreprise(req, res) {
  try {
    const { id } = req.params;
    const userProfile = req.profile;

    // Vérification des droits d'accès
    if (userProfile.role !== "admin_jtec" && userProfile.entreprise_id !== id) {
      return res.status(403).json({
        error: "Vous n'avez pas les droits pour modifier cette entreprise",
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
      specialites,
      rayon_intervention_km,
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
    if (nom_responsable !== undefined)
      updates.nom_responsable = nom_responsable;
    if (prenom_responsable !== undefined)
      updates.prenom_responsable = prenom_responsable;
    if (telephone_responsable !== undefined)
      updates.telephone_responsable = telephone_responsable;
    if (email_responsable !== undefined)
      updates.email_responsable = email_responsable;
    if (specialites !== undefined) updates.specialites = specialites;
    if (rayon_intervention_km !== undefined)
      updates.rayon_intervention_km = rayon_intervention_km;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: "Aucun champ à mettre à jour",
      });
    }

    // Vérification du SIRET unique si modifié
    if (siret) {
      const { data: existingSiret } = await supabaseServer
        .from("entreprises")
        .select("id")
        .eq("siret", siret)
        .neq("id", id)
        .single();

      if (existingSiret) {
        return res.status(400).json({
          error: "Ce SIRET est déjà utilisé par une autre entreprise",
        });
      }
    }

    // Mise à jour de l'entreprise
    const { data: updatedEntreprise, error: updateError } = await supabaseServer
      .from("entreprises")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Erreur mise à jour entreprise:", updateError);
      return res.status(500).json({
        error: "Erreur lors de la mise à jour de l'entreprise",
        details: updateError.message,
      });
    }

    return res.status(200).json({
      message: "Entreprise mise à jour avec succès",
      entreprise: updatedEntreprise,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'entreprise:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
}

/**
 * GET /api/entreprises
 * Liste toutes les entreprises
 * - Admin JTEC : voit toutes les entreprises
 * - Régie : voit les entreprises disponibles
 */
export async function listEntreprises(req, res) {
  try {
    const userProfile = req.profile;

    // Vérification du rôle
    if (userProfile.role !== "admin_jtec" && userProfile.role !== "regie") {
      return res.status(403).json({
        error: "Accès refusé",
      });
    }

    // Filtres optionnels
    const { specialite } = req.query;

    let query = supabaseServer
      .from("entreprises")
      .select("*")
      .order("created_at", { ascending: false });

    // Filtrer par spécialité si demandé
    if (specialite) {
      query = query.contains("specialites", [specialite]);
    }

    const { data: entreprisesData, error: entreprisesError } = await query;

    if (entreprisesError) {
      console.error("Erreur récupération entreprises:", entreprisesError);
      return res.status(500).json({
        error: "Erreur lors de la récupération des entreprises",
      });
    }

    return res.status(200).json({
      entreprises: entreprisesData,
      total: entreprisesData.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des entreprises:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
}

// Exporter le middleware d'authentification pour réutilisation
export { authenticateUser };
