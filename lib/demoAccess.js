/**
 * RÈGLE MÉTIER CENTRALE DU MODE DEMO
 * 
 * Le MODE DEMO est accessible UNIQUEMENT aux visiteurs non connectés.
 * Dès qu'un utilisateur est inscrit (avec ou sans abonnement), le MODE DEMO est INTERDIT.
 */

/**
 * Détermine si l'utilisateur peut accéder au MODE DEMO
 * 
 * @param {Object|null} user - L'utilisateur connecté (null si non connecté)
 * @param {Object|null} subscription - L'abonnement actif (optionnel)
 * @returns {boolean} true si l'accès DEMO est autorisé, false sinon
 * 
 * RÈGLES :
 * - user == null → DEMO autorisée (visiteur non connecté)
 * - user != null ET subscription inactive → DEMO INTERDITE (utilisateur inscrit)
 * - user != null ET subscription active → DEMO INTERDITE (utilisateur abonné)
 */
export function canUseDemo(user, subscription = null) {
  // Visiteur non connecté → accès DEMO autorisé
  if (user === null || user === undefined) {
    return true;
  }

  // Utilisateur connecté (peu importe l'abonnement) → accès DEMO interdit
  return false;
}

/**
 * Détermine la redirection appropriée si l'accès DEMO est refusé
 * 
 * @param {Object} user - L'utilisateur connecté
 * @param {Object|null} subscription - L'abonnement actif (optionnel)
 * @returns {string} URL de redirection
 */
export function getDemoRedirectUrl(user, subscription = null) {
  if (!user) {
    return "/login";
  }

  // Si abonnement actif → dashboard correspondant au rôle
  if (subscription && subscription.statut === "active") {
    const role = user.role;
    return `/${role}/dashboard`;
  }

  // Sinon → page pricing (utilisateur inscrit mais non abonné)
  return "/pricing";
}

/**
 * Nettoie toutes les données DEMO du localStorage
 * À appeler lors de l'inscription ou de la connexion d'un utilisateur réel
 * 
 * OBJECTIF : Une fois en PROD, on ne revient JAMAIS en DEMO
 */
export function clearDemoData() {
  if (typeof window === "undefined") return;

  // Liste exhaustive des clés DEMO à supprimer
  const demoKeys = [
    "jetc_demo_mode",
    "jetc_demo_role",
    "demo_token",
    "demoMode",
    "demoProfile",
    "demoRole"
  ];

  // Supprimer toutes les clés DEMO
  demoKeys.forEach((key) => {
    localStorage.removeItem(key);
  });

  // Nettoyer également les anciennes clés de session si elles contiennent "demo"
  Object.keys(localStorage).forEach((key) => {
    if (key.toLowerCase().includes("demo")) {
      localStorage.removeItem(key);
    }
  });

  console.log("✅ Données DEMO nettoyées - Transition vers PROD");
}

/**
 * Effectue la transition complète de DEMO vers PROD
 * 
 * @param {Object} user - L'utilisateur nouvellement connecté/inscrit
 * @returns {string} URL de redirection vers le dashboard approprié
 */
export function transitionDemoToProd(user) {
  // 1. Nettoyer toutes les données DEMO
  clearDemoData();

  // 2. Déterminer la redirection appropriée
  if (!user || !user.role) {
    return "/pricing";
  }

  const role = user.role;
  return `/${role}/dashboard`;
}
