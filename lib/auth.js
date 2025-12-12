// Fonctions d'authentification

import { apiFetch } from "./api";

// Login réel via API backend
export async function login(email, password) {
  // MODE DEMO : court-circuiter l'appel API
  const demoMode =
    typeof window !== "undefined" &&
    localStorage.getItem("jetc_demo_mode") === "true";

  if (demoMode) {
    console.log("🎭 MODE DEMO : login() simulé, aucun appel API");
    return {
      token: "demo_token_" + Date.now(),
      role: "locataire",
      user: {
        id: "demo_user",
        email: email,
        nom: "Demo",
        prenom: "User",
      },
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
    return {
      token: "demo_token_" + Date.now(),
      role: payload.role || "locataire",
      user: {
        id: "demo_user_" + Date.now(),
        email: payload.email,
        nom: payload.nom,
        prenom: payload.prenom,
        telephone: payload.telephone,
      },
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
        window.location.href = "/login";
    }
  }
}
