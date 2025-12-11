// ============================================================================
// Fichier : api/admin.js
// Description : Dashboard et gestion Admin JTEC (Étape 14)
// ============================================================================

import { supabase } from './index.js';

// Middleware pour vérifier le rôle admin
async function checkAdminRole(userId) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !profile || profile.role !== 'admin_jtec') {
    return false;
  }
  return true;
}

// ============================================================================
// ENDPOINT 1 : Statistiques globales de la plateforme
// GET /api/admin/stats
// ============================================================================
export async function getGlobalStats(req, res) {
  try {
    const userId = req.user.id;

    // Vérifier le rôle admin
    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    // Récupérer les statistiques depuis la vue
    const { data: stats, error } = await supabase
      .from('vue_stats_globales')
      .select('*')
      .single();

    if (error) {
      console.error('Erreur getGlobalStats:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }

    return res.json({ stats });

  } catch (error) {
    console.error('Erreur getGlobalStats:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ============================================================================
// ENDPOINT 2 : Abonnements par plan
// GET /api/admin/stats/subscriptions-by-plan
// ============================================================================
export async function getSubscriptionsByPlan(req, res) {
  try {
    const userId = req.user.id;

    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    const { data: stats, error } = await supabase
      .from('vue_abonnements_par_plan')
      .select('*');

    if (error) {
      console.error('Erreur getSubscriptionsByPlan:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }

    return res.json({ stats });

  } catch (error) {
    console.error('Erreur getSubscriptionsByPlan:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ============================================================================
// ENDPOINT 3 : Tickets par statut et priorité
// GET /api/admin/stats/tickets
// ============================================================================
export async function getTicketsStats(req, res) {
  try {
    const userId = req.user.id;

    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    const { data: stats, error } = await supabase
      .from('vue_tickets_par_statut')
      .select('*');

    if (error) {
      console.error('Erreur getTicketsStats:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }

    return res.json({ stats });

  } catch (error) {
    console.error('Erreur getTicketsStats:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ============================================================================
// ENDPOINT 4 : Missions par statut
// GET /api/admin/stats/missions
// ============================================================================
export async function getMissionsStats(req, res) {
  try {
    const userId = req.user.id;

    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    const { data: stats, error } = await supabase
      .from('vue_missions_par_statut')
      .select('*');

    if (error) {
      console.error('Erreur getMissionsStats:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }

    return res.json({ stats });

  } catch (error) {
    console.error('Erreur getMissionsStats:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ============================================================================
// ENDPOINT 5 : Factures par statut
// GET /api/admin/stats/factures
// ============================================================================
export async function getFacturesStats(req, res) {
  try {
    const userId = req.user.id;

    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    const { data: stats, error } = await supabase
      .from('vue_factures_par_statut')
      .select('*');

    if (error) {
      console.error('Erreur getFacturesStats:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }

    return res.json({ stats });

  } catch (error) {
    console.error('Erreur getFacturesStats:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ============================================================================
// ENDPOINT 6 : Top régies
// GET /api/admin/top/regies
// ============================================================================
export async function getTopRegies(req, res) {
  try {
    const userId = req.user.id;

    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    const { data: regies, error } = await supabase
      .from('vue_top_regies')
      .select('*');

    if (error) {
      console.error('Erreur getTopRegies:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des régies' });
    }

    return res.json({ regies });

  } catch (error) {
    console.error('Erreur getTopRegies:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ============================================================================
// ENDPOINT 7 : Top entreprises
// GET /api/admin/top/entreprises
// ============================================================================
export async function getTopEntreprises(req, res) {
  try {
    const userId = req.user.id;

    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    const { data: entreprises, error } = await supabase
      .from('vue_top_entreprises')
      .select('*');

    if (error) {
      console.error('Erreur getTopEntreprises:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des entreprises' });
    }

    return res.json({ entreprises });

  } catch (error) {
    console.error('Erreur getTopEntreprises:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ============================================================================
// ENDPOINT 8 : Évolution mensuelle
// GET /api/admin/stats/evolution
// ============================================================================
export async function getEvolutionMensuelle(req, res) {
  try {
    const userId = req.user.id;

    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    const { data: evolution, error } = await supabase
      .from('vue_evolution_mensuelle')
      .select('*');

    if (error) {
      console.error('Erreur getEvolutionMensuelle:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération de l\'évolution' });
    }

    return res.json({ evolution });

  } catch (error) {
    console.error('Erreur getEvolutionMensuelle:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ============================================================================
// ENDPOINT 9 : Abonnements expirant bientôt
// GET /api/admin/subscriptions/expiring
// ============================================================================
export async function getExpiringSubscriptions(req, res) {
  try {
    const userId = req.user.id;

    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    const { data: subscriptions, error } = await supabase
      .from('vue_abonnements_expirant')
      .select('*');

    if (error) {
      console.error('Erreur getExpiringSubscriptions:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des abonnements' });
    }

    return res.json({ subscriptions });

  } catch (error) {
    console.error('Erreur getExpiringSubscriptions:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ============================================================================
// ENDPOINT 10 : Liste complète des régies (avec pagination)
// GET /api/admin/regies
// ============================================================================
export async function listAllRegies(req, res) {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 50, search, subscription_actif } = req.query;

    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('regies')
      .select(`
        *,
        plan:plans(nom, prix_mensuel),
        immeubles_count:immeubles(count),
        locataires_count:locataires(count)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (search) {
      query = query.or(`nom.ilike.%${search}%,email.ilike.%${search}%,siret.ilike.%${search}%`);
    }

    if (subscription_actif !== undefined) {
      query = query.eq('subscription_actif', subscription_actif === 'true');
    }

    const { data: regies, error, count } = await query;

    if (error) {
      console.error('Erreur listAllRegies:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des régies' });
    }

    return res.json({ 
      regies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Erreur listAllRegies:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ============================================================================
// ENDPOINT 11 : Liste complète des entreprises (avec pagination)
// GET /api/admin/entreprises
// ============================================================================
export async function listAllEntreprises(req, res) {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 50, search, subscription_actif } = req.query;

    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('entreprises')
      .select(`
        *,
        plan:plans(nom, prix_mensuel),
        techniciens_count:profiles!profiles_entreprise_id_fkey(count),
        missions_count:missions(count)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (search) {
      query = query.or(`nom.ilike.%${search}%,email.ilike.%${search}%,siret.ilike.%${search}%`);
    }

    if (subscription_actif !== undefined) {
      query = query.eq('subscription_actif', subscription_actif === 'true');
    }

    const { data: entreprises, error, count } = await query;

    if (error) {
      console.error('Erreur listAllEntreprises:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des entreprises' });
    }

    return res.json({ 
      entreprises,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Erreur listAllEntreprises:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ============================================================================
// ENDPOINT 12 : Liste de tous les utilisateurs (avec pagination)
// GET /api/admin/users
// ============================================================================
export async function listAllUsers(req, res) {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 50, search, role } = req.query;

    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('profiles')
      .select(`
        *,
        regie:regies(nom),
        entreprise:entreprises(nom)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (search) {
      query = query.or(`nom.ilike.%${search}%,prenom.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq('role', role);
    }

    const { data: users, error, count } = await query;

    if (error) {
      console.error('Erreur listAllUsers:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
    }

    return res.json({ 
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Erreur listAllUsers:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ============================================================================
// ENDPOINT 13 : Suspendre/Activer un abonnement
// PUT /api/admin/subscriptions/:id/toggle
// ============================================================================
export async function toggleSubscription(req, res) {
  try {
    const { id } = req.params;
    const { statut } = req.body; // 'actif', 'suspendu', 'annule'
    const userId = req.user.id;

    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    if (!['actif', 'suspendu', 'annule'].includes(statut)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update({ 
        statut,
        historique: supabase.raw(`
          COALESCE(historique, '[]'::jsonb) || 
          jsonb_build_object(
            'date', NOW()::text,
            'action', 'admin_change_statut',
            'nouveau_statut', '${statut}'
          )::jsonb
        `)
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur toggleSubscription:', error);
      return res.status(500).json({ error: 'Erreur lors de la modification de l\'abonnement' });
    }

    // Mettre à jour l'entité associée
    if (subscription.regie_id) {
      await supabase
        .from('regies')
        .update({ subscription_actif: statut === 'actif' })
        .eq('id', subscription.regie_id);
    } else if (subscription.entreprise_id) {
      await supabase
        .from('entreprises')
        .update({ subscription_actif: statut === 'actif' })
        .eq('id', subscription.entreprise_id);
    }

    return res.json({ 
      message: `Abonnement ${statut} avec succès`,
      subscription 
    });

  } catch (error) {
    console.error('Erreur toggleSubscription:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
