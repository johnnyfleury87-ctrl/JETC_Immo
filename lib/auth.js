// Fonctions d'authentification

import { apiFetch } from "./api";
import { getDemoProfileByRole } from "./session";

// Login réel via API backend
export async function login(email, password) {
  // MODE DEMO : court-circuiter l'appel API
  const demoMode =
    typeof window !== "undefined" &&
    localStorage.getItem("jetc_demo_mode") === "true";

  if (demoMode) {
    console.log("🎭 MODE DEMO : login() simulé, aucun appel API");
    
    // Récupérer le rôle DEMO actuel ou défaut
    const demoRole = localStorage.getItem("jetc_demo_role") || "regie";
    const demoProfile = getDemoProfileByRole(demoRole);
    
    return {
      token: "demo_token_" + Date.now(),
      role: demoProfile.role,
      user: demoProfile,
    };
  }

  try {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    return {
      token: data.token,
      role: data.role,
    };
  } catch (error) {
    throw new Error(error.message || "Identifiants incorrects");
  }
}

// Register via API backend
export async function register(payload) {
  // MODE DEMO : court-circuiter l'appel API
  const demoMode =
    typeof window !== "undefined" &&
    localStorage.getItem("jetc_demo_mode") === "true";

  if (demoMode) {
    console.log("🎭 MODE DEMO : register() simulé, aucun appel API");
    
    // Utiliser le profil DEMO par défaut (regie)
    const demoProfile = getDemoProfileByRole("regie");
    
    return {
      token: "demo_token_" + Date.now(),
      role: demoProfile.role,
      user: demoProfile,
    };
  }

  try {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return {
      token: data.token,
      role: data.role,
    };
  } catch (error) {
    throw new Error(error.message || "Erreur lors de la création du compte");
  }
}

// Redirection selon le rôle utilisateur
export function redirectByRole(role) {
  if (typeof window !== "undefined") {
    switch (role) {
      case "locataire":
        window.location.href = "/locataire/tickets";
        break;
      case "regie":
        window.location.href = "/regie/dashboard";
        break;
      case "entreprise":
        window.location.href = "/entreprise/missions";
        break;
      case "technicien":
        window.location.href = "/technicien/missions";
        break;
      case "admin_jtec":
        window.location.href = "/admin";
        break;
      default:
        const isDemo = typeof window !== "undefined" && localStorage.getItem("jetc_demo_mode") === "true";
        if (!isDemo) {
          window.location.href = "/login";
        }
    }
  }
}
