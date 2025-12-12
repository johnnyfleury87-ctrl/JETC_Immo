import { supabaseServer } from "../_supabase.js";

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur existant
 *
 * Body attendu :
 * {
 *   email: string,
 *   password: string
 * }
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validation des champs obligatoires
    if (!email || !password) {
      return res.status(400).json({
        error: "Les champs email et password sont obligatoires",
      });
    }

    // Connexion via Supabase Auth
    const { data: authData, error: authError } =
      await supabaseServer.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      console.error("Erreur de connexion:", authError);
      return res.status(401).json({
        error: "Identifiants invalides",
        details: authError.message,
      });
    }

    // Récupération du profil complet de l'utilisateur
    const { data: profileData, error: profileError } = await supabaseServer
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profileData) {
      console.error("Erreur récupération profil:", profileError);
      return res.status(500).json({
        error: "Erreur lors de la récupération du profil",
      });
    }

    // Succès
    return res.status(200).json({
      message: "Connexion réussie",
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at,
      },
      user: {
        id: profileData.id,
        email: profileData.email,
        role: profileData.role,
        nom: profileData.nom,
        prenom: profileData.prenom,
        telephone: profileData.telephone,
        regie_id: profileData.regie_id,
        entreprise_id: profileData.entreprise_id,
        is_demo: profileData.is_demo,
      },
    });
  } catch (error) {
    console.error("Erreur serveur lors de la connexion:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}
