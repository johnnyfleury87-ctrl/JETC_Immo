import { supabaseServer } from "./_supabase.js";
import { authenticateUser } from "./profile.js";

/**
 * POST /api/missions/accept-ticket
 * Accepter un ticket et créer une mission
 *
 * Body attendu :
 * {
 *   ticket_id: uuid (obligatoire),
 *   titre?: string,
 *   description?: string,
 *   date_intervention_prevue?: timestamp,
 *   duree_estimee_minutes?: number,
 *   montant_estime?: number,
 *   notes_internes?: string,
 *   materiel_necessaire?: string[]
 * }
 */
export async function acceptTicket(req, res) {
  try {
    const {
      ticket_id,
      titre,
      description,
      date_intervention_prevue,
      duree_estimee_minutes,
      montant_estime,
      notes_internes,
      materiel_necessaire = [],
    } = req.body;

    // Validation
    if (!ticket_id) {
      return res.status(400).json({
        error: "Le champ ticket_id est obligatoire",
      });
    }

    const userProfile = req.profile;

    // Seules les entreprises peuvent accepter des tickets
    if (
      userProfile.role !== "entreprise" &&
      userProfile.role !== "admin_jtec"
    ) {
      return res.status(403).json({
        error: "Seules les entreprises peuvent accepter des tickets",
      });
    }

    // Récupérer le ticket
    const { data: ticket, error: ticketError } = await supabaseServer
      .from("tickets")
      .select("*")
      .eq("id", ticket_id)
      .single();

    if (ticketError || !ticket) {
      return res.status(404).json({
        error: "Ticket non trouvé",
      });
    }

    // Vérifier que le ticket est dans un état qui permet l'acceptation
    if (
      !["diffusé", "nouveau", "en_attente_diffusion"].includes(ticket.statut)
    ) {
      return res.status(400).json({
        error: `Ce ticket ne peut pas être accepté (statut actuel: ${ticket.statut})`,
      });
    }

    // Vérifier que l'entreprise a accès à ce ticket
    if (userProfile.role === "entreprise") {
      if (ticket.diffusion_mode === "restreint") {
        if (
          !ticket.entreprises_autorisees.includes(userProfile.entreprise_id)
        ) {
          return res.status(403).json({
            error: "Vous n'êtes pas autorisé à accepter ce ticket",
          });
        }
      }
    }

    // Vérifier qu'une mission n'existe pas déjà pour ce ticket (empêcher les doublons)
    const { data: existingMission, error: missionCheckError } =
      await supabaseServer
        .from("missions")
        .select("id, entreprise_id")
        .eq("ticket_id", ticket_id)
        .single();

    if (existingMission) {
      return res.status(409).json({
        error: "Ce ticket a déjà été accepté par une entreprise",
        mission_id: existingMission.id,
      });
    }

    // Créer la mission
    const missionData = {
      ticket_id,
      entreprise_id:
        userProfile.role === "entreprise"
          ? userProfile.entreprise_id
          : req.body.entreprise_id,
      titre: titre || ticket.titre,
      description: description || ticket.description,
      statut: date_intervention_prevue ? "planifiée" : "en_attente",
      date_intervention_prevue,
      duree_estimee_minutes,
      montant_estime,
      notes_internes,
      materiel_necessaire,
      is_demo: ticket.is_demo,
    };

    const { data: mission, error: createError } = await supabaseServer
      .from("missions")
      .insert(missionData)
      .select()
      .single();

    if (createError) {
      console.error("Erreur lors de la création de la mission:", createError);
      return res.status(500).json({
        error: "Erreur lors de la création de la mission",
        details: createError.message,
      });
    }

    // Mettre à jour le statut du ticket
    const { error: updateTicketError } = await supabaseServer
      .from("tickets")
      .update({
        statut: "accepté",
        date_acceptation: new Date().toISOString(),
      })
      .eq("id", ticket_id);

    if (updateTicketError) {
      console.error(
        "Erreur lors de la mise à jour du ticket:",
        updateTicketError
      );
      // Note : la mission a été créée, mais le ticket n'a pas été mis à jour
      // On retourne quand même un succès avec un avertissement
      return res.status(201).json({
        message:
          "Mission créée avec succès, mais erreur lors de la mise à jour du ticket",
        mission,
        warning: updateTicketError.message,
      });
    }

    res.status(201).json({
      message: "Ticket accepté et mission créée avec succès",
      mission,
    });
  } catch (error) {
    console.error("Erreur dans acceptTicket:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}

/**
 * GET /api/missions
 * Liste des missions avec filtrage selon le rôle
 *
 * Query params optionnels :
 * - statut: string
 * - entreprise_id: uuid
 * - technicien_id: uuid
 * - ticket_id: uuid
 */
export async function listMissions(req, res) {
  try {
    const userProfile = req.profile;
    const { statut, entreprise_id, technicien_id, ticket_id } = req.query;

    let query = supabaseServer
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
          statut,
          logement_id,
          locataire_id,
          regie_id
        ),
        entreprises:entreprise_id (
          id,
          nom,
          email,
          telephone
        )
      `
      )
      .order("created_at", { ascending: false });

    // Filtrage selon le rôle
    if (userProfile.role === "entreprise") {
      query = query.eq("entreprise_id", userProfile.entreprise_id);
    } else if (userProfile.role === "technicien") {
      // Un technicien peut voir soit ses missions assignées, soit toutes les missions de son entreprise
      query = query.eq("entreprise_id", userProfile.entreprise_id);
    } else if (userProfile.role === "regie") {
      // Une régie voit les missions liées à ses tickets
      const { data: regieTickets } = await supabaseServer
        .from("tickets")
        .select("id")
        .eq("regie_id", userProfile.regie_id);

      if (regieTickets && regieTickets.length > 0) {
        const ticketIds = regieTickets.map((t) => t.id);
        query = query.in("ticket_id", ticketIds);
      } else {
        return res.json({ missions: [] });
      }
    } else if (userProfile.role === "locataire") {
      // Un locataire voit les missions liées à ses tickets
      const { data: locataireData } = await supabaseServer
        .from("locataires")
        .select("id")
        .eq("profile_id", userProfile.id)
        .single();

      if (locataireData) {
        const { data: locataireTickets } = await supabaseServer
          .from("tickets")
          .select("id")
          .eq("locataire_id", locataireData.id);

        if (locataireTickets && locataireTickets.length > 0) {
          const ticketIds = locataireTickets.map((t) => t.id);
          query = query.in("ticket_id", ticketIds);
        } else {
          return res.json({ missions: [] });
        }
      } else {
        return res.json({ missions: [] });
      }
    } else if (userProfile.role !== "admin_jtec") {
      return res.status(403).json({
        error: "Rôle non autorisé",
      });
    }

    // Filtres optionnels
    if (statut) {
      query = query.eq("statut", statut);
    }
    if (entreprise_id && userProfile.role === "admin_jtec") {
      query = query.eq("entreprise_id", entreprise_id);
    }
    if (technicien_id) {
      query = query.eq("technicien_id", technicien_id);
    }
    if (ticket_id) {
      query = query.eq("ticket_id", ticket_id);
    }

    const { data: missions, error } = await query;

    if (error) {
      console.error("Erreur lors de la récupération des missions:", error);
      return res.status(500).json({
        error: "Erreur lors de la récupération des missions",
        details: error.message,
      });
    }

    res.json({ missions });
  } catch (error) {
    console.error("Erreur dans listMissions:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}

/**
 * GET /api/missions/:id
 * Récupérer une mission spécifique
 */
export async function getMission(req, res) {
  try {
    const { id } = req.params;
    const userProfile = req.profile;

    const { data: mission, error } = await supabaseServer
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
          statut,
          date_souhaitee_intervention,
          locataires:locataire_id (
            id,
            profiles:profile_id (
              nom,
              prenom,
              email,
              telephone
            )
          ),
          logements:logement_id (
            id,
            numero,
            type_logement,
            etage,
            immeubles:immeuble_id (
              nom,
              adresse,
              code_postal,
              ville
            )
          ),
          regies:regie_id (
            id,
            nom,
            email,
            telephone
          )
        ),
        entreprises:entreprise_id (
          id,
          nom,
          email,
          telephone,
          adresse
        )
      `
      )
      .eq("id", id)
      .single();

    if (error || !mission) {
      return res.status(404).json({
        error: "Mission non trouvée",
      });
    }

    // Vérification des droits d'accès
    if (
      userProfile.role === "entreprise" ||
      userProfile.role === "technicien"
    ) {
      if (mission.entreprise_id !== userProfile.entreprise_id) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }
    } else if (userProfile.role === "regie") {
      if (mission.tickets.regie_id !== userProfile.regie_id) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }
    } else if (userProfile.role === "locataire") {
      const { data: locataireData } = await supabaseServer
        .from("locataires")
        .select("id")
        .eq("profile_id", userProfile.id)
        .single();

      if (!locataireData || mission.tickets.locataire_id !== locataireData.id) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }
    } else if (userProfile.role !== "admin_jtec") {
      return res.status(403).json({
        error: "Accès refusé",
      });
    }

    res.json({ mission });
  } catch (error) {
    console.error("Erreur dans getMission:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}

/**
 * PUT /api/missions/:id
 * Mettre à jour une mission
 *
 * Champs modifiables selon le rôle :
 * - Entreprise : tous les champs sauf ticket_id
 * - Technicien : statut, dates intervention, rapport, photos, signature
 * - Régie : consultation principalement (peu de modifications autorisées)
 * - Admin : tous les champs
 */
export async function updateMission(req, res) {
  try {
    const { id } = req.params;
    const userProfile = req.profile;

    // Récupérer la mission existante
    const { data: existingMission, error: fetchError } = await supabaseServer
      .from("missions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingMission) {
      return res.status(404).json({
        error: "Mission non trouvée",
      });
    }

    let allowedFields = [];
    let updateData = {};

    // Déterminer les champs modifiables selon le rôle
    if (userProfile.role === "entreprise") {
      // Vérifier que c'est bien l'entreprise de la mission
      if (existingMission.entreprise_id !== userProfile.entreprise_id) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }

      allowedFields = [
        "titre",
        "description",
        "statut",
        "technicien_id",
        "date_intervention_prevue",
        "date_intervention_debut",
        "date_intervention_fin",
        "duree_estimee_minutes",
        "notes_internes",
        "materiel_necessaire",
        "est_en_retard",
        "motif_retard",
        "nouvelle_date_prevue",
        "rapport_intervention",
        "travaux_realises",
        "materiel_utilise",
        "photos_urls",
        "signature_client_url",
        "signature_technicien_url",
        "date_signature",
        "montant_estime",
        "montant_final",
      ];
    } else if (userProfile.role === "technicien") {
      // Vérifier que c'est bien le technicien assigné ou de la même entreprise
      if (existingMission.entreprise_id !== userProfile.entreprise_id) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }

      allowedFields = [
        "statut",
        "date_intervention_debut",
        "date_intervention_fin",
        "est_en_retard",
        "motif_retard",
        "nouvelle_date_prevue",
        "rapport_intervention",
        "travaux_realises",
        "materiel_utilise",
        "photos_urls",
        "signature_technicien_url",
        "date_signature",
      ];
    } else if (userProfile.role === "admin_jtec") {
      // Admin peut tout modifier
      allowedFields = [
        "titre",
        "description",
        "statut",
        "entreprise_id",
        "technicien_id",
        "date_intervention_prevue",
        "date_intervention_debut",
        "date_intervention_fin",
        "duree_estimee_minutes",
        "notes_internes",
        "materiel_necessaire",
        "est_en_retard",
        "motif_retard",
        "nouvelle_date_prevue",
        "rapport_intervention",
        "travaux_realises",
        "materiel_utilise",
        "photos_urls",
        "signature_client_url",
        "signature_technicien_url",
        "date_signature",
        "montant_estime",
        "montant_final",
        "facture_id",
      ];
    } else {
      return res.status(403).json({
        error: "Vous n'avez pas les droits pour modifier cette mission",
      });
    }

    // Filtrer les champs autorisés
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Si aucun champ à modifier
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: "Aucun champ à modifier",
      });
    }

    // Validation des transitions de statut
    const validTransitions = {
      en_attente: ["planifiée", "annulée"],
      planifiée: ["en_route", "reportée", "annulée"],
      en_route: ["en_cours", "reportée", "annulée"],
      en_cours: ["en_pause", "terminée", "reportée"],
      en_pause: ["en_cours", "terminée", "reportée", "annulée"],
      reportée: ["planifiée", "annulée"],
    };

    if (updateData.statut && updateData.statut !== existingMission.statut) {
      if (validTransitions[existingMission.statut]) {
        if (
          !validTransitions[existingMission.statut].includes(updateData.statut)
        ) {
          return res.status(400).json({
            error: `Transition de statut non autorisée de ${existingMission.statut} vers ${updateData.statut}`,
          });
        }
      }
    }

    // Mettre à jour la mission
    const { data: updatedMission, error: updateError } = await supabaseServer
      .from("missions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error(
        "Erreur lors de la mise à jour de la mission:",
        updateError
      );
      return res.status(500).json({
        error: "Erreur lors de la mise à jour de la mission",
        details: updateError.message,
      });
    }

    // Si la mission est terminée, mettre à jour le statut du ticket
    if (updateData.statut === "terminée") {
      await supabaseServer
        .from("tickets")
        .update({
          statut: "terminé",
          date_cloture: new Date().toISOString(),
        })
        .eq("id", existingMission.ticket_id);
    }

    res.json({
      message: "Mission mise à jour avec succès",
      mission: updatedMission,
    });
  } catch (error) {
    console.error("Erreur dans updateMission:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}

/**
 * DELETE /api/missions/:id
 * Supprimer une mission
 */
export async function deleteMission(req, res) {
  try {
    const { id } = req.params;
    const userProfile = req.profile;

    // Récupérer la mission
    const { data: mission, error: fetchError } = await supabaseServer
      .from("missions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !mission) {
      return res.status(404).json({
        error: "Mission non trouvée",
      });
    }

    // Vérification des droits
    if (userProfile.role === "entreprise") {
      if (mission.entreprise_id !== userProfile.entreprise_id) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }

      // Une entreprise ne peut supprimer que les missions non commencées
      if (!["en_attente", "planifiée"].includes(mission.statut)) {
        return res.status(403).json({
          error: "Vous ne pouvez supprimer que les missions non commencées",
        });
      }
    } else if (userProfile.role !== "admin_jtec") {
      return res.status(403).json({
        error: "Vous n'avez pas les droits pour supprimer cette mission",
      });
    }

    // Supprimer la mission
    const { error: deleteError } = await supabaseServer
      .from("missions")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error(
        "Erreur lors de la suppression de la mission:",
        deleteError
      );
      return res.status(500).json({
        error: "Erreur lors de la suppression de la mission",
        details: deleteError.message,
      });
    }

    // Remettre le ticket en statut "diffusé" pour permettre à une autre entreprise de l'accepter
    await supabaseServer
      .from("tickets")
      .update({ statut: "diffusé" })
      .eq("id", mission.ticket_id);

    res.json({
      message: "Mission supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur dans deleteMission:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}

/**
 * PUT /api/missions/:id/assign-technicien
 * Assigner un technicien à une mission
 *
 * Body attendu :
 * {
 *   technicien_id: uuid (obligatoire),
 *   date_intervention_prevue?: timestamp
 * }
 */
export async function assignTechnicien(req, res) {
  try {
    const { id } = req.params;
    const { technicien_id, date_intervention_prevue } = req.body;
    const userProfile = req.profile;

    // Validation
    if (!technicien_id) {
      return res.status(400).json({
        error: "Le champ technicien_id est obligatoire",
      });
    }

    // Seules les entreprises peuvent assigner des techniciens
    if (
      userProfile.role !== "entreprise" &&
      userProfile.role !== "admin_jtec"
    ) {
      return res.status(403).json({
        error: "Seules les entreprises peuvent assigner des techniciens",
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

    // Vérifier que c'est bien l'entreprise de la mission
    if (
      userProfile.role === "entreprise" &&
      mission.entreprise_id !== userProfile.entreprise_id
    ) {
      return res.status(403).json({
        error: "Accès refusé",
      });
    }

    // Vérifier que le technicien existe et appartient à l'entreprise
    const { data: technicien, error: technicienError } = await supabaseServer
      .from("profiles")
      .select("*")
      .eq("id", technicien_id)
      .eq("role", "technicien")
      .single();

    if (technicienError || !technicien) {
      return res.status(404).json({
        error: "Technicien non trouvé",
      });
    }

    if (technicien.entreprise_id !== mission.entreprise_id) {
      return res.status(403).json({
        error: "Ce technicien n'appartient pas à votre entreprise",
      });
    }

    // Préparer les données de mise à jour
    const updateData = {
      technicien_id,
    };

    // Si une date d'intervention est fournie, mettre à jour et passer en statut "planifiée"
    if (date_intervention_prevue) {
      updateData.date_intervention_prevue = date_intervention_prevue;
      if (mission.statut === "en_attente") {
        updateData.statut = "planifiée";
      }
    }

    // Mettre à jour la mission
    const { data: updatedMission, error: updateError } = await supabaseServer
      .from("missions")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        techniciens:technicien_id (
          id,
          nom,
          prenom,
          email,
          telephone
        )
      `
      )
      .single();

    if (updateError) {
      console.error("Erreur lors de l'assignation du technicien:", updateError);
      return res.status(500).json({
        error: "Erreur lors de l'assignation du technicien",
        details: updateError.message,
      });
    }

    res.json({
      message: "Technicien assigné avec succès",
      mission: updatedMission,
    });
  } catch (error) {
    console.error("Erreur dans assignTechnicien:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}
