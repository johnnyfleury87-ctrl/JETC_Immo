// ============================================================================
// Fichier : api/logs.js
// Description : API de gestion des logs d'activité (Étape 15)
// ============================================================================

import { supabaseServer } from "./_supabase.js";

// ============================================================================
// Helper : Créer un log d'activité (appelé par d'autres endpoints)
// ============================================================================
export async function createLog({
  user_id,
  action,
  entite_type,
  entite_id,
  description,
  donnees_avant,
  donnees_apres,
  ip_address,
  user_agent,
  endpoint,
  methode_http,
  statut,
  code_erreur,
  message_erreur
}) {
  try {
    const log = {
      user_id,
      action,
      entite_type,
      entite_id,
      description,
      donnees_avant,
      donnees_apres,
      ip_address,
      user_agent,
      endpoint,
      methode_http,
      statut: statut || 'success',
      code_erreur,
      message_erreur,
      created_at: new Date().toISOString()
    };

    const { error } = await supabaseServer
      .from('logs_activite')
      .insert(log);

    if (error) {
      console.error('Erreur création log:', error);
    }
  } catch (error) {
    console.error('Erreur création log:', error);
  }
}

// ============================================================================
// ENDPOINT 1 : Lister les logs d'activité
// GET /api/logs
// ============================================================================
export async function listLogs(req, res) {
  try {
    const userId = req.user.id;

    // Vérifier le rôle
    const { data: profile, error: profileError } = await supabaseServer
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    const {
      action,
      entite_type,
      entite_id,
      statut,
      date_debut,
      date_fin,
      limit = 100,
      page = 1
    } = req.query;

    let query = supabaseServer
      .from('logs_activite')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Admin voit tous les logs, utilisateurs voient leurs propres logs
    if (profile.role !== 'admin_jtec') {
      query = query.eq('user_id', userId);
    }

    // Filtres
    if (action) {
      query = query.eq('action', action);
    }

    if (entite_type) {
      query = query.eq('entite_type', entite_type);
    }

    if (entite_id) {
      query = query.eq('entite_id', entite_id);
    }

    if (statut) {
      query = query.eq('statut', statut);
    }

    if (date_debut) {
      query = query.gte('created_at', date_debut);
    }

    if (date_fin) {
      query = query.lte('created_at', date_fin);
    }

    // Pagination
    const limitNum = Math.min(parseInt(limit), 1000);
    const pageNum = parseInt(page);
    const offset = (pageNum - 1) * limitNum;

    query = query.range(offset, offset + limitNum - 1);

    const { data: logs, error, count } = await query;

    if (error) throw error;

    return res.json({
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        total_pages: Math.ceil(count / limitNum)
      }
    });

  } catch (error) {
    console.error('Erreur liste logs:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ============================================================================
// ENDPOINT 2 : Récupérer un log spécifique
// GET /api/logs/:id
// ============================================================================
export async function getLog(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data: log, error } = await supabaseServer
      .from('logs_activite')
      .select(`
        *,
        user:profiles(id, nom, prenom, email, role)
      `)
      .eq('id', id)
      .single();

    if (error || !log) {
      return res.status(404).json({ error: 'Log non trouvé' });
    }

    return res.json({ log });

  } catch (error) {
    console.error('Erreur récupération log:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ============================================================================
// ENDPOINT 3 : Statistiques d'activité
// GET /api/logs/stats
// ============================================================================
export async function getLogsStats(req, res) {
  try {
    const userId = req.user.id;

    // Vérifier le rôle
    const { data: profile, error: profileError } = await supabaseServer
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError || profile.role !== 'admin_jtec') {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    const { periode = '7' } = req.query;
    const daysAgo = parseInt(periode);
    const dateDebut = new Date();
    dateDebut.setDate(dateDebut.getDate() - daysAgo);

    // Statistiques globales
    const { data: statsGlobales, error: statsError } = await supabaseServer
      .from('logs_activite')
      .select('action, statut')
      .gte('created_at', dateDebut.toISOString());

    if (statsError) throw statsError;

    // Agréger les données
    const actionsCounts = {};
    const statutsCounts = { success: 0, error: 0, warning: 0 };

    statsGlobales.forEach(log => {
      // Compter par action
      actionsCounts[log.action] = (actionsCounts[log.action] || 0) + 1;

      // Compter par statut
      if (log.statut) {
        statutsCounts[log.statut] = (statutsCounts[log.statut] || 0) + 1;
      }
    });

    // Top utilisateurs actifs
    const { data: topUsers, error: usersError } = await supabaseServer
      .from('logs_activite')
      .select(`
        user_id,
        user:profiles(nom, prenom, email)
      `)
      .gte('created_at', dateDebut.toISOString());

    if (usersError) throw usersError;

    const usersCounts = {};
    topUsers.forEach(log => {
      if (log.user_id) {
        if (!usersCounts[log.user_id]) {
          usersCounts[log.user_id] = {
            user_id: log.user_id,
            user: log.user,
            count: 0
          };
        }
        usersCounts[log.user_id].count++;
      }
    });

    const topUsersArray = Object.values(usersCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return res.json({
      periode: `${daysAgo} derniers jours`,
      total_logs: statsGlobales.length,
      par_action: actionsCounts,
      par_statut: statutsCounts,
      top_utilisateurs: topUsersArray
    });

  } catch (error) {
    console.error('Erreur stats logs:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ============================================================================
// ENDPOINT 4 : Supprimer les anciens logs (admin uniquement, rétention)
// DELETE /api/logs/cleanup
// ============================================================================
export async function cleanupLogs(req, res) {
  try {
    const userId = req.user.id;

    // Vérifier le rôle admin
    const { data: profile, error: profileError } = await supabaseServer
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError || profile.role !== 'admin_jtec') {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    const { jours_retention = 90 } = req.body;

    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - parseInt(jours_retention));

    const { error, count } = await supabaseServer
      .from('logs_activite')
      .delete({ count: 'exact' })
      .lt('created_at', dateLimit.toISOString());

    if (error) throw error;

    return res.json({
      message: `Logs supprimés (plus de ${jours_retention} jours)`,
      logs_supprimes: count
    });

  } catch (error) {
    console.error('Erreur cleanup logs:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ============================================================================
// ENDPOINT 5 : Export des logs (CSV)
// GET /api/logs/export
// ============================================================================
export async function exportLogs(req, res) {
  try {
    const userId = req.user.id;

    // Vérifier le rôle
    const { data: profile, error: profileError } = await supabaseServer
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError || profile.role !== 'admin_jtec') {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    const { date_debut, date_fin } = req.query;

    let query = supabaseServer
      .from('logs_activite')
      .select('*')
      .order('created_at', { ascending: false });

    if (date_debut) {
      query = query.gte('created_at', date_debut);
    }

    if (date_fin) {
      query = query.lte('created_at', date_fin);
    }

    const { data: logs, error } = await query;

    if (error) throw error;

    // Générer le CSV
    const headers = [
      'ID', 'Date', 'Utilisateur', 'Action', 'Entité Type', 'Entité ID',
      'Description', 'Statut', 'IP', 'Endpoint', 'Méthode'
    ];

    const csvRows = [headers.join(',')];

    logs.forEach(log => {
      const row = [
        log.id,
        log.created_at,
        log.user_id || '',
        log.action || '',
        log.entite_type || '',
        log.entite_id || '',
        (log.description || '').replace(/,/g, ';'),
        log.statut || '',
        log.ip_address || '',
        log.endpoint || '',
        log.methode_http || ''
      ];
      csvRows.push(row.join(','));
    });

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=logs_activite.csv');
    return res.send(csv);

  } catch (error) {
    console.error('Erreur export logs:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
