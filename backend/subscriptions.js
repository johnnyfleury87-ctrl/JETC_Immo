// ============================================================================
// Fichier : api/subscriptions.js
// Description : Gestion des abonnements et plans
// ============================================================================

import { supabase, supabaseServer } from "./index.js";

// ============================================================================
// PLANS - ENDPOINT 1 : Lister tous les plans disponibles
// GET /api/plans
// Public : tous les utilisateurs authentifiés peuvent voir les plans
// ============================================================================
export async function listPlans(req, res) {
  try {
    const { type_entite } = req.query;

    let query = supabase
      .from("plans")
      .select("*")
      .eq("est_actif", true)
      .eq("est_visible", true)
      .order("ordre_affichage", { ascending: true });

    // Filtrer par type si spécifié
    if (type_entite && ["regie", "entreprise", "both"].includes(type_entite)) {
      query = query.or(`type_entite.eq.${type_entite},type_entite.eq.both`);
    }

    const { data: plans, error } = await query;

    if (error) {
      console.error("Erreur listPlans:", error);
      return res
        .status(500)
        .json({ error: "Erreur lors de la récupération des plans" });
    }

    return res.json({ plans });
  } catch (error) {
    console.error("Erreur listPlans:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// ============================================================================
// PLANS - ENDPOINT 2 : Récupérer un plan par ID
// GET /api/plans/:id
// ============================================================================
export async function getPlan(req, res) {
  try {
    const { id } = req.params;

    const { data: plan, error } = await supabase
      .from("plans")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !plan) {
      return res.status(404).json({ error: "Plan non trouvé" });
    }

    return res.json({ plan });
  } catch (error) {
    console.error("Erreur getPlan:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// ============================================================================
// PLANS - ENDPOINT 3 : Créer un plan (Admin uniquement)
// POST /api/plans
// ============================================================================
export async function createPlan(req, res) {
  try {
    const userId = req.user.id;
    const planData = req.body;

    // Vérifier que l'utilisateur est admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError || !profile || profile.role !== "admin_jtec") {
      return res
        .status(403)
        .json({ error: "Seuls les administrateurs peuvent créer des plans" });
    }

    // Créer le plan
    const { data: plan, error: createError } = await supabase
      .from("plans")
      .insert(planData)
      .select()
      .single();

    if (createError) {
      console.error("Erreur createPlan:", createError);
      return res
        .status(500)
        .json({ error: "Erreur lors de la création du plan" });
    }

    return res.status(201).json({
      message: "Plan créé avec succès",
      plan,
    });
  } catch (error) {
    console.error("Erreur createPlan:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// ============================================================================
// PLANS - ENDPOINT 4 : Mettre à jour un plan (Admin uniquement)
// PUT /api/plans/:id
// ============================================================================
export async function updatePlan(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    // Vérifier que l'utilisateur est admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError || !profile || profile.role !== "admin_jtec") {
      return res.status(403).json({
        error: "Seuls les administrateurs peuvent modifier des plans",
      });
    }

    // Empêcher la modification de certains champs
    delete updates.id;
    delete updates.created_at;
    delete updates.updated_at;

    const { data: plan, error: updateError } = await supabase
      .from("plans")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError || !plan) {
      return res.status(404).json({ error: "Plan non trouvé" });
    }

    return res.json({
      message: "Plan mis à jour avec succès",
      plan,
    });
  } catch (error) {
    console.error("Erreur updatePlan:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// ============================================================================
// SUBSCRIPTIONS - ENDPOINT 5 : Créer un abonnement
// POST /api/subscriptions
// Body: { plan_id, regie_id OR entreprise_id, frequence_paiement }
// ============================================================================
export async function createSubscription(req, res) {
  try {
    const {
      plan_id,
      regie_id,
      entreprise_id,
      frequence_paiement = "mensuel",
    } = req.body;
    const userId = req.user.id;

    // Validation
    if (!plan_id) {
      return res.status(400).json({ error: "plan_id est requis" });
    }

    if (!regie_id && !entreprise_id) {
      return res
        .status(400)
        .json({ error: "regie_id ou entreprise_id est requis" });
    }

    if (regie_id && entreprise_id) {
      return res.status(400).json({
        error: "Spécifiez soit regie_id, soit entreprise_id, pas les deux",
      });
    }

    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, regie_id, entreprise_id")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({ error: "Profil non trouvé" });
    }

    // Vérifier les permissions
    if (profile.role !== "admin_jtec") {
      if (
        regie_id &&
        (profile.role !== "regie" || profile.regie_id !== regie_id)
      ) {
        return res.status(403).json({
          error:
            "Vous ne pouvez créer un abonnement que pour votre propre régie",
        });
      }
      if (
        entreprise_id &&
        (profile.role !== "entreprise" ||
          profile.entreprise_id !== entreprise_id)
      ) {
        return res.status(403).json({
          error:
            "Vous ne pouvez créer un abonnement que pour votre propre entreprise",
        });
      }
    }

    // Récupérer le plan
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("*")
      .eq("id", plan_id)
      .single();

    if (planError || !plan) {
      return res.status(404).json({ error: "Plan non trouvé" });
    }

    // Vérifier qu'il n'existe pas déjà un abonnement actif
    let existingSubQuery = supabase
      .from("subscriptions")
      .select("id")
      .in("statut", ["essai", "actif"]);

    if (regie_id) {
      existingSubQuery = existingSubQuery.eq("regie_id", regie_id);
    } else {
      existingSubQuery = existingSubQuery.eq("entreprise_id", entreprise_id);
    }

    const { data: existingSub, error: checkError } =
      await existingSubQuery.maybeSingle();

    if (existingSub) {
      return res.status(409).json({
        error:
          "Un abonnement actif existe déjà. Annulez-le avant d'en créer un nouveau.",
        subscription_id: existingSub.id,
      });
    }

    // Calculer les dates
    const dateDebut = new Date();
    const dateFinEssai =
      plan.periode_essai_jours > 0
        ? new Date(Date.now() + plan.periode_essai_jours * 24 * 60 * 60 * 1000)
        : null;

    const dateFin =
      frequence_paiement === "annuel"
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const montantFacture =
      frequence_paiement === "annuel" && plan.prix_annuel
        ? plan.prix_annuel
        : plan.prix_mensuel;

    // Créer l'abonnement
    const { data: subscription, error: createError } = await supabaseServer
      .from("subscriptions")
      .insert({
        regie_id: regie_id || null,
        entreprise_id: entreprise_id || null,
        plan_id,
        statut: dateFinEssai ? "essai" : "actif",
        date_debut: dateDebut.toISOString(),
        date_fin_essai: dateFinEssai?.toISOString() || null,
        date_fin: dateFin.toISOString(),
        date_prochain_paiement:
          dateFinEssai?.toISOString() || dateFin.toISOString(),
        frequence_paiement,
        montant_facture: montantFacture,
        date_reset_usage: dateDebut.toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error("Erreur createSubscription:", createError);
      return res
        .status(500)
        .json({ error: "Erreur lors de la création de l'abonnement" });
    }

    // Mettre à jour la régie ou entreprise avec le plan_id
    if (regie_id) {
      await supabase
        .from("regies")
        .update({
          plan_id,
          subscription_actif: true,
          date_fin_abonnement: dateFin.toISOString(),
        })
        .eq("id", regie_id);
    } else {
      await supabase
        .from("entreprises")
        .update({
          plan_id,
          subscription_actif: true,
          date_fin_abonnement: dateFin.toISOString(),
        })
        .eq("id", entreprise_id);
    }

    return res.status(201).json({
      message: "Abonnement créé avec succès",
      subscription,
    });
  } catch (error) {
    console.error("Erreur createSubscription:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// ============================================================================
// SUBSCRIPTIONS - ENDPOINT 6 : Récupérer l'abonnement actif
// GET /api/subscriptions/current
// ============================================================================
export async function getCurrentSubscription(req, res) {
  try {
    const userId = req.user.id;

    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, regie_id, entreprise_id")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({ error: "Profil non trouvé" });
    }

    // Construire la requête selon le rôle
    let query = supabase
      .from("subscriptions")
      .select(
        `
        *,
        plan:plans(*)
      `
      )
      .in("statut", ["essai", "actif"])
      .order("created_at", { ascending: false })
      .limit(1);

    if (profile.role === "regie" || profile.role === "locataire") {
      query = query.eq("regie_id", profile.regie_id);
    } else if (profile.role === "entreprise" || profile.role === "technicien") {
      query = query.eq("entreprise_id", profile.entreprise_id);
    } else if (profile.role === "admin_jtec") {
      return res
        .status(400)
        .json({ error: "Les administrateurs n'ont pas d'abonnement" });
    }

    const { data: subscription, error } = await query.maybeSingle();

    if (error) {
      console.error("Erreur getCurrentSubscription:", error);
      return res
        .status(500)
        .json({ error: "Erreur lors de la récupération de l'abonnement" });
    }

    if (!subscription) {
      return res.status(404).json({ error: "Aucun abonnement actif trouvé" });
    }

    return res.json({ subscription });
  } catch (error) {
    console.error("Erreur getCurrentSubscription:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// ============================================================================
// SUBSCRIPTIONS - ENDPOINT 7 : Changer de plan (upgrade/downgrade)
// PUT /api/subscriptions/:id/change-plan
// Body: { new_plan_id }
// ============================================================================
export async function changePlan(req, res) {
  try {
    const { id } = req.params;
    const { new_plan_id } = req.body;
    const userId = req.user.id;

    if (!new_plan_id) {
      return res.status(400).json({ error: "new_plan_id est requis" });
    }

    // Récupérer l'abonnement actuel
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*, plan:plans(*)")
      .eq("id", id)
      .single();

    if (subError || !subscription) {
      return res.status(404).json({ error: "Abonnement non trouvé" });
    }

    // Récupérer le nouveau plan
    const { data: newPlan, error: planError } = await supabase
      .from("plans")
      .select("*")
      .eq("id", new_plan_id)
      .single();

    if (planError || !newPlan) {
      return res.status(404).json({ error: "Nouveau plan non trouvé" });
    }

    // Calculer le nouveau montant
    const montantFacture =
      subscription.frequence_paiement === "annuel" && newPlan.prix_annuel
        ? newPlan.prix_annuel
        : newPlan.prix_mensuel;

    // Mettre à jour l'abonnement
    const { data: updatedSubscription, error: updateError } = await supabase
      .from("subscriptions")
      .update({
        plan_id: new_plan_id,
        montant_facture: montantFacture,
        historique: [
          ...(subscription.historique || []),
          {
            date: new Date().toISOString(),
            action: "changement_plan",
            ancien_plan_id: subscription.plan_id,
            nouveau_plan_id: new_plan_id,
          },
        ],
      })
      .eq("id", id)
      .select("*, plan:plans(*)")
      .single();

    if (updateError) {
      console.error("Erreur changePlan:", updateError);
      return res
        .status(500)
        .json({ error: "Erreur lors du changement de plan" });
    }

    // Mettre à jour la régie ou entreprise
    if (subscription.regie_id) {
      await supabase
        .from("regies")
        .update({ plan_id: new_plan_id })
        .eq("id", subscription.regie_id);
    } else if (subscription.entreprise_id) {
      await supabase
        .from("entreprises")
        .update({ plan_id: new_plan_id })
        .eq("id", subscription.entreprise_id);
    }

    return res.json({
      message: "Plan changé avec succès",
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error("Erreur changePlan:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// ============================================================================
// SUBSCRIPTIONS - ENDPOINT 8 : Annuler un abonnement
// PUT /api/subscriptions/:id/cancel
// ============================================================================
export async function cancelSubscription(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Récupérer l'abonnement
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("id", id)
      .single();

    if (subError || !subscription) {
      return res.status(404).json({ error: "Abonnement non trouvé" });
    }

    // Annuler l'abonnement
    const { data: cancelledSubscription, error: updateError } = await supabase
      .from("subscriptions")
      .update({
        statut: "annule",
        date_annulation: new Date().toISOString(),
        historique: [
          ...(subscription.historique || []),
          {
            date: new Date().toISOString(),
            action: "annulation",
          },
        ],
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Erreur cancelSubscription:", updateError);
      return res
        .status(500)
        .json({ error: "Erreur lors de l'annulation de l'abonnement" });
    }

    // Mettre à jour la régie ou entreprise
    if (subscription.regie_id) {
      await supabase
        .from("regies")
        .update({ subscription_actif: false })
        .eq("id", subscription.regie_id);
    } else if (subscription.entreprise_id) {
      await supabase
        .from("entreprises")
        .update({ subscription_actif: false })
        .eq("id", subscription.entreprise_id);
    }

    return res.json({
      message: "Abonnement annulé avec succès",
      subscription: cancelledSubscription,
    });
  } catch (error) {
    console.error("Erreur cancelSubscription:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// ============================================================================
// SUBSCRIPTIONS - ENDPOINT 9 : Vérifier les limites du plan
// GET /api/subscriptions/check-limit/:limit_type
// ============================================================================
export async function checkLimit(req, res) {
  try {
    const { limit_type } = req.params;
    const userId = req.user.id;

    // Types de limites valides
    const validLimits = [
      "immeubles",
      "logements",
      "locataires",
      "tickets",
      "missions",
      "techniciens",
    ];
    if (!validLimits.includes(limit_type)) {
      return res.status(400).json({ error: "Type de limite invalide" });
    }

    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, regie_id, entreprise_id")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({ error: "Profil non trouvé" });
    }

    // Récupérer l'abonnement actif
    let query = supabase
      .from("subscriptions")
      .select("*, plan:plans(*)")
      .in("statut", ["essai", "actif"]);

    if (profile.role === "regie" || profile.role === "locataire") {
      query = query.eq("regie_id", profile.regie_id);
    } else if (profile.role === "entreprise" || profile.role === "technicien") {
      query = query.eq("entreprise_id", profile.entreprise_id);
    }

    const { data: subscription, error } = await query.maybeSingle();

    if (error || !subscription) {
      return res.status(404).json({ error: "Aucun abonnement actif trouvé" });
    }

    // Récupérer la limite et l'usage actuel
    let limit = null;
    let usage = 0;

    switch (limit_type) {
      case "immeubles":
        limit = subscription.plan.max_immeubles;
        usage = subscription.usage_immeubles;
        break;
      case "logements":
        limit = subscription.plan.max_logements;
        usage = subscription.usage_logements;
        break;
      case "locataires":
        limit = subscription.plan.max_locataires;
        usage = subscription.usage_locataires;
        break;
      case "tickets":
        limit = subscription.plan.max_tickets_par_mois;
        usage = subscription.usage_tickets_mois_actuel;
        break;
      case "missions":
        limit = subscription.plan.max_missions_par_mois;
        usage = subscription.usage_missions_mois_actuel;
        break;
      case "techniciens":
        limit = subscription.plan.max_techniciens;
        // Compter les techniciens
        const { count } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("entreprise_id", profile.entreprise_id)
          .eq("role", "technicien");
        usage = count || 0;
        break;
    }

    const isUnlimited = limit === null;
    const canAdd = isUnlimited || usage < limit;
    const remaining = isUnlimited ? null : Math.max(0, limit - usage);

    return res.json({
      limit_type,
      limit: isUnlimited ? "illimité" : limit,
      usage,
      remaining,
      can_add: canAdd,
      is_unlimited: isUnlimited,
    });
  } catch (error) {
    console.error("Erreur checkLimit:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
