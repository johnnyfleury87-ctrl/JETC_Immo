/**
 * API Route : /api/billing/subscription
 * 
 * Retourne les informations d'abonnement de l'utilisateur connecté
 * 
 * IMPORTANT : Cette route ne doit JAMAIS crasher l'app si absente/erreur
 * Elle retourne toujours un JSON valide, même si pas d'abonnement
 */

import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  // Méthode autorisée : GET uniquement
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      status: 'error' 
    });
  }

  try {
    // 1. Vérifier la session (depuis cookies ou headers)
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.warn('[API /billing/subscription] Pas de token auth');
      return res.status(401).json({ 
        error: 'Non authentifié',
        status: 'unauthenticated'
      });
    }

    // 2. Extraire le token
    const token = authHeader.replace('Bearer ', '');
    
    // 3. Vérifier le token avec Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.warn('[API /billing/subscription] Token invalide:', authError?.message);
      return res.status(401).json({ 
        error: 'Token invalide',
        status: 'unauthenticated'
      });
    }

    // 4. Récupérer l'abonnement depuis la table subscriptions (si elle existe)
    // ATTENTION : Si la table n'existe pas encore, on retourne "none"
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // 5. Gérer les cas
    if (subError) {
      // Si la table n'existe pas ou autre erreur
      if (subError.code === 'PGRST116' || subError.message.includes('does not exist')) {
        console.warn('[API /billing/subscription] Table subscriptions inexistante');
        return res.status(200).json({
          status: 'none',
          plan: null,
          statut: 'inactif',
          current_period_end: null,
          message: 'Aucun abonnement (table non configurée)'
        });
      }
      
      // Autre erreur
      console.error('[API /billing/subscription] Erreur récupération subscription:', subError);
      return res.status(200).json({
        status: 'error',
        plan: null,
        statut: 'inactif',
        current_period_end: null,
        message: 'Erreur récupération abonnement'
      });
    }

    // 6. Pas de subscription trouvée
    if (!subscription) {
      console.log('[API /billing/subscription] Pas de subscription pour user:', user.id);
      return res.status(200).json({
        status: 'none',
        plan: null,
        statut: 'inactif',
        current_period_end: null,
        message: 'Aucun abonnement actif'
      });
    }

    // 7. Subscription trouvée
    console.log('[API /billing/subscription] OK, user:', user.id, 'plan:', subscription.plan);
    return res.status(200).json({
      status: 'active',
      plan: subscription.plan || null,
      statut: subscription.statut || 'inactif',
      current_period_end: subscription.current_period_end || null,
      stripe_customer_id: subscription.stripe_customer_id || null,
      stripe_subscription_id: subscription.stripe_subscription_id || null
    });

  } catch (error) {
    console.error('[API /billing/subscription] Exception:', error);
    
    // NE JAMAIS crasher - toujours retourner un JSON valide
    return res.status(200).json({
      status: 'error',
      plan: null,
      statut: 'inactif',
      current_period_end: null,
      message: 'Erreur serveur: ' + error.message
    });
  }
}
