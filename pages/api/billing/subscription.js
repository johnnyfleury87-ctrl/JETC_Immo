/**
 * API Route : /api/billing/subscription
 * 
 * RÈGLE ABSOLUE : Cette API ne doit JAMAIS bloquer l'application
 * Elle retourne TOUJOURS 200 + JSON, même en cas d'erreur
 */

import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  // Méthode autorisée : GET uniquement
  if (req.method !== 'GET') {
    return res.status(200).json({ 
      status: 'none',
      plan: null,
      source: 'method_not_allowed'
    });
  }

  try {
    // 1. Vérifier Authorization header (optionnel)
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('[API billing] Pas de Authorization header');
      return res.status(200).json({ 
        status: 'none',
        plan: null,
        source: 'no_auth_header'
      });
    }

    // 2. Extraire le token
    const token = authHeader.replace('Bearer ', '');
    
    // 3. Vérifier le token (NE JAMAIS throw)
    let user = null;
    try {
      const { data, error } = await supabase.auth.getUser(token);
      
      if (error || !data?.user) {
        console.log('[API billing] Token invalide');
        return res.status(200).json({ 
          status: 'none',
          plan: null,
          source: 'invalid_token'
        });
      }
      
      user = data.user;
    } catch (error) {
      console.error('[API billing] Exception getUser:', error.message);
      return res.status(200).json({ 
        status: 'none',
        plan: null,
        source: 'auth_error'
      });
    }

    // 4. Récupérer l'abonnement (NE JAMAIS throw)
    try {
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Table n'existe pas ou erreur
      if (subError) {
        console.log('[API billing] Erreur subscriptions:', subError.code);
        return res.status(200).json({
          status: 'none',
          plan: null,
          source: 'table_error'
        });
      }

      // Pas d'abonnement trouvé
      if (!subscription) {
        return res.status(200).json({
          status: 'none',
          plan: null,
          source: 'no_subscription'
        });
      }

      // Abonnement trouvé
      console.log('[API billing] Abonnement trouvé pour user:', user.id);
      return res.status(200).json({
        status: subscription.statut || 'none',
        plan: subscription.plan || null,
        statut: subscription.statut || 'inactif',
        current_period_end: subscription.current_period_end || null,
        source: 'database'
      });

    } catch (error) {
      console.error('[API billing] Exception subscriptions:', error.message);
      return res.status(200).json({
        status: 'none',
        plan: null,
        source: 'exception'
      });
    }

  } catch (error) {
    // Catch-all : TOUJOURS retourner 200
    console.error('[API billing] Exception globale:', error.message);
    return res.status(200).json({
      status: 'none',
      plan: null,
      source: 'global_error'
    });
  }
}
