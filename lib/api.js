// Fonctions API

import { getToken } from "./session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(url, options = {}) {
  // PROTECTION MODE DEMO : bloquer les writes
  const demoMode =
    typeof window !== "undefined" &&
    localStorage.getItem("jetc_demo_mode") === "true";
  const method = (options.method || "GET").toUpperCase();
  const isWriteOperation = ["POST", "PUT", "DELETE", "PATCH"].includes(method);

  if (demoMode && isWriteOperation) {
    console.warn(
      `🎭 MODE DEMO : Requête ${method} bloquée vers ${url}. Aucune donnée modifiée.`
    );
    return {
      success: false,
      blocked: true,
      message: "Mode démo actif : aucune modification autorisée",
    };
  }

  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur API");
  }

  return response.json();
}

export async function getProfile() {
  return apiFetch("/user/profile");
}

export async function uploadFile(endpoint, file) {
  // PROTECTION MODE DEMO : bloquer l'upload
  const demoMode =
    typeof window !== "undefined" &&
    localStorage.getItem("jetc_demo_mode") === "true";

  if (demoMode) {
    console.warn(
      `🎭 MODE DEMO : Upload bloqué vers ${endpoint}. Aucune donnée modifiée.`
    );
    return {
      success: false,
      blocked: true,
      message: "Mode démo actif : upload non autorisé",
    };
  }

  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur upload");
  }

  return response.json();
}
