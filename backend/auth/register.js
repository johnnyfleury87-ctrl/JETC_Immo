import { supabaseServer } from "../_supabase.js";

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 * 
 * Body attendu :
 * {
 *   email: string,
 *   password: string,
 *   role: 'locataire' | 'regie' | 'entreprise' | 'technicien',
 *   nom?: string,
 *   prenom?: string,
 *   telephone?: string,
 *   regie_id?: uuid (obligatoire si role = 'locataire' ou 'regie'),
 *   entreprise_id?: uuid (obligatoire si role = 'technicien' ou 'entreprise'),
 *   is_demo?: boolean
 * }
 */
export async function register(req, res) {
  try {
    const {
      email,
      password,
      role,
      nom,
      prenom,
      telephone,
      adresse,
      code_postal,
      ville,
      regie_id,
      entreprise_id,
      is_demo = false,
    } = req.body;

    // Validation des champs obligatoires
    if (!email || !password || !role) {
      return res.status(400).json({
        error: "Les champs email, password et role sont obligatoires",
      });
    }

    // Validation du rôle
    const validRoles = ['locataire', 'regie', 'entreprise', 'technicien', 'admin_jtec'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: `Rôle invalide. Valeurs autorisées : ${validRoles.join(', ')}`,
      });
    }

    // Validation des liaisons selon le rôle
    if ((role === 'locataire' || role === 'regie') && !regie_id) {
      return res.status(400).json({
        error: `Le champ regie_id est obligatoire pour le rôle ${role}`,
      });
    }

    if ((role === 'entreprise' || role === 'technicien') && !entreprise_id) {
      return res.status(400).json({
        error: `Le champ entreprise_id est obligatoire pour le rôle ${role}`,
      });
    }

    // Création de l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabaseServer.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm l'email en mode DEMO
    });

    if (authError) {
      console.error("Erreur création utilisateur Auth:", authError);
      return res.status(400).json({
        error: authError.message,
      });
    }

    // Création du profil dans la table profiles
    const { data: profileData, error: profileError } = await supabaseServer
      .from("profiles")
      .insert({
        id: authData.user.id,
        email,
        role,
        nom,
        prenom,
        telephone,
        adresse,
        code_postal,
        ville,
        regie_id: role === 'locataire' || role === 'regie' ? regie_id : null,
        entreprise_id: role === 'entreprise' || role === 'technicien' ? entreprise_id : null,
        is_demo,
      })
      .select()
      .single();

    if (profileError) {
      console.error("Erreur création profil:", profileError);
      
      // Rollback : supprimer l'utilisateur Auth créé
      await supabaseServer.auth.admin.deleteUser(authData.user.id);
      
      return res.status(500).json({
        error: "Erreur lors de la création du profil",
        details: profileError.message,
      });
    }

    // Succès
    return res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        id: profileData.id,
        email: profileData.email,
        role: profileData.role,
        nom: profileData.nom,
        prenom: profileData.prenom,
      },
    });

  } catch (error) {
    console.error("Erreur serveur lors de l'inscription:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
}
