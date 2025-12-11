import { supabaseServer } from "../_supabase.js";

/**
 * Middleware pour vérifier l'authentification
 * Extrait le token JWT du header Authorization
 * et vérifie sa validité
 */
export async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Token d'authentification manquant",
      });
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    // Vérifier le token avec Supabase
    const { data: userData, error: userError } = await supabaseServer.auth.getUser(token);

    if (userError || !userData.user) {
      return res.status(401).json({
        error: "Token invalide ou expiré",
      });
    }

    // Récupérer le profil complet
    const { data: profileData, error: profileError } = await supabaseServer
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .single();

    if (profileError || !profileData) {
      return res.status(500).json({
        error: "Impossible de récupérer le profil",
      });
    }

    // Attacher l'utilisateur et son profil à la requête
    req.user = userData.user;
    req.profile = profileData;

    next();

  } catch (error) {
    console.error("Erreur middleware d'authentification:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
}

/**
 * GET /api/profile
 * Récupère le profil de l'utilisateur connecté
 */
export async function getProfile(req, res) {
  try {
    // Le profil est déjà attaché par le middleware
    const profile = req.profile;

    return res.status(200).json({
      user: {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        nom: profile.nom,
        prenom: profile.prenom,
        telephone: profile.telephone,
        adresse: profile.adresse,
        code_postal: profile.code_postal,
        ville: profile.ville,
        regie_id: profile.regie_id,
        entreprise_id: profile.entreprise_id,
        is_demo: profile.is_demo,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      },
    });

  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
}

/**
 * PUT /api/profile
 * Met à jour le profil de l'utilisateur connecté
 * 
 * Body attendu :
 * {
 *   nom?: string,
 *   prenom?: string,
 *   telephone?: string,
 *   adresse?: string,
 *   code_postal?: string,
 *   ville?: string
 * }
 * 
 * Note : On ne peut PAS modifier :
 * - role
 * - regie_id
 * - entreprise_id
 * - is_demo
 */
export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const {
      nom,
      prenom,
      telephone,
      adresse,
      code_postal,
      ville,
    } = req.body;

    // Construire l'objet de mise à jour (uniquement les champs fournis)
    const updates = {};
    if (nom !== undefined) updates.nom = nom;
    if (prenom !== undefined) updates.prenom = prenom;
    if (telephone !== undefined) updates.telephone = telephone;
    if (adresse !== undefined) updates.adresse = adresse;
    if (code_postal !== undefined) updates.code_postal = code_postal;
    if (ville !== undefined) updates.ville = ville;

    // Si aucun champ à mettre à jour
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: "Aucun champ à mettre à jour",
      });
    }

    // Mise à jour du profil
    const { data: updatedProfile, error: updateError } = await supabaseServer
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (updateError) {
      console.error("Erreur mise à jour profil:", updateError);
      return res.status(500).json({
        error: "Erreur lors de la mise à jour du profil",
        details: updateError.message,
      });
    }

    return res.status(200).json({
      message: "Profil mis à jour avec succès",
      user: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        role: updatedProfile.role,
        nom: updatedProfile.nom,
        prenom: updatedProfile.prenom,
        telephone: updatedProfile.telephone,
        adresse: updatedProfile.adresse,
        code_postal: updatedProfile.code_postal,
        ville: updatedProfile.ville,
        regie_id: updatedProfile.regie_id,
        entreprise_id: updatedProfile.entreprise_id,
        is_demo: updatedProfile.is_demo,
      },
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
}
