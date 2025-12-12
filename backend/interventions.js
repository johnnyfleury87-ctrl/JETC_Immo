import { supabaseServer } from "./_supabase.js";
import { authenticateUser } from "./profile.js";

/**
 * PUT /api/interventions/:id/start
 * Démarrer une intervention
 */
export async function startIntervention(req, res) {
  try {
    const { id } = req.params;
    const userProfile = req.profile;

    // Seuls les techniciens et entreprises peuvent démarrer une intervention
    if (
      userProfile.role !== "technicien" &&
      userProfile.role !== "entreprise" &&
      userProfile.role !== "admin_jtec"
    ) {
      return res.status(403).json({
        error: "Seuls les techniciens peuvent démarrer une intervention",
      });
    }

    // Récupérer la mission
    const { data: mission, error: missionError } = await supabaseServer
      .from("missions")
      .select("*")
      .eq("id", id)
      .single();

    if (missionError || !mission) {
      return res.status(404).json({
        error: "Mission non trouvée",
      });
    }

    // Vérifier les droits
    if (userProfile.role === "technicien") {
      if (
        mission.technicien_id !== userProfile.id &&
        mission.entreprise_id !== userProfile.entreprise_id
      ) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }
    } else if (userProfile.role === "entreprise") {
      if (mission.entreprise_id !== userProfile.entreprise_id) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }
    }

    // Vérifier le statut
    if (!["planifiée", "en_route", "en_pause"].includes(mission.statut)) {
      return res.status(400).json({
        error: `Impossible de démarrer une intervention avec le statut "${mission.statut}"`,
      });
    }

    // Mettre à jour la mission
    const updateData = {
      statut: "en_cours",
    };

    // Si c'est le premier démarrage, enregistrer la date
    if (!mission.date_intervention_debut) {
      updateData.date_intervention_debut = new Date().toISOString();
    }

    const { data: updatedMission, error: updateError } = await supabaseServer
      .from("missions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Erreur lors du démarrage de l'intervention:", updateError);
      return res.status(500).json({
        error: "Erreur lors du démarrage de l'intervention",
        details: updateError.message,
      });
    }

    // Mettre à jour le statut du ticket
    await supabaseServer
      .from("tickets")
      .update({ statut: "en_cours" })
      .eq("id", mission.ticket_id);

    res.json({
      message: "Intervention démarrée avec succès",
      mission: updatedMission,
    });
  } catch (error) {
    console.error("Erreur dans startIntervention:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}

/**
 * PUT /api/interventions/:id/pause
 * Mettre une intervention en pause
 */
export async function pauseIntervention(req, res) {
  try {
    const { id } = req.params;
    const { motif } = req.body;
    const userProfile = req.profile;

    // Récupérer la mission
    const { data: mission, error: missionError } = await supabaseServer
      .from("missions")
      .select("*")
      .eq("id", id)
      .single();

    if (missionError || !mission) {
      return res.status(404).json({
        error: "Mission non trouvée",
      });
    }

    // Vérifier les droits
    if (userProfile.role === "technicien") {
      if (
        mission.technicien_id !== userProfile.id &&
        mission.entreprise_id !== userProfile.entreprise_id
      ) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }
    } else if (userProfile.role === "entreprise") {
      if (mission.entreprise_id !== userProfile.entreprise_id) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }
    } else if (userProfile.role !== "admin_jtec") {
      return res.status(403).json({
        error: "Accès refusé",
      });
    }

    // Vérifier le statut
    if (mission.statut !== "en_cours") {
      return res.status(400).json({
        error: "Seule une intervention en cours peut être mise en pause",
      });
    }

    // Mettre à jour la mission
    const { data: updatedMission, error: updateError } = await supabaseServer
      .from("missions")
      .update({
        statut: "en_pause",
        notes_internes: motif
          ? `${mission.notes_internes || ""}\n[Pause] ${motif}`
          : mission.notes_internes,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Erreur lors de la mise en pause:", updateError);
      return res.status(500).json({
        error: "Erreur lors de la mise en pause",
        details: updateError.message,
      });
    }

    res.json({
      message: "Intervention mise en pause",
      mission: updatedMission,
    });
  } catch (error) {
    console.error("Erreur dans pauseIntervention:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}

/**
 * PUT /api/interventions/:id/report-delay
 * Signaler un retard
 *
 * Body attendu :
 * {
 *   motif_retard: string,
 *   nouvelle_date_prevue?: timestamp
 * }
 */
export async function reportDelay(req, res) {
  try {
    const { id } = req.params;
    const { motif_retard, nouvelle_date_prevue } = req.body;
    const userProfile = req.profile;

    if (!motif_retard) {
      return res.status(400).json({
        error: "Le motif du retard est obligatoire",
      });
    }

    // Récupérer la mission
    const { data: mission, error: missionError } = await supabaseServer
      .from("missions")
      .select("*")
      .eq("id", id)
      .single();

    if (missionError || !mission) {
      return res.status(404).json({
        error: "Mission non trouvée",
      });
    }

    // Vérifier les droits
    if (userProfile.role === "technicien") {
      if (
        mission.technicien_id !== userProfile.id &&
        mission.entreprise_id !== userProfile.entreprise_id
      ) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }
    } else if (userProfile.role === "entreprise") {
      if (mission.entreprise_id !== userProfile.entreprise_id) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }
    } else if (userProfile.role !== "admin_jtec") {
      return res.status(403).json({
        error: "Accès refusé",
      });
    }

    // Mettre à jour la mission
    const updateData = {
      est_en_retard: true,
      motif_retard,
      statut: "reportée",
    };

    if (nouvelle_date_prevue) {
      updateData.nouvelle_date_prevue = nouvelle_date_prevue;
    }

    const { data: updatedMission, error: updateError } = await supabaseServer
      .from("missions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Erreur lors du signalement du retard:", updateError);
      return res.status(500).json({
        error: "Erreur lors du signalement du retard",
        details: updateError.message,
      });
    }

    res.json({
      message: "Retard signalé avec succès",
      mission: updatedMission,
    });
  } catch (error) {
    console.error("Erreur dans reportDelay:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}

/**
 * PUT /api/interventions/:id/complete
 * Terminer une intervention avec rapport
 *
 * Body attendu :
 * {
 *   rapport_intervention?: string,
 *   travaux_realises: string (obligatoire),
 *   materiel_utilise?: string[],
 *   photos_urls?: string[],
 *   montant_final?: number
 * }
 */
export async function completeIntervention(req, res) {
  try {
    const { id } = req.params;
    const {
      rapport_intervention,
      travaux_realises,
      materiel_utilise = [],
      photos_urls = [],
      montant_final,
    } = req.body;
    const userProfile = req.profile;

    if (!travaux_realises) {
      return res.status(400).json({
        error: "La description des travaux réalisés est obligatoire",
      });
    }

    // Récupérer la mission
    const { data: mission, error: missionError } = await supabaseServer
      .from("missions")
      .select("*")
      .eq("id", id)
      .single();

    if (missionError || !mission) {
      return res.status(404).json({
        error: "Mission non trouvée",
      });
    }

    // Vérifier les droits
    if (userProfile.role === "technicien") {
      if (
        mission.technicien_id !== userProfile.id &&
        mission.entreprise_id !== userProfile.entreprise_id
      ) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }
    } else if (userProfile.role === "entreprise") {
      if (mission.entreprise_id !== userProfile.entreprise_id) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }
    } else if (userProfile.role !== "admin_jtec") {
      return res.status(403).json({
        error: "Accès refusé",
      });
    }

    // Vérifier le statut
    if (!["en_cours", "en_pause"].includes(mission.statut)) {
      return res.status(400).json({
        error: `Impossible de terminer une intervention avec le statut "${mission.statut}"`,
      });
    }

    // Mettre à jour la mission
    const updateData = {
      statut: "terminée",
      rapport_intervention: rapport_intervention || travaux_realises,
      travaux_realises,
      materiel_utilise,
      photos_urls,
      date_intervention_fin: new Date().toISOString(),
    };

    if (montant_final !== undefined) {
      updateData.montant_final = montant_final;
    }

    const { data: updatedMission, error: updateError } = await supabaseServer
      .from("missions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Erreur lors de la finalisation:", updateError);
      return res.status(500).json({
        error: "Erreur lors de la finalisation de l'intervention",
        details: updateError.message,
      });
    }

    // Mettre à jour le statut du ticket
    await supabaseServer
      .from("tickets")
      .update({
        statut: "terminé",
        date_cloture: new Date().toISOString(),
      })
      .eq("id", mission.ticket_id);

    res.json({
      message: "Intervention terminée avec succès",
      mission: updatedMission,
    });
  } catch (error) {
    console.error("Erreur dans completeIntervention:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}

/**
 * PUT /api/interventions/:id/add-signature
 * Ajouter une signature (client ou technicien)
 *
 * Body attendu :
 * {
 *   type: 'client' | 'technicien',
 *   signature_url: string (URL vers Supabase Storage)
 * }
 */
export async function addSignature(req, res) {
  try {
    const { id } = req.params;
    const { type, signature_url } = req.body;
    const userProfile = req.profile;

    if (!type || !signature_url) {
      return res.status(400).json({
        error: "Type et URL de signature sont obligatoires",
      });
    }

    if (!["client", "technicien"].includes(type)) {
      return res.status(400).json({
        error: "Type doit être 'client' ou 'technicien'",
      });
    }

    // Récupérer la mission
    const { data: mission, error: missionError } = await supabaseServer
      .from("missions")
      .select("*")
      .eq("id", id)
      .single();

    if (missionError || !mission) {
      return res.status(404).json({
        error: "Mission non trouvée",
      });
    }

    // Vérifier les droits
    if (type === "technicien") {
      if (userProfile.role === "technicien") {
        if (
          mission.technicien_id !== userProfile.id &&
          mission.entreprise_id !== userProfile.entreprise_id
        ) {
          return res.status(403).json({
            error: "Accès refusé",
          });
        }
      } else if (userProfile.role === "entreprise") {
        if (mission.entreprise_id !== userProfile.entreprise_id) {
          return res.status(403).json({
            error: "Accès refusé",
          });
        }
      } else if (userProfile.role !== "admin_jtec") {
        return res.status(403).json({
          error:
            "Seuls les techniciens et entreprises peuvent ajouter leur signature",
        });
      }
    } else if (type === "client") {
      // Pour la signature client, on peut étendre pour permettre au locataire de signer
      // Pour l'instant, on autorise les techniciens/entreprises à uploader pour le client
      if (userProfile.role === "technicien") {
        if (
          mission.technicien_id !== userProfile.id &&
          mission.entreprise_id !== userProfile.entreprise_id
        ) {
          return res.status(403).json({
            error: "Accès refusé",
          });
        }
      } else if (userProfile.role === "entreprise") {
        if (mission.entreprise_id !== userProfile.entreprise_id) {
          return res.status(403).json({
            error: "Accès refusé",
          });
        }
      } else if (
        userProfile.role !== "admin_jtec" &&
        userProfile.role !== "locataire"
      ) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }
    }

    // Mettre à jour la mission
    const updateData = {};

    if (type === "client") {
      updateData.signature_client_url = signature_url;
    } else {
      updateData.signature_technicien_url = signature_url;
    }

    // Si les deux signatures sont présentes, enregistrer la date
    if (
      (type === "client" && mission.signature_technicien_url) ||
      (type === "technicien" && mission.signature_client_url)
    ) {
      updateData.date_signature = new Date().toISOString();
    }

    const { data: updatedMission, error: updateError } = await supabaseServer
      .from("missions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Erreur lors de l'ajout de la signature:", updateError);
      return res.status(500).json({
        error: "Erreur lors de l'ajout de la signature",
        details: updateError.message,
      });
    }

    res.json({
      message: `Signature ${type} ajoutée avec succès`,
      mission: updatedMission,
    });
  } catch (error) {
    console.error("Erreur dans addSignature:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}

/**
 * POST /api/interventions/:id/upload-photo
 * Uploader une photo d'intervention
 * Note : Cette route retourne une URL signée pour l'upload
 * L'upload réel se fait ensuite directement vers Supabase Storage
 *
 * Body attendu :
 * {
 *   filename: string
 * }
 */
export async function getPhotoUploadUrl(req, res) {
  try {
    const { id } = req.params;
    const { filename } = req.body;
    const userProfile = req.profile;

    if (!filename) {
      return res.status(400).json({
        error: "Le nom du fichier est obligatoire",
      });
    }

    // Récupérer la mission
    const { data: mission, error: missionError } = await supabaseServer
      .from("missions")
      .select("entreprise_id, technicien_id")
      .eq("id", id)
      .single();

    if (missionError || !mission) {
      return res.status(404).json({
        error: "Mission non trouvée",
      });
    }

    // Vérifier les droits
    if (userProfile.role === "technicien") {
      if (
        mission.technicien_id !== userProfile.id &&
        mission.entreprise_id !== userProfile.entreprise_id
      ) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }
    } else if (userProfile.role === "entreprise") {
      if (mission.entreprise_id !== userProfile.entreprise_id) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }
    } else if (userProfile.role !== "admin_jtec") {
      return res.status(403).json({
        error: "Accès refusé",
      });
    }

    // Générer le chemin de stockage
    const timestamp = Date.now();
    const filePath = `${id}/${timestamp}_${filename}`;

    // Créer une URL signée pour l'upload (valide 1 heure)
    const { data, error } = await supabaseServer.storage
      .from("photos-missions")
      .createSignedUploadUrl(filePath);

    if (error) {
      console.error("Erreur lors de la génération de l'URL d'upload:", error);
      return res.status(500).json({
        error: "Erreur lors de la génération de l'URL d'upload",
        details: error.message,
      });
    }

    res.json({
      message: "URL d'upload générée avec succès",
      upload_url: data.signedUrl,
      file_path: filePath,
      expires_in: 3600, // 1 heure
    });
  } catch (error) {
    console.error("Erreur dans getPhotoUploadUrl:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}

/**
 * GET /api/interventions/:id/photos
 * Récupérer les URLs des photos d'une intervention
 */
export async function getInterventionPhotos(req, res) {
  try {
    const { id } = req.params;
    const userProfile = req.profile;

    // Récupérer la mission avec le ticket pour vérifier les droits
    const { data: mission, error: missionError } = await supabaseServer
      .from("missions")
      .select(
        `
        *,
        tickets:ticket_id (
          regie_id,
          locataire_id
        )
      `
      )
      .eq("id", id)
      .single();

    if (missionError || !mission) {
      return res.status(404).json({
        error: "Mission non trouvée",
      });
    }

    // Vérifier les droits d'accès
    let hasAccess = false;
    if (userProfile.role === "admin_jtec") {
      hasAccess = true;
    } else if (
      userProfile.role === "entreprise" ||
      userProfile.role === "technicien"
    ) {
      hasAccess = mission.entreprise_id === userProfile.entreprise_id;
    } else if (userProfile.role === "regie") {
      hasAccess = mission.tickets.regie_id === userProfile.regie_id;
    } else if (userProfile.role === "locataire") {
      const { data: locataire } = await supabaseServer
        .from("locataires")
        .select("id")
        .eq("profile_id", userProfile.id)
        .single();
      hasAccess = locataire && mission.tickets.locataire_id === locataire.id;
    }

    if (!hasAccess) {
      return res.status(403).json({
        error: "Accès refusé",
      });
    }

    // Lister les fichiers dans le dossier de la mission
    const { data: files, error: listError } = await supabaseServer.storage
      .from("photos-missions")
      .list(id, {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (listError) {
      console.error("Erreur lors de la récupération des photos:", listError);
      return res.status(500).json({
        error: "Erreur lors de la récupération des photos",
        details: listError.message,
      });
    }

    // Générer des URLs signées pour chaque photo (valides 1 heure)
    const photosWithUrls = await Promise.all(
      files.map(async (file) => {
        const { data: urlData } = await supabaseServer.storage
          .from("photos-missions")
          .createSignedUrl(`${id}/${file.name}`, 3600);

        return {
          name: file.name,
          url: urlData?.signedUrl,
          created_at: file.created_at,
          size: file.metadata?.size,
        };
      })
    );

    res.json({
      mission_id: id,
      photos: photosWithUrls,
      count: photosWithUrls.length,
    });
  } catch (error) {
    console.error("Erreur dans getInterventionPhotos:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}
