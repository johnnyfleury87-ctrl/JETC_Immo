// Protection des pages par rôle

import { getRole } from "./session";

export function requireRole(allowedRoles) {
  if (typeof window !== "undefined") {
    // MODE DEMO : bypasser toutes les restrictions de rôle
    const demoMode = localStorage.getItem("jetc_demo_mode") === "true";

    if (demoMode) {
      console.log("🎭 MODE DEMO : roleGuard bypassed pour", allowedRoles);
      return; // Autoriser l'accès sans vérification
    }

    // PRODUCTION : vérification normale du rôle
    const userRole = getRole();

    if (!userRole || !allowedRoles.includes(userRole)) {
      window.location.href = "/login";
    }
  }
}
