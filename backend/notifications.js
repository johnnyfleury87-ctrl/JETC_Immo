// ============================================================================
// Fichier : api/notifications.js
// Description : Gestion des notifications système
// ============================================================================

import { supabase, supabaseServer } from './index.js';

// ============================================================================
// HELPER : Créer une notification (usage interne du backend)
// Cette fonction est appelée par d'autres endpoints pour créer des notifications
// ============================================================================
export async function createNotificationInternal({
  user_id,
  type_notification,
  titre,
  message,
  ticket_id = null,
  mission_id = null,
  facture_id = null,
  message_id = null,
  action_url = null,
  action_label = null,
  priorite = 'normale',
  canal = ['in_app']
}) {
  try {
    const { data, error } = await supabaseServer
      .from('notifications')
      .insert({
        user_id,
        type_notification,
        titre,
        message,
        ticket_id,
        mission_id,
        facture_id,
        message_id,
        action_url,
        action_label,
        priorite,
        canal
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur createNotificationInternal:', error);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error('Erreur createNotificationInternal:', error);
    return { error };
  }
}

// ============================================================================
// ENDPOINT 1 : Lister les notifications de l'utilisateur connecté
// GET /api/notifications
// Query params: lu (true/false), archivee (true/false), type_notification, limit
// ============================================================================
export async function listNotifications(req, res) {
  try {
    const userId = req.user.id;
    const { lu, archivee, type_notification, limit = 50 } = req.query;

    // Construire la requête
    let query = supabase
      .from('notifications')
      .select(`
        *,
        ticket:tickets(id, titre, statut),
        mission:missions(id, titre, statut),
        facture:factures(id, numero_facture, statut_paiement),
        message:messages(id, sujet, contenu)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    // Filtres optionnels
    if (lu !== undefined) {
      query = query.eq('lu', lu === 'true');
    }
    if (archivee !== undefined) {
      query = query.eq('archivee', archivee === 'true');
    }
    if (type_notification) {
      query = query.eq('type_notification', type_notification);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('Erreur listNotifications:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des notifications' });
    }

    return res.json({ notifications });

  } catch (error) {
    console.error('Erreur listNotifications:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ============================================================================
// ENDPOINT 2 : Récupérer une notification par ID
// GET /api/notifications/:id
// ============================================================================
export async function getNotification(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: notification, error } = await supabase
      .from('notifications')
      .select(`
        *,
        ticket:tickets(id, titre, statut, description),
        mission:missions(id, titre, statut, description),
        facture:factures(id, numero_facture, statut_paiement, montant_ttc),
        message:messages(id, sujet, contenu, sender:profiles!messages_sender_id_fkey(nom, prenom))
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    return res.json({ notification });

  } catch (error) {
    console.error('Erreur getNotification:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ============================================================================
// ENDPOINT 3 : Marquer une notification comme lue
// PUT /api/notifications/:id/read
// ============================================================================
export async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier que la notification appartient à l'utilisateur
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    // Si déjà lue, retourner directement
    if (notification.lu) {
      return res.json({ 
        message: 'Notification déjà marquée comme lue',
        data: notification 
      });
    }

    // Marquer comme lue
    const { data: updatedNotification, error: updateError } = await supabase
      .from('notifications')
      .update({ 
        lu: true,
        date_lecture: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur markAsRead:', updateError);
      return res.status(500).json({ error: 'Erreur lors du marquage de la notification' });
    }

    return res.json({ 
      message: 'Notification marquée comme lue',
      data: updatedNotification 
    });

  } catch (error) {
    console.error('Erreur markAsRead:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ============================================================================
// ENDPOINT 4 : Marquer toutes les notifications comme lues
// PUT /api/notifications/read-all
// ============================================================================
export async function markAllAsRead(req, res) {
  try {
    const userId = req.user.id;

    const { data: updatedNotifications, error } = await supabase
      .from('notifications')
      .update({ 
        lu: true,
        date_lecture: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('lu', false)
      .select();

    if (error) {
      console.error('Erreur markAllAsRead:', error);
      return res.status(500).json({ error: 'Erreur lors du marquage des notifications' });
    }

    return res.json({ 
      message: 'Toutes les notifications ont été marquées comme lues',
      count: updatedNotifications?.length || 0
    });

  } catch (error) {
    console.error('Erreur markAllAsRead:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ============================================================================
// ENDPOINT 5 : Archiver une notification
// PUT /api/notifications/:id/archive
// ============================================================================
export async function archiveNotification(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: notification, error: updateError } = await supabase
      .from('notifications')
      .update({ archivee: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError || !notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    return res.json({ 
      message: 'Notification archivée',
      data: notification 
    });

  } catch (error) {
    console.error('Erreur archiveNotification:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ============================================================================
// ENDPOINT 6 : Compter les notifications non lues
// GET /api/notifications/unread-count
// ============================================================================
export async function getUnreadCount(req, res) {
  try {
    const userId = req.user.id;

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('lu', false)
      .eq('archivee', false);

    if (error) {
      console.error('Erreur getUnreadCount:', error);
      return res.status(500).json({ error: 'Erreur lors du comptage des notifications' });
    }

    return res.json({ unread_count: count || 0 });

  } catch (error) {
    console.error('Erreur getUnreadCount:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ============================================================================
// ENDPOINT 7 : Supprimer une notification archivée
// DELETE /api/notifications/:id
// ============================================================================
export async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier que la notification est archivée
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    if (!notification.archivee) {
      return res.status(403).json({ 
        error: 'Seules les notifications archivées peuvent être supprimées' 
      });
    }

    // Supprimer la notification
    const { error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Erreur deleteNotification:', deleteError);
      return res.status(500).json({ error: 'Erreur lors de la suppression de la notification' });
    }

    return res.json({ message: 'Notification supprimée avec succès' });

  } catch (error) {
    console.error('Erreur deleteNotification:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ============================================================================
// ENDPOINT 8 : Créer une notification manuelle (admin uniquement)
// POST /api/notifications
// Body: { user_id, type_notification, titre, message, ... }
// ============================================================================
export async function createNotification(req, res) {
  try {
    const {
      user_id,
      type_notification,
      titre,
      message,
      ticket_id,
      mission_id,
      facture_id,
      message_id,
      action_url,
      action_label,
      priorite,
      canal
    } = req.body;
    const currentUserId = req.user.id;

    // Validation des champs requis
    if (!user_id || !type_notification || !titre || !message) {
      return res.status(400).json({ 
        error: 'Les champs user_id, type_notification, titre et message sont requis' 
      });
    }

    // Vérifier que l'utilisateur est admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUserId)
      .single();

    if (profileError || !profile || profile.role !== 'admin_jtec') {
      return res.status(403).json({ 
        error: 'Seuls les administrateurs peuvent créer des notifications manuellement' 
      });
    }

    // Créer la notification
    const result = await createNotificationInternal({
      user_id,
      type_notification,
      titre,
      message,
      ticket_id,
      mission_id,
      facture_id,
      message_id,
      action_url,
      action_label,
      priorite: priorite || 'normale',
      canal: canal || ['in_app']
    });

    if (result.error) {
      return res.status(500).json({ error: 'Erreur lors de la création de la notification' });
    }

    return res.status(201).json({ 
      message: 'Notification créée avec succès',
      data: result.data 
    });

  } catch (error) {
    console.error('Erreur createNotification:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
