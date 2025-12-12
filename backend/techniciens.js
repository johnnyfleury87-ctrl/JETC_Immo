import { supabaseServer } from "./_supabase.js";
import { authenticateUser } from "./profile.js";

/**
 * POST /api/techniciens
 * Créer un nouveau technicien pour une entreprise
 *
 * Body attendu :
 * {
 *   email: string (obligatoire),
 *   password: string (obligatoire),
 *   nom: string,
 *   prenom: string,
 *   telephone: string,
 *   adresse: string,
 *   code_postal: string,
 *   ville: string,
 *   is_demo?: boolean
 * }
 */
export async function createTechnicien(req, res) {
  try {
    const {
      email,
      password,
      nom,
      prenom,
      telephone,
      adresse,
      code_postal,
      ville,
      is_demo = false,
    } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Email et mot de passe sont obligatoires",
      });
    }

    const userProfile = req.profile;

    // Seules les entreprises et admins peuvent créer des techniciens
    if (
      userProfile.role !== "entreprise" &&
      userProfile.role !== "admin_jtec"
    ) {
      return res.status(403).json({
        error: "Seules les entreprises peuvent créer des techniciens",
      });
    }

    const entreprise_id =
      userProfile.role === "entreprise"
        ? userProfile.entreprise_id
        : req.body.entreprise_id;

    if (!entreprise_id) {
      return res.status(400).json({
        error: "L'ID de l'entreprise est requis",
      });
    }

    // Vérifier que l'entreprise existe
    const { data: entreprise, error: entrepriseError } = await supabaseServer
      .from("entreprises")
      .select("id")
      .eq("id", entreprise_id)
      .single();

    if (entrepriseError || !entreprise) {
      return res.status(404).json({
        error: "Entreprise non trouvée",
      });
    }

    // Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } =
      await supabaseServer.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role: "technicien",
          entreprise_id,
        },
      });

    if (authError) {
      console.error("Erreur lors de la création de l'utilisateur:", authError);
      return res.status(500).json({
        error: "Erreur lors de la création de l'utilisateur",
        details: authError.message,
      });
    }

    // Créer le profil technicien
    const { data: profile, error: profileError } = await supabaseServer
      .from("profiles")
      .insert({
        id: authData.user.id,
        role: "technicien",
        email,
        nom,
        prenom,
        telephone,
        adresse,
        code_postal,
        ville,
        entreprise_id,
        is_demo,
      })
      .select()
      .single();

    if (profileError) {
      console.error("Erreur lors de la création du profil:", profileError);

      // Rollback : supprimer l'utilisateur Auth créé
      await supabaseServer.auth.admin.deleteUser(authData.user.id);

      return res.status(500).json({
        error: "Erreur lors de la création du profil technicien",
        details: profileError.message,
      });
    }

    res.status(201).json({
      message: "Technicien créé avec succès",
      technicien: profile,
    });
  } catch (error) {
    console.error("Erreur dans createTechnicien:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}

/**
 * GET /api/techniciens
 * Liste des techniciens d'une entreprise
 *
 * Query params optionnels :
 * - entreprise_id: uuid (admin uniquement)
 */
export async function listTechniciens(req, res) {
  try {
    const userProfile = req.profile;
    const { entreprise_id } = req.query;

    let query = supabaseServer
      .from("profiles")
      .select("*")
      .eq("role", "technicien")
      .order("created_at", { ascending: false });

    // Filtrage selon le rôle
    if (
      userProfile.role === "entreprise" ||
      userProfile.role === "technicien"
    ) {
      query = query.eq("entreprise_id", userProfile.entreprise_id);
    } else if (userProfile.role === "admin_jtec" && entreprise_id) {
      query = query.eq("entreprise_id", entreprise_id);
    } else if (userProfile.role !== "admin_jtec") {
      return res.status(403).json({
        error: "Accès refusé",
      });
    }

    const { data: techniciens, error } = await query;

    if (error) {
      console.error("Erreur lors de la récupération des techniciens:", error);
      return res.status(500).json({
        error: "Erreur lors de la récupération des techniciens",
        details: error.message,
      });
    }

    res.json({ techniciens });
  } catch (error) {
    console.error("Erreur dans listTechniciens:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}

/**
 * GET /api/techniciens/:id
 * Récupérer un technicien spécifique
 */
export async function getTechnicien(req, res) {
  try {
    const { id } = req.params;
    const userProfile = req.profile;

    const { data: technicien, error } = await supabaseServer
      .from("profiles")
      .select(
        `
        *,
        entreprises:entreprise_id (
          id,
          nom,
          email,
          telephone
        )
      `
      )
      .eq("id", id)
      .eq("role", "technicien")
      .single();

    if (error || !technicien) {
      return res.status(404).json({
        error: "Technicien non trouvé",
      });
    }

    // Vérification des droits d'accès
    if (
      userProfile.role === "entreprise" ||
      userProfile.role === "technicien"
    ) {
      if (technicien.entreprise_id !== userProfile.entreprise_id) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }
    } else if (userProfile.role !== "admin_jtec") {
      return res.status(403).json({
        error: "Accès refusé",
      });
    }

    res.json({ technicien });
  } catch (error) {
    console.error("Erreur dans getTechnicien:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}

/**
 * PUT /api/techniciens/:id
 * Mettre à jour un technicien
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
 */
export async function updateTechnicien(req, res) {
  try {
    const { id } = req.params;
    const userProfile = req.profile;

    // Récupérer le technicien existant
    const { data: existingTechnicien, error: fetchError } = await supabaseServer
      .from("profiles")
      .select("*")
      .eq("id", id)
      .eq("role", "technicien")
      .single();

    if (fetchError || !existingTechnicien) {
      return res.status(404).json({
        error: "Technicien non trouvé",
      });
    }

    // Vérification des droits
    if (userProfile.role === "entreprise") {
      if (existingTechnicien.entreprise_id !== userProfile.entreprise_id) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }
    } else if (userProfile.role === "technicien") {
      if (existingTechnicien.id !== userProfile.id) {
        return res.status(403).json({
          error: "Vous ne pouvez modifier que votre propre profil",
        });
      }
    } else if (userProfile.role !== "admin_jtec") {
      return res.status(403).json({
        error: "Accès refusé",
      });
    }

    // Champs modifiables
    const allowedFields = [
      "nom",
      "prenom",
      "telephone",
      "adresse",
      "code_postal",
      "ville",
    ];
    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: "Aucun champ à modifier",
      });
    }

    // Mettre à jour le technicien
    const { data: updatedTechnicien, error: updateError } = await supabaseServer
      .from("profiles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error(
        "Erreur lors de la mise à jour du technicien:",
        updateError
      );
      return res.status(500).json({
        error: "Erreur lors de la mise à jour du technicien",
        details: updateError.message,
      });
    }

    res.json({
      message: "Technicien mis à jour avec succès",
      technicien: updatedTechnicien,
    });
  } catch (error) {
    console.error("Erreur dans updateTechnicien:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}

/**
 * DELETE /api/techniciens/:id
 * Supprimer un technicien
 */
export async function deleteTechnicien(req, res) {
  try {
    const { id } = req.params;
    const userProfile = req.profile;

    // Récupérer le technicien
    const { data: technicien, error: fetchError } = await supabaseServer
      .from("profiles")
      .select("*")
      .eq("id", id)
      .eq("role", "technicien")
      .single();

    if (fetchError || !technicien) {
      return res.status(404).json({
        error: "Technicien non trouvé",
      });
    }

    // Vérification des droits
    if (userProfile.role === "entreprise") {
      if (technicien.entreprise_id !== userProfile.entreprise_id) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }
    } else if (userProfile.role !== "admin_jtec") {
      return res.status(403).json({
        error:
          "Seules les entreprises et admins peuvent supprimer des techniciens",
      });
    }

    // Vérifier si le technicien a des missions en cours
    const { data: missions, error: missionsError } = await supabaseServer
      .from("missions")
      .select("id, statut")
      .eq("technicien_id", id)
      .in("statut", ["en_route", "en_cours", "planifiée"]);

    if (missions && missions.length > 0) {
      return res.status(400).json({
        error:
          "Impossible de supprimer un technicien avec des missions en cours",
        missions_count: missions.length,
      });
    }

    // Supprimer l'utilisateur Auth (cascade sur profiles)
    const { error: deleteAuthError } =
      await supabaseServer.auth.admin.deleteUser(id);

    if (deleteAuthError) {
      console.error(
        "Erreur lors de la suppression de l'utilisateur:",
        deleteAuthError
      );
      return res.status(500).json({
        error: "Erreur lors de la suppression du technicien",
        details: deleteAuthError.message,
      });
    }

    res.json({
      message: "Technicien supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur dans deleteTechnicien:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}

/**
 * GET /api/techniciens/:id/missions
 * Récupérer les missions d'un technicien
 */
export async function getTechnicienMissions(req, res) {
  try {
    const { id } = req.params;
    const userProfile = req.profile;

    // Vérifier que le technicien existe
    const { data: technicien, error: technicienError } = await supabaseServer
      .from("profiles")
      .select("*")
      .eq("id", id)
      .eq("role", "technicien")
      .single();

    if (technicienError || !technicien) {
      return res.status(404).json({
        error: "Technicien non trouvé",
      });
    }

    // Vérification des droits
    if (
      userProfile.role === "entreprise" ||
      userProfile.role === "technicien"
    ) {
      if (technicien.entreprise_id !== userProfile.entreprise_id) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }
    } else if (userProfile.role !== "admin_jtec") {
      return res.status(403).json({
        error: "Accès refusé",
      });
    }

    // Récupérer les missions
    const { data: missions, error: missionsError } = await supabaseServer
      .from("missions")
      .select(
        `
        *,
        tickets:ticket_id (
          id,
          titre,
          description,
          categorie,
          priorite,
          logements:logement_id (
            numero,
            immeubles:immeuble_id (
              nom,
              adresse,
              ville
            )
          )
        )
      `
      )
      .eq("technicien_id", id)
      .order("date_intervention_prevue", { ascending: true });

    if (missionsError) {
      console.error(
        "Erreur lors de la récupération des missions:",
        missionsError
      );
      return res.status(500).json({
        error: "Erreur lors de la récupération des missions",
        details: missionsError.message,
      });
    }

    res.json({
      technicien: {
        id: technicien.id,
        nom: technicien.nom,
        prenom: technicien.prenom,
        email: technicien.email,
      },
      missions,
    });
  } catch (error) {
    console.error("Erreur dans getTechnicienMissions:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}
