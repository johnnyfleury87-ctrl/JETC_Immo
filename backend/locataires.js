import { supabaseServer } from "./_supabase.js";
import { authenticateUser } from "./profile.js";

/**
 * POST /api/locataires
 * Création d'un nouveau locataire
 * 
 * Body attendu :
 * {
 *   profile_id: uuid (obligatoire),
 *   logement_id: uuid (obligatoire),
 *   date_entree?: date,
 *   date_sortie?: date,
 *   loyer_mensuel?: number,
 *   charges_mensuelles?: number,
 *   depot_garantie?: number,
 *   statut?: 'actif' | 'en_préavis' | 'parti' | 'suspendu',
 *   is_demo?: boolean
 * }
 */
export async function createLocataire(req, res) {
  try {
    const {
      profile_id,
      logement_id,
      date_entree,
      date_sortie,
      loyer_mensuel,
      charges_mensuelles,
      depot_garantie,
      statut = 'actif',
      is_demo = false,
    } = req.body;

    // Validation des champs obligatoires
    if (!profile_id || !logement_id) {
      return res.status(400).json({
        error: "Les champs profile_id et logement_id sont obligatoires",
      });
    }

    const userProfile = req.profile;

    // Vérification du rôle
    if (userProfile.role !== 'regie' && userProfile.role !== 'admin_jtec') {
      return res.status(403).json({
        error: "Vous n'avez pas les droits pour créer un locataire",
      });
    }

    // Vérifier que le profil existe et a le rôle 'locataire'
    const { data: profileData, error: profileError } = await supabaseServer
      .from("profiles")
      .select("*")
      .eq("id", profile_id)
      .single();

    if (profileError || !profileData) {
      return res.status(404).json({
        error: "Profil non trouvé",
      });
    }

    if (profileData.role !== 'locataire') {
      return res.status(400).json({
        error: "Le profil doit avoir le rôle 'locataire'",
      });
    }

    // Vérifier que le profil n'est pas déjà associé à un locataire actif
    const { data: existingLocataire } = await supabaseServer
      .from("locataires")
      .select("id")
      .eq("profile_id", profile_id)
      .eq("statut", "actif")
      .single();

    if (existingLocataire) {
      return res.status(400).json({
        error: "Ce profil est déjà associé à un locataire actif",
      });
    }

    // Vérifier que le logement existe et appartient à la régie
    const { data: logementData, error: logementError } = await supabaseServer
      .from("logements")
      .select(`
        *,
        immeubles:immeuble_id (
          regie_id
        )
      `)
      .eq("id", logement_id)
      .single();

    if (logementError || !logementData) {
      return res.status(404).json({
        error: "Logement non trouvé",
      });
    }

    // Vérifier les droits sur le logement
    if (
      userProfile.role === 'regie' &&
      userProfile.regie_id !== logementData.immeubles?.regie_id
    ) {
      return res.status(403).json({
        error: "Vous n'avez pas accès à ce logement",
      });
    }

    // Mettre à jour le profile avec la regie_id
    const regie_id = logementData.immeubles?.regie_id;
    await supabaseServer
      .from("profiles")
      .update({ regie_id })
      .eq("id", profile_id);

    // Création du locataire
    const { data: locataireData, error: locataireError } = await supabaseServer
      .from("locataires")
      .insert({
        profile_id,
        logement_id,
        date_entree,
        date_sortie,
        loyer_mensuel,
        charges_mensuelles,
        depot_garantie,
        statut,
        is_demo,
      })
      .select()
      .single();

    if (locataireError) {
      console.error("Erreur création locataire:", locataireError);
      
      // Gestion de l'erreur d'unicité
      if (locataireError.code === '23505') {
        return res.status(400).json({
          error: "Ce profil est déjà associé à un locataire",
        });
      }
      
      return res.status(500).json({
        error: "Erreur lors de la création du locataire",
        details: locataireError.message,
      });
    }

    // Mettre à jour le statut du logement
    await supabaseServer
      .from("logements")
      .update({ statut: 'occupé' })
      .eq("id", logement_id);

    return res.status(201).json({
      message: "Locataire créé avec succès",
      locataire: locataireData,
    });

  } catch (error) {
    console.error("Erreur serveur lors de la création du locataire:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}

/**
 * GET /api/locataires
 * Liste les locataires
 * Query params :
 * - logement_id: filtrer par logement
 * - statut: filtrer par statut
 */
export async function listLocataires(req, res) {
  try {
    const userProfile = req.profile;
    const { logement_id, statut } = req.query;

    let query = supabaseServer
      .from("locataires")
      .select(`
        *,
        profiles:profile_id (
          id,
          email,
          nom,
          prenom,
          telephone
        ),
        logements:logement_id (
          id,
          numero,
          immeuble_id,
          immeubles:immeuble_id (
            id,
            nom,
            adresse,
            regie_id
          )
        )
      `)
      .order("created_at", { ascending: false });

    // Filtres
    if (logement_id) {
      query = query.eq("logement_id", logement_id);
    }
    if (statut) {
      query = query.eq("statut", statut);
    }

    const { data: locatairesData, error: locatairesError } = await query;

    if (locatairesError) {
      console.error("Erreur récupération locataires:", locatairesError);
      return res.status(500).json({
        error: "Erreur lors de la récupération des locataires",
      });
    }

    // Filtrer selon le rôle
    let filteredLocataires = locatairesData;
    
    if (userProfile.role === 'locataire') {
      // Un locataire ne voit que ses propres infos
      filteredLocataires = locatairesData.filter(
        locataire => locataire.profile_id === userProfile.id
      );
    } else if (userProfile.role === 'regie' && !logement_id) {
      // Une régie ne voit que ses locataires
      filteredLocataires = locatairesData.filter(
        locataire => locataire.logements?.immeubles?.regie_id === userProfile.regie_id
      );
    } else if (userProfile.role !== 'admin_jtec' && !logement_id) {
      return res.status(403).json({
        error: "Accès refusé",
      });
    }

    return res.status(200).json({
      locataires: filteredLocataires,
      total: filteredLocataires.length,
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des locataires:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
}

/**
 * GET /api/locataires/:id
 * Récupération d'un locataire spécifique
 */
export async function getLocataire(req, res) {
  try {
    const { id } = req.params;
    const userProfile = req.profile;

    // Récupération du locataire avec toutes les infos
    const { data: locataireData, error: locataireError } = await supabaseServer
      .from("locataires")
      .select(`
        *,
        profiles:profile_id (
          id,
          email,
          nom,
          prenom,
          telephone,
          adresse,
          code_postal,
          ville
        ),
        logements:logement_id (
          id,
          numero,
          etage,
          superficie_m2,
          nombre_pieces,
          type_logement,
          statut,
          immeubles:immeuble_id (
            id,
            nom,
            adresse,
            code_postal,
            ville,
            regie_id
          )
        )
      `)
      .eq("id", id)
      .single();

    if (locataireError || !locataireData) {
      return res.status(404).json({
        error: "Locataire non trouvé",
      });
    }

    // Vérification des droits d'accès
    if (userProfile.role === 'locataire' && userProfile.id !== locataireData.profile_id) {
      return res.status(403).json({
        error: "Vous n'avez pas accès à ce locataire",
      });
    }

    if (
      userProfile.role === 'regie' &&
      userProfile.regie_id !== locataireData.logements?.immeubles?.regie_id
    ) {
      return res.status(403).json({
        error: "Vous n'avez pas accès à ce locataire",
      });
    }

    if (userProfile.role !== 'admin_jtec' && 
        userProfile.role !== 'regie' && 
        userProfile.role !== 'locataire') {
      return res.status(403).json({
        error: "Accès refusé",
      });
    }

    return res.status(200).json({
      locataire: locataireData,
    });

  } catch (error) {
    console.error("Erreur lors de la récupération du locataire:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
}

/**
 * PUT /api/locataires/:id
 * Mise à jour d'un locataire
 */
export async function updateLocataire(req, res) {
  try {
    const { id } = req.params;
    const userProfile = req.profile;

    // Vérifier que le locataire existe
    const { data: existingLocataire, error: fetchError } = await supabaseServer
      .from("locataires")
      .select(`
        *,
        logements:logement_id (
          immeubles:immeuble_id (regie_id)
        )
      `)
      .eq("id", id)
      .single();

    if (fetchError || !existingLocataire) {
      return res.status(404).json({
        error: "Locataire non trouvé",
      });
    }

    // Vérification des droits
    const isOwnProfile = userProfile.id === existingLocataire.profile_id;
    const isOwnRegie = userProfile.regie_id === existingLocataire.logements?.immeubles?.regie_id;
    
    if (
      userProfile.role !== 'admin_jtec' &&
      !isOwnRegie &&
      !isOwnProfile
    ) {
      return res.status(403).json({
        error: "Vous n'avez pas les droits pour modifier ce locataire",
      });
    }

    const {
      date_entree,
      date_sortie,
      loyer_mensuel,
      charges_mensuelles,
      depot_garantie,
      statut,
    } = req.body;

    // Construire l'objet de mise à jour
    const updates = {};
    
    // Un locataire ne peut modifier que certains champs (limités ici, à étendre selon besoin)
    if (userProfile.role === 'locataire') {
      // Pour l'instant, un locataire ne peut rien modifier directement
      // (à adapter selon les besoins métier)
      return res.status(403).json({
        error: "Vous ne pouvez pas modifier ces informations. Contactez votre régie.",
      });
    }

    // Régie et admin peuvent tout modifier
    if (date_entree !== undefined) updates.date_entree = date_entree;
    if (date_sortie !== undefined) updates.date_sortie = date_sortie;
    if (loyer_mensuel !== undefined) updates.loyer_mensuel = loyer_mensuel;
    if (charges_mensuelles !== undefined) updates.charges_mensuelles = charges_mensuelles;
    if (depot_garantie !== undefined) updates.depot_garantie = depot_garantie;
    if (statut !== undefined) updates.statut = statut;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: "Aucun champ à mettre à jour",
      });
    }

    // Mise à jour du locataire
    const { data: updatedLocataire, error: updateError } = await supabaseServer
      .from("locataires")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Erreur mise à jour locataire:", updateError);
      return res.status(500).json({
        error: "Erreur lors de la mise à jour du locataire",
        details: updateError.message,
      });
    }

    // Si le statut change à 'parti', mettre à jour le logement
    if (statut === 'parti') {
      await supabaseServer
        .from("logements")
        .update({ statut: 'vacant' })
        .eq("id", existingLocataire.logement_id);
    }

    return res.status(200).json({
      message: "Locataire mis à jour avec succès",
      locataire: updatedLocataire,
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du locataire:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
}

/**
 * DELETE /api/locataires/:id
 * Suppression d'un locataire
 */
export async function deleteLocataire(req, res) {
  try {
    const { id } = req.params;
    const userProfile = req.profile;

    // Vérifier que le locataire existe
    const { data: existingLocataire, error: fetchError } = await supabaseServer
      .from("locataires")
      .select(`
        *,
        logements:logement_id (
          immeubles:immeuble_id (regie_id)
        )
      `)
      .eq("id", id)
      .single();

    if (fetchError || !existingLocataire) {
      return res.status(404).json({
        error: "Locataire non trouvé",
      });
    }

    // Vérification des droits
    if (
      userProfile.role !== 'admin_jtec' &&
      userProfile.regie_id !== existingLocataire.logements?.immeubles?.regie_id
    ) {
      return res.status(403).json({
        error: "Vous n'avez pas les droits pour supprimer ce locataire",
      });
    }

    // Suppression du locataire
    const { error: deleteError } = await supabaseServer
      .from("locataires")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Erreur suppression locataire:", deleteError);
      return res.status(500).json({
        error: "Erreur lors de la suppression du locataire",
        details: deleteError.message,
      });
    }

    // Mettre à jour le statut du logement
    await supabaseServer
      .from("logements")
      .update({ statut: 'vacant' })
      .eq("id", existingLocataire.logement_id);

    return res.status(200).json({
      message: "Locataire supprimé avec succès",
    });

  } catch (error) {
    console.error("Erreur lors de la suppression du locataire:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
}

// Exporter le middleware d'authentification
export { authenticateUser };
