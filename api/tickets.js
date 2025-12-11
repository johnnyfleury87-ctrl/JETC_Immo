import { supabaseServer } from "./_supabase.js";
import { authenticateUser } from "./profile.js";

/**
 * POST /api/tickets
 * Création d'un nouveau ticket
 * 
 * Body attendu :
 * {
 *   locataire_id: uuid (obligatoire si role=locataire),
 *   logement_id: uuid (obligatoire),
 *   titre: string (obligatoire),
 *   description: string (obligatoire),
 *   categorie?: string,
 *   priorite?: 'basse' | 'normale' | 'haute' | 'urgente',
 *   date_souhaitee_intervention?: date,
 *   diffusion_mode?: 'general' | 'restreint',
 *   entreprises_autorisees?: uuid[],
 *   is_demo?: boolean
 * }
 */
export async function createTicket(req, res) {
  try {
    const {
      locataire_id,
      logement_id,
      titre,
      description,
      categorie,
      priorite = 'normale',
      date_souhaitee_intervention,
      diffusion_mode = 'general',
      entreprises_autorisees = [],
      is_demo = false,
    } = req.body;

    // Validation des champs obligatoires
    if (!titre || !description || !logement_id) {
      return res.status(400).json({
        error: "Les champs titre, description et logement_id sont obligatoires",
      });
    }

    const userProfile = req.profile;
    let finalLocataireId = locataire_id;
    let regieId;

    // Si l'utilisateur est un locataire, on récupère automatiquement son locataire_id
    if (userProfile.role === 'locataire') {
      const { data: locataireData, error: locataireError } = await supabaseServer
        .from("locataires")
        .select("id, logement_id")
        .eq("profile_id", userProfile.id)
        .eq("statut", "actif")
        .single();

      if (locataireError || !locataireData) {
        return res.status(404).json({
          error: "Aucun locataire actif trouvé pour ce profil",
        });
      }

      finalLocataireId = locataireData.id;

      // Vérifier que le logement correspond à celui du locataire
      if (locataireData.logement_id !== logement_id) {
        return res.status(403).json({
          error: "Vous ne pouvez créer un ticket que pour votre logement",
        });
      }
    }

    // Vérifier que le logement existe et récupérer la regie_id
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

    regieId = logementData.immeubles.regie_id;

    // Si l'utilisateur est une régie, vérifier qu'il s'agit de sa régie
    if (userProfile.role === 'regie' && userProfile.regie_id !== regieId) {
      return res.status(403).json({
        error: "Vous ne pouvez pas créer un ticket pour un logement d'une autre régie",
      });
    }

    // Si finalLocataireId n'est pas défini et que c'est une régie qui crée le ticket
    if (!finalLocataireId && userProfile.role === 'regie') {
      // La régie peut créer un ticket sans locataire (ex: travaux préventifs)
      // Dans ce cas, on récupère le locataire du logement s'il existe
      const { data: locataireLogement } = await supabaseServer
        .from("locataires")
        .select("id")
        .eq("logement_id", logement_id)
        .eq("statut", "actif")
        .single();

      if (locataireLogement) {
        finalLocataireId = locataireLogement.id;
      } else {
        return res.status(400).json({
          error: "Aucun locataire actif trouvé pour ce logement. Veuillez spécifier locataire_id.",
        });
      }
    }

    // Validation du mode de diffusion
    if (diffusion_mode === 'restreint' && (!entreprises_autorisees || entreprises_autorisees.length === 0)) {
      return res.status(400).json({
        error: "En mode restreint, vous devez spécifier au moins une entreprise autorisée",
      });
    }

    // Validation des entreprises autorisées
    if (diffusion_mode === 'restreint' && entreprises_autorisees.length > 0) {
      const { data: entreprisesData, error: entreprisesError } = await supabaseServer
        .from("entreprises")
        .select("id")
        .in("id", entreprises_autorisees);

      if (entreprisesError || entreprisesData.length !== entreprises_autorisees.length) {
        return res.status(400).json({
          error: "Une ou plusieurs entreprises spécifiées n'existent pas",
        });
      }
    }

    // Créer le ticket
    const { data: ticket, error: ticketError } = await supabaseServer
      .from("tickets")
      .insert({
        locataire_id: finalLocataireId,
        logement_id,
        regie_id: regieId,
        titre,
        description,
        categorie,
        priorite,
        statut: 'nouveau',
        date_souhaitee_intervention,
        diffusion_mode,
        entreprises_autorisees: diffusion_mode === 'restreint' ? entreprises_autorisees : [],
        is_demo,
      })
      .select()
      .single();

    if (ticketError) {
      console.error("Erreur lors de la création du ticket:", ticketError);
      return res.status(500).json({
        error: "Erreur lors de la création du ticket",
        details: ticketError.message,
      });
    }

    res.status(201).json({
      message: "Ticket créé avec succès",
      ticket,
    });
  } catch (error) {
    console.error("Erreur dans createTicket:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}

/**
 * GET /api/tickets
 * Liste des tickets avec filtrage selon le rôle
 * 
 * Query params optionnels :
 * - statut: string
 * - priorite: string
 * - categorie: string
 * - logement_id: uuid
 * - regie_id: uuid
 */
export async function listTickets(req, res) {
  try {
    const userProfile = req.profile;
    const { statut, priorite, categorie, logement_id, regie_id } = req.query;

    let query = supabaseServer
      .from("tickets")
      .select(`
        *,
        locataires:locataire_id (
          id,
          profile_id,
          logement_id,
          statut,
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
          immeubles:immeuble_id (
            nom,
            adresse,
            ville
          )
        ),
        regies:regie_id (
          id,
          nom,
          email
        )
      `)
      .order("created_at", { ascending: false });

    // Filtrage selon le rôle
    if (userProfile.role === 'locataire') {
      // Un locataire ne voit que ses propres tickets
      const { data: locataireData } = await supabaseServer
        .from("locataires")
        .select("id")
        .eq("profile_id", userProfile.id)
        .single();

      if (locataireData) {
        query = query.eq("locataire_id", locataireData.id);
      } else {
        return res.json({ tickets: [] });
      }
    } else if (userProfile.role === 'regie') {
      // Une régie voit tous les tickets de ses logements
      query = query.eq("regie_id", userProfile.regie_id);
    } else if (userProfile.role === 'entreprise' || userProfile.role === 'technicien') {
      // Une entreprise voit les tickets selon le mode de diffusion
      query = query.or(`
        diffusion_mode.eq.general,
        and(diffusion_mode.eq.restreint,entreprises_autorisees.cs.{${userProfile.entreprise_id}})
      `);
    } else if (userProfile.role !== 'admin_jtec') {
      return res.status(403).json({
        error: "Rôle non autorisé",
      });
    }

    // Filtres optionnels
    if (statut) {
      query = query.eq("statut", statut);
    }
    if (priorite) {
      query = query.eq("priorite", priorite);
    }
    if (categorie) {
      query = query.eq("categorie", categorie);
    }
    if (logement_id) {
      query = query.eq("logement_id", logement_id);
    }
    if (regie_id) {
      query = query.eq("regie_id", regie_id);
    }

    const { data: tickets, error } = await query;

    if (error) {
      console.error("Erreur lors de la récupération des tickets:", error);
      return res.status(500).json({
        error: "Erreur lors de la récupération des tickets",
        details: error.message,
      });
    }

    res.json({ tickets });
  } catch (error) {
    console.error("Erreur dans listTickets:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}

/**
 * GET /api/tickets/:id
 * Récupérer un ticket spécifique
 */
export async function getTicket(req, res) {
  try {
    const { id } = req.params;
    const userProfile = req.profile;

    const { data: ticket, error } = await supabaseServer
      .from("tickets")
      .select(`
        *,
        locataires:locataire_id (
          id,
          profile_id,
          logement_id,
          date_entree,
          loyer_mensuel,
          statut,
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
          superficie_m2,
          etage,
          immeubles:immeuble_id (
            id,
            nom,
            adresse,
            code_postal,
            ville,
            regie_id
          )
        ),
        regies:regie_id (
          id,
          nom,
          email,
          telephone
        )
      `)
      .eq("id", id)
      .single();

    if (error || !ticket) {
      return res.status(404).json({
        error: "Ticket non trouvé",
      });
    }

    // Vérification des droits d'accès selon le rôle
    if (userProfile.role === 'locataire') {
      const { data: locataireData } = await supabaseServer
        .from("locataires")
        .select("id")
        .eq("profile_id", userProfile.id)
        .single();

      if (!locataireData || ticket.locataire_id !== locataireData.id) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }
    } else if (userProfile.role === 'regie') {
      if (ticket.regie_id !== userProfile.regie_id) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }
    } else if (userProfile.role === 'entreprise' || userProfile.role === 'technicien') {
      // Vérifier le mode de diffusion
      if (ticket.diffusion_mode === 'restreint') {
        if (!ticket.entreprises_autorisees.includes(userProfile.entreprise_id)) {
          return res.status(403).json({
            error: "Accès refusé",
          });
        }
      }
    } else if (userProfile.role !== 'admin_jtec') {
      return res.status(403).json({
        error: "Accès refusé",
      });
    }

    res.json({ ticket });
  } catch (error) {
    console.error("Erreur dans getTicket:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}

/**
 * PUT /api/tickets/:id
 * Mettre à jour un ticket
 * 
 * Body attendu (selon le rôle) :
 * - Locataire : peut modifier titre, description, priorite (seulement si statut=nouveau)
 * - Régie : peut modifier tous les champs sauf locataire_id et logement_id
 * - Entreprise : peut modifier statut (acceptation/refus)
 * - Admin : peut tout modifier
 */
export async function updateTicket(req, res) {
  try {
    const { id } = req.params;
    const userProfile = req.profile;

    // Récupérer le ticket existant
    const { data: existingTicket, error: fetchError } = await supabaseServer
      .from("tickets")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingTicket) {
      return res.status(404).json({
        error: "Ticket non trouvé",
      });
    }

    let allowedFields = [];
    let updateData = {};

    // Déterminer les champs modifiables selon le rôle
    if (userProfile.role === 'locataire') {
      // Un locataire ne peut modifier que ses propres tickets non diffusés
      const { data: locataireData } = await supabaseServer
        .from("locataires")
        .select("id")
        .eq("profile_id", userProfile.id)
        .single();

      if (!locataireData || existingTicket.locataire_id !== locataireData.id) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }

      if (!['nouveau', 'en_attente_diffusion'].includes(existingTicket.statut)) {
        return res.status(403).json({
          error: "Vous ne pouvez modifier que les tickets non encore diffusés",
        });
      }

      allowedFields = ['titre', 'description', 'categorie', 'priorite', 'date_souhaitee_intervention'];
    } else if (userProfile.role === 'regie') {
      // Une régie peut modifier tous les champs de ses tickets
      if (existingTicket.regie_id !== userProfile.regie_id) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }

      allowedFields = [
        'titre', 'description', 'categorie', 'priorite', 'statut',
        'date_souhaitee_intervention', 'diffusion_mode', 'entreprises_autorisees'
      ];
    } else if (userProfile.role === 'entreprise') {
      // Une entreprise peut modifier le statut (acceptation/refus)
      if (existingTicket.diffusion_mode === 'restreint' &&
          !existingTicket.entreprises_autorisees.includes(userProfile.entreprise_id)) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }

      allowedFields = ['statut'];
      
      // Validation des transitions de statut pour les entreprises
      const validTransitions = {
        'diffusé': ['accepté', 'refusé'],
        'accepté': ['en_cours'],
        'en_cours': ['terminé'],
      };

      if (req.body.statut && validTransitions[existingTicket.statut]) {
        if (!validTransitions[existingTicket.statut].includes(req.body.statut)) {
          return res.status(400).json({
            error: `Transition de statut non autorisée de ${existingTicket.statut} vers ${req.body.statut}`,
          });
        }
      }
    } else if (userProfile.role === 'admin_jtec') {
      // Admin peut tout modifier
      allowedFields = [
        'titre', 'description', 'categorie', 'priorite', 'statut',
        'date_souhaitee_intervention', 'diffusion_mode', 'entreprises_autorisees',
        'date_acceptation', 'date_cloture'
      ];
    } else {
      return res.status(403).json({
        error: "Rôle non autorisé",
      });
    }

    // Filtrer les champs autorisés
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Validation du mode de diffusion
    if (updateData.diffusion_mode === 'restreint' &&
        (!updateData.entreprises_autorisees || updateData.entreprises_autorisees.length === 0)) {
      return res.status(400).json({
        error: "En mode restreint, vous devez spécifier au moins une entreprise autorisée",
      });
    }

    // Si aucun champ à modifier
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: "Aucun champ à modifier",
      });
    }

    // Gestion automatique des dates
    if (updateData.statut === 'accepté' && !existingTicket.date_acceptation) {
      updateData.date_acceptation = new Date().toISOString();
    }
    if (updateData.statut === 'terminé' && !existingTicket.date_cloture) {
      updateData.date_cloture = new Date().toISOString();
    }

    // Mettre à jour le ticket
    const { data: updatedTicket, error: updateError } = await supabaseServer
      .from("tickets")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Erreur lors de la mise à jour du ticket:", updateError);
      return res.status(500).json({
        error: "Erreur lors de la mise à jour du ticket",
        details: updateError.message,
      });
    }

    res.json({
      message: "Ticket mis à jour avec succès",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Erreur dans updateTicket:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}

/**
 * DELETE /api/tickets/:id
 * Supprimer un ticket
 */
export async function deleteTicket(req, res) {
  try {
    const { id } = req.params;
    const userProfile = req.profile;

    // Récupérer le ticket
    const { data: ticket, error: fetchError } = await supabaseServer
      .from("tickets")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !ticket) {
      return res.status(404).json({
        error: "Ticket non trouvé",
      });
    }

    // Vérification des droits selon le rôle
    if (userProfile.role === 'locataire') {
      const { data: locataireData } = await supabaseServer
        .from("locataires")
        .select("id")
        .eq("profile_id", userProfile.id)
        .single();

      if (!locataireData || ticket.locataire_id !== locataireData.id) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }

      // Un locataire ne peut supprimer que les tickets non diffusés
      if (!['nouveau', 'en_attente_diffusion'].includes(ticket.statut)) {
        return res.status(403).json({
          error: "Vous ne pouvez supprimer que les tickets non encore diffusés",
        });
      }
    } else if (userProfile.role === 'regie') {
      if (ticket.regie_id !== userProfile.regie_id) {
        return res.status(403).json({
          error: "Accès refusé",
        });
      }
    } else if (userProfile.role !== 'admin_jtec') {
      return res.status(403).json({
        error: "Rôle non autorisé pour supprimer un ticket",
      });
    }

    // Supprimer le ticket
    const { error: deleteError } = await supabaseServer
      .from("tickets")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Erreur lors de la suppression du ticket:", deleteError);
      return res.status(500).json({
        error: "Erreur lors de la suppression du ticket",
        details: deleteError.message,
      });
    }

    res.json({
      message: "Ticket supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur dans deleteTicket:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}

/**
 * PUT /api/tickets/:id/diffuse
 * Diffuser un ticket aux entreprises
 * Endpoint spécifique pour la régie
 * 
 * Body attendu :
 * {
 *   diffusion_mode: 'general' | 'restreint',
 *   entreprises_autorisees?: uuid[]
 * }
 */
export async function diffuseTicket(req, res) {
  try {
    const { id } = req.params;
    const { diffusion_mode, entreprises_autorisees = [] } = req.body;
    const userProfile = req.profile;

    // Seules les régies et admins peuvent diffuser
    if (userProfile.role !== 'regie' && userProfile.role !== 'admin_jtec') {
      return res.status(403).json({
        error: "Seules les régies peuvent diffuser des tickets",
      });
    }

    // Récupérer le ticket
    const { data: ticket, error: fetchError } = await supabaseServer
      .from("tickets")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !ticket) {
      return res.status(404).json({
        error: "Ticket non trouvé",
      });
    }

    // Vérifier que c'est bien la régie du ticket
    if (userProfile.role === 'regie' && ticket.regie_id !== userProfile.regie_id) {
      return res.status(403).json({
        error: "Accès refusé",
      });
    }

    // Vérifier que le ticket est dans un état qui permet la diffusion
    if (!['nouveau', 'en_attente_diffusion'].includes(ticket.statut)) {
      return res.status(400).json({
        error: "Ce ticket ne peut plus être diffusé (statut actuel: " + ticket.statut + ")",
      });
    }

    // Validation
    if (!['general', 'restreint'].includes(diffusion_mode)) {
      return res.status(400).json({
        error: "Le mode de diffusion doit être 'general' ou 'restreint'",
      });
    }

    if (diffusion_mode === 'restreint' && entreprises_autorisees.length === 0) {
      return res.status(400).json({
        error: "En mode restreint, vous devez spécifier au moins une entreprise",
      });
    }

    // Vérifier que les entreprises existent
    if (diffusion_mode === 'restreint') {
      const { data: entreprisesData, error: entreprisesError } = await supabaseServer
        .from("entreprises")
        .select("id")
        .in("id", entreprises_autorisees);

      if (entreprisesError || entreprisesData.length !== entreprises_autorisees.length) {
        return res.status(400).json({
          error: "Une ou plusieurs entreprises spécifiées n'existent pas",
        });
      }
    }

    // Mettre à jour le ticket
    const { data: updatedTicket, error: updateError } = await supabaseServer
      .from("tickets")
      .update({
        diffusion_mode,
        entreprises_autorisees: diffusion_mode === 'restreint' ? entreprises_autorisees : [],
        statut: 'diffusé',
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Erreur lors de la diffusion du ticket:", updateError);
      return res.status(500).json({
        error: "Erreur lors de la diffusion du ticket",
        details: updateError.message,
      });
    }

    res.json({
      message: "Ticket diffusé avec succès",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Erreur dans diffuseTicket:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}
