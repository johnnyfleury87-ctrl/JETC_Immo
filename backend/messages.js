// ============================================================================
// Fichier : api/messages.js
// Description : Gestion de la messagerie entre acteurs
// ============================================================================

import { supabase } from "./index.js";

// ============================================================================
// ENDPOINT 1 : Envoyer un message
// POST /api/messages
// Body: { recipient_id, sujet, contenu, ticket_id?, mission_id?, facture_id?, parent_message_id? }
// ============================================================================
export async function sendMessage(req, res) {
  try {
    const {
      recipient_id,
      sujet,
      contenu,
      ticket_id,
      mission_id,
      facture_id,
      parent_message_id,
      type_message,
    } = req.body;
    const userId = req.user.id;

    // Validation des champs requis
    if (!recipient_id) {
      return res.status(400).json({ error: "recipient_id est requis" });
    }
    if (!contenu || contenu.trim() === "") {
      return res
        .status(400)
        .json({ error: "Le contenu du message est requis" });
    }

    // Vérifier que le destinataire existe
    const { data: recipient, error: recipientError } = await supabase
      .from("profiles")
      .select("id, nom, prenom, email, role")
      .eq("id", recipient_id)
      .single();

    if (recipientError || !recipient) {
      return res.status(404).json({ error: "Destinataire non trouvé" });
    }

    // Vérifier que l'utilisateur n'envoie pas un message à lui-même
    if (recipient_id === userId) {
      return res.status(400).json({
        error: "Vous ne pouvez pas vous envoyer un message à vous-même",
      });
    }

    // Créer le message
    const { data: message, error: createError } = await supabase
      .from("messages")
      .insert({
        sender_id: userId,
        recipient_id,
        sujet: sujet || null,
        contenu: contenu.trim(),
        ticket_id: ticket_id || null,
        mission_id: mission_id || null,
        facture_id: facture_id || null,
        parent_message_id: parent_message_id || null,
        type_message: type_message || "standard",
        lu: false,
      })
      .select(
        `
        *,
        sender:profiles!messages_sender_id_fkey(id, nom, prenom, email, role),
        recipient:profiles!messages_recipient_id_fkey(id, nom, prenom, email, role)
      `
      )
      .single();

    if (createError) {
      console.error("Erreur sendMessage:", createError);
      return res
        .status(500)
        .json({ error: "Erreur lors de l'envoi du message" });
    }

    return res.status(201).json({
      message: "Message envoyé avec succès",
      data: message,
    });
  } catch (error) {
    console.error("Erreur sendMessage:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// ============================================================================
// ENDPOINT 2 : Lister les conversations
// GET /api/messages/conversations
// Retourne la liste des conversations avec le dernier message de chaque conversation
// ============================================================================
export async function listConversations(req, res) {
  try {
    const userId = req.user.id;

    // Récupérer tous les messages envoyés ou reçus par l'utilisateur
    const { data: messages, error } = await supabase
      .from("messages")
      .select(
        `
        id,
        sender_id,
        recipient_id,
        sujet,
        contenu,
        lu,
        type_message,
        created_at,
        sender:profiles!messages_sender_id_fkey(id, nom, prenom, email, role),
        recipient:profiles!messages_recipient_id_fkey(id, nom, prenom, email, role),
        ticket_id,
        mission_id,
        facture_id
      `
      )
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur listConversations:", error);
      return res
        .status(500)
        .json({ error: "Erreur lors de la récupération des conversations" });
    }

    // Regrouper les messages par conversation (paire d'utilisateurs)
    const conversationsMap = new Map();

    messages.forEach((msg) => {
      // Déterminer l'autre participant de la conversation
      const otherUserId =
        msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
      const otherUser = msg.sender_id === userId ? msg.recipient : msg.sender;

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          participant: otherUser,
          last_message: msg,
          unread_count: 0,
          messages: [],
        });
      }

      const conversation = conversationsMap.get(otherUserId);
      conversation.messages.push(msg);

      // Compter les messages non lus reçus
      if (msg.recipient_id === userId && !msg.lu) {
        conversation.unread_count++;
      }
    });

    // Convertir la Map en array
    const conversations = Array.from(conversationsMap.values())
      .map((conv) => ({
        participant: conv.participant,
        last_message: conv.last_message,
        unread_count: conv.unread_count,
        total_messages: conv.messages.length,
      }))
      .sort(
        (a, b) =>
          new Date(b.last_message.created_at) -
          new Date(a.last_message.created_at)
      );

    return res.json({ conversations });
  } catch (error) {
    console.error("Erreur listConversations:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// ============================================================================
// ENDPOINT 3 : Récupérer les messages d'une conversation
// GET /api/messages/conversation/:userId
// Retourne tous les messages échangés avec un utilisateur spécifique
// ============================================================================
export async function getConversation(req, res) {
  try {
    const { userId: otherUserId } = req.params;
    const currentUserId = req.user.id;

    // Récupérer tous les messages entre les deux utilisateurs
    const { data: messages, error } = await supabase
      .from("messages")
      .select(
        `
        *,
        sender:profiles!messages_sender_id_fkey(id, nom, prenom, email, role),
        recipient:profiles!messages_recipient_id_fkey(id, nom, prenom, email, role),
        ticket:tickets(id, titre),
        mission:missions(id, titre),
        facture:factures(id, numero_facture),
        parent:messages!messages_parent_message_id_fkey(id, contenu, sender_id)
      `
      )
      .or(
        `and(sender_id.eq.${currentUserId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${currentUserId})`
      )
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erreur getConversation:", error);
      return res
        .status(500)
        .json({ error: "Erreur lors de la récupération de la conversation" });
    }

    return res.json({ messages });
  } catch (error) {
    console.error("Erreur getConversation:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// ============================================================================
// ENDPOINT 4 : Marquer un message comme lu
// PUT /api/messages/:id/read
// ============================================================================
export async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Récupérer le message
    const { data: message, error: fetchError } = await supabase
      .from("messages")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !message) {
      return res.status(404).json({ error: "Message non trouvé" });
    }

    // Vérifier que l'utilisateur est le destinataire
    if (message.recipient_id !== userId) {
      return res.status(403).json({
        error: "Vous ne pouvez marquer comme lu que vos propres messages reçus",
      });
    }

    // Si déjà lu, retourner directement
    if (message.lu) {
      return res.json({
        message: "Message déjà marqué comme lu",
        data: message,
      });
    }

    // Marquer comme lu
    const { data: updatedMessage, error: updateError } = await supabase
      .from("messages")
      .update({
        lu: true,
        date_lecture: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Erreur markAsRead:", updateError);
      return res
        .status(500)
        .json({ error: "Erreur lors du marquage du message comme lu" });
    }

    return res.json({
      message: "Message marqué comme lu",
      data: updatedMessage,
    });
  } catch (error) {
    console.error("Erreur markAsRead:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// ============================================================================
// ENDPOINT 5 : Marquer tous les messages d'une conversation comme lus
// PUT /api/messages/conversation/:userId/read-all
// ============================================================================
export async function markConversationAsRead(req, res) {
  try {
    const { userId: otherUserId } = req.params;
    const currentUserId = req.user.id;

    // Marquer tous les messages reçus de cet utilisateur comme lus
    const { data: updatedMessages, error } = await supabase
      .from("messages")
      .update({
        lu: true,
        date_lecture: new Date().toISOString(),
      })
      .eq("sender_id", otherUserId)
      .eq("recipient_id", currentUserId)
      .eq("lu", false)
      .select();

    if (error) {
      console.error("Erreur markConversationAsRead:", error);
      return res
        .status(500)
        .json({ error: "Erreur lors du marquage des messages comme lus" });
    }

    return res.json({
      message: "Tous les messages de la conversation ont été marqués comme lus",
      count: updatedMessages?.length || 0,
    });
  } catch (error) {
    console.error("Erreur markConversationAsRead:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// ============================================================================
// ENDPOINT 6 : Récupérer les messages liés à un contexte (ticket/mission/facture)
// GET /api/messages/context/:type/:id
// Type: ticket, mission, facture
// ============================================================================
export async function getContextMessages(req, res) {
  try {
    const { type, id } = req.params;
    const userId = req.user.id;

    // Validation du type
    if (!["ticket", "mission", "facture"].includes(type)) {
      return res
        .status(400)
        .json({ error: "Type invalide. Utilisez: ticket, mission ou facture" });
    }

    // Construire la requête selon le type
    let query = supabase
      .from("messages")
      .select(
        `
        *,
        sender:profiles!messages_sender_id_fkey(id, nom, prenom, email, role),
        recipient:profiles!messages_recipient_id_fkey(id, nom, prenom, email, role)
      `
      )
      .order("created_at", { ascending: true });

    if (type === "ticket") {
      query = query.eq("ticket_id", id);
    } else if (type === "mission") {
      query = query.eq("mission_id", id);
    } else if (type === "facture") {
      query = query.eq("facture_id", id);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error("Erreur getContextMessages:", error);
      return res
        .status(500)
        .json({ error: "Erreur lors de la récupération des messages" });
    }

    // Filtrer pour ne retourner que les messages où l'utilisateur est impliqué
    const filteredMessages = messages.filter(
      (msg) => msg.sender_id === userId || msg.recipient_id === userId
    );

    return res.json({ messages: filteredMessages });
  } catch (error) {
    console.error("Erreur getContextMessages:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// ============================================================================
// ENDPOINT 7 : Compter les messages non lus
// GET /api/messages/unread-count
// ============================================================================
export async function getUnreadCount(req, res) {
  try {
    const userId = req.user.id;

    // Compter les messages non lus reçus par l'utilisateur
    const { count, error } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", userId)
      .eq("lu", false);

    if (error) {
      console.error("Erreur getUnreadCount:", error);
      return res
        .status(500)
        .json({ error: "Erreur lors du comptage des messages non lus" });
    }

    return res.json({ unread_count: count || 0 });
  } catch (error) {
    console.error("Erreur getUnreadCount:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// ============================================================================
// ENDPOINT 8 : Supprimer un message (dans les 15 minutes)
// DELETE /api/messages/:id
// ============================================================================
export async function deleteMessage(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Récupérer le message
    const { data: message, error: fetchError } = await supabase
      .from("messages")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !message) {
      return res.status(404).json({ error: "Message non trouvé" });
    }

    // Vérifier que l'utilisateur est l'expéditeur
    if (message.sender_id !== userId) {
      return res
        .status(403)
        .json({ error: "Vous ne pouvez supprimer que vos propres messages" });
    }

    // Vérifier que le message a été envoyé il y a moins de 15 minutes
    const messageDate = new Date(message.created_at);
    const now = new Date();
    const diffMinutes = (now - messageDate) / 1000 / 60;

    if (diffMinutes > 15) {
      return res.status(403).json({
        error:
          "Vous ne pouvez supprimer un message que dans les 15 minutes suivant son envoi",
      });
    }

    // Supprimer le message
    const { error: deleteError } = await supabase
      .from("messages")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Erreur deleteMessage:", deleteError);
      return res
        .status(500)
        .json({ error: "Erreur lors de la suppression du message" });
    }

    return res.json({ message: "Message supprimé avec succès" });
  } catch (error) {
    console.error("Erreur deleteMessage:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
