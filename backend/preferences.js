// ============================================================================
// Fichier : api/preferences.js
// Description : API de gestion des préférences utilisateur (Étape 15)
// ============================================================================

import { supabaseServer } from "./_supabase.js";

// ============================================================================
// ENDPOINT 1 : Récupérer les préférences utilisateur
// GET /api/preferences
// ============================================================================
export async function getPreferences(req, res) {
  try {
    const userId = req.user.id;

    const { data: preferences, error } = await supabaseServer
      .from('preferences_utilisateur')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Si pas de préférences, retourner les valeurs par défaut
    if (!preferences) {
      return res.json({
        preferences: {
          theme: 'light',
          langue: 'fr',
          taille_police: 'medium',
          notifications_email: true,
          notifications_push: true,
          notifications_in_app: true,
          notifications_types: ["nouveau_ticket", "mission_planifiee", "facture_creee", "message_recu"],
          vue_par_defaut: 'tableau',
          elements_par_page: 20,
          afficher_tickets_clotures: false,
          afficher_missions_terminees: false,
          widgets_dashboard: ["stats", "tickets_recents", "missions_en_cours"],
          ordre_widgets: [],
          timezone: 'Europe/Paris',
          format_date: 'DD/MM/YYYY',
          format_heure: '24h'
        }
      });
    }

    return res.json({ preferences });

  } catch (error) {
    console.error('Erreur récupération préférences:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ============================================================================
// ENDPOINT 2 : Créer ou mettre à jour les préférences
// PUT /api/preferences
// ============================================================================
export async function upsertPreferences(req, res) {
  try {
    const userId = req.user.id;
    const {
      theme,
      langue,
      taille_police,
      notifications_email,
      notifications_push,
      notifications_in_app,
      notifications_types,
      vue_par_defaut,
      elements_par_page,
      afficher_tickets_clotures,
      afficher_missions_terminees,
      widgets_dashboard,
      ordre_widgets,
      timezone,
      format_date,
      format_heure
    } = req.body;

    // Construire l'objet de mise à jour
    const updates = { user_id: userId };
    if (theme !== undefined) updates.theme = theme;
    if (langue !== undefined) updates.langue = langue;
    if (taille_police !== undefined) updates.taille_police = taille_police;
    if (notifications_email !== undefined) updates.notifications_email = notifications_email;
    if (notifications_push !== undefined) updates.notifications_push = notifications_push;
    if (notifications_in_app !== undefined) updates.notifications_in_app = notifications_in_app;
    if (notifications_types !== undefined) updates.notifications_types = notifications_types;
    if (vue_par_defaut !== undefined) updates.vue_par_defaut = vue_par_defaut;
    if (elements_par_page !== undefined) updates.elements_par_page = elements_par_page;
    if (afficher_tickets_clotures !== undefined) updates.afficher_tickets_clotures = afficher_tickets_clotures;
    if (afficher_missions_terminees !== undefined) updates.afficher_missions_terminees = afficher_missions_terminees;
    if (widgets_dashboard !== undefined) updates.widgets_dashboard = widgets_dashboard;
    if (ordre_widgets !== undefined) updates.ordre_widgets = ordre_widgets;
    if (timezone !== undefined) updates.timezone = timezone;
    if (format_date !== undefined) updates.format_date = format_date;
    if (format_heure !== undefined) updates.format_heure = format_heure;

    // Upsert (insert ou update)
    const { data: preferences, error } = await supabaseServer
      .from('preferences_utilisateur')
      .upsert(updates, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;

    return res.json({ 
      message: 'Préférences enregistrées',
      preferences 
    });

  } catch (error) {
    console.error('Erreur mise à jour préférences:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ============================================================================
// ENDPOINT 3 : Réinitialiser les préférences aux valeurs par défaut
// POST /api/preferences/reset
// ============================================================================
export async function resetPreferences(req, res) {
  try {
    const userId = req.user.id;

    const { error } = await supabaseServer
      .from('preferences_utilisateur')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    return res.json({ 
      message: 'Préférences réinitialisées'
    });

  } catch (error) {
    console.error('Erreur réinitialisation préférences:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
