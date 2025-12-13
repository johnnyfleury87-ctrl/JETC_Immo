import { createClient } from "@supabase/supabase-js";

// Client Supabase avec clé service (admin)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Clé admin (secret)
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { requestId, adminId } = req.body;

  if (!requestId || !adminId) {
    return res.status(400).json({ error: "requestId et adminId requis" });
  }

  try {
    // 1. Vérifier que l'admin est bien admin_jtec
    const { data: admin, error: adminError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", adminId)
      .single();

    if (adminError || !admin || admin.role !== "admin_jtec") {
      return res.status(403).json({ error: "Accès refusé. Admin JETC requis." });
    }

    // 2. Récupérer la demande
    const { data: request, error: requestError } = await supabaseAdmin
      .from("adhesion_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (requestError || !request) {
      return res.status(404).json({ error: "Demande introuvable" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "Demande déjà traitée" });
    }

    // 3. Récupérer le plan demandé
    const { data: plan, error: planError } = await supabaseAdmin
      .from("plans")
      .select("*")
      .eq("nom", request.plan_requested)
      .eq("est_actif", true)
      .single();

    if (planError || !plan) {
      return res.status(400).json({ error: "Plan introuvable ou inactif" });
    }

    // 4. CRÉER LA RÉGIE
    const { data: newRegie, error: regieError } = await supabaseAdmin
      .from("regies")
      .insert([
        {
          nom: request.regie_name,
          ville: request.city,
          email: request.owner_email,
          telephone: request.owner_phone,
          nom_responsable: request.owner_lastname,
          prenom_responsable: request.owner_firstname,
          email_responsable: request.owner_email,
          telephone_responsable: request.owner_phone,
          plan_id: plan.id,
          subscription_actif: true,
          is_demo: false,
        },
      ])
      .select()
      .single();

    if (regieError) {
      console.error("Erreur création régie:", regieError);
      return res.status(500).json({ error: "Erreur création régie: " + regieError.message });
    }

    // 5. CRÉER LA SUBSCRIPTION
    const { data: newSubscription, error: subscriptionError } = await supabaseAdmin
      .from("subscriptions")
      .insert([
        {
          regie_id: newRegie.id,
          plan_id: plan.id,
          statut: "essai",
          date_debut: new Date().toISOString().split("T")[0],
          date_fin_essai: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // +14 jours
          date_prochain_paiement: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          frequence_paiement: "mensuel",
          montant_facture: plan.prix_mensuel,
          usage_users: 1, // Owner = 1er user
          usage_admins: 1, // Owner = 1er admin
          is_demo: false,
        },
      ])
      .select()
      .single();

    if (subscriptionError) {
      console.error("Erreur création subscription:", subscriptionError);
      // Rollback régie si subscription échoue
      await supabaseAdmin.from("regies").delete().eq("id", newRegie.id);
      return res.status(500).json({ error: "Erreur création subscription: " + subscriptionError.message });
    }

    // 6. CRÉER LE USER AUTH SUPABASE (avec supabase.auth.admin)
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: request.owner_email,
      email_confirm: true, // Email pré-confirmé (skip verification)
      user_metadata: {
        nom: request.owner_lastname,
        prenom: request.owner_firstname,
        role: "regie",
        regie_id: newRegie.id,
      },
    });

    if (authError) {
      console.error("Erreur création auth user:", authError);
      // Rollback régie + subscription
      await supabaseAdmin.from("subscriptions").delete().eq("id", newSubscription.id);
      await supabaseAdmin.from("regies").delete().eq("id", newRegie.id);
      return res.status(500).json({ error: "Erreur création utilisateur: " + authError.message });
    }

    // 7. CRÉER LE PROFILE OWNER (is_owner = true)
    const { data: newProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([
        {
          id: authUser.user.id, // Lien avec auth.users
          role: "regie",
          email: request.owner_email,
          nom: request.owner_lastname,
          prenom: request.owner_firstname,
          telephone: request.owner_phone,
          ville: request.city,
          regie_id: newRegie.id,
          is_owner: true, // Owner admin
          created_by: null, // Owner n'a pas de créateur
          invited_at: new Date().toISOString(),
          is_demo: false,
        },
      ])
      .select()
      .single();

    if (profileError) {
      console.error("Erreur création profile:", profileError);
      // Rollback tout
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      await supabaseAdmin.from("subscriptions").delete().eq("id", newSubscription.id);
      await supabaseAdmin.from("regies").delete().eq("id", newRegie.id);
      return res.status(500).json({ error: "Erreur création profile: " + profileError.message });
    }

    // 8. MARQUER LA DEMANDE COMME VALIDÉE
    const { error: updateError } = await supabaseAdmin
      .from("adhesion_requests")
      .update({
        status: "approved",
        validated_at: new Date().toISOString(),
        validated_by: adminId,
        created_regie_id: newRegie.id,
        created_subscription_id: newSubscription.id,
        created_owner_profile_id: newProfile.id,
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("Erreur mise à jour demande:", updateError);
      // Ne pas rollback, car l'important (régie + user) est créé
    }

    // 9. GÉNÉRER LIEN RESET PASSWORD (pour que owner crée son mot de passe)
    const { data: resetLink, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: request.owner_email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/regie/dashboard`,
      },
    });

    if (resetError) {
      console.warn("Erreur génération lien:", resetError);
    }

    // 10. ENVOYER EMAIL (à implémenter avec service email)
    // TODO: Intégrer SendGrid, Resend, ou autre service SMTP
    // Contenu email:
    // - Bienvenue chez JETC IMMO
    // - Votre compte a été validé
    // - Lien magic link pour se connecter (resetLink.properties.action_link)
    // - Infos plan + période d'essai 14 jours

    console.log("Email à envoyer à:", request.owner_email);
    console.log("Lien magic:", resetLink?.properties?.action_link);

    return res.status(200).json({
      success: true,
      message: "Demande validée avec succès",
      regie_id: newRegie.id,
      subscription_id: newSubscription.id,
      profile_id: newProfile.id,
      owner_email: request.owner_email,
      magic_link: resetLink?.properties?.action_link || null,
    });
  } catch (error) {
    console.error("Erreur validation:", error);
    return res.status(500).json({ error: "Erreur serveur: " + error.message });
  }
}
