// Fonctions d'authentification

import { apiFetch } from "./api";

// Login réel via API backend
export async function login(email, password) {
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
        window.location.href = "/admin/jetc";
        break;
      default:
        window.location.href = "/login";
    }
  }
}
