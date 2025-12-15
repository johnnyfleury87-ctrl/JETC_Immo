// Fonctions API

import { getToken } from "./session";
import { supabase } from "./supabase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(url, options = {}) {
  // GUARD: Vérifier que l'API_BASE_URL est définie
  if (!API_BASE_URL || API_BASE_URL === 'undefined') {
    console.warn('[API] NEXT_PUBLIC_API_URL non définie, appel API ignoré:', url);
    throw new Error('API_BASE_URL non configurée');
  }

  // GUARD: Vérifier que l'URL ne contient pas undefined
  if (url.includes('undefined')) {
    console.error('[API] URL contient "undefined":', url);
    throw new Error('URL invalide contenant undefined');
  }

  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Vérifier si la réponse est du JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        throw new Error(error.error || "Erreur API");
      } else {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }
    }

    return response.json();
  } catch (error) {
    console.error('[API] Erreur fetch:', error);
    throw error;
  }
}

/**
 * Récupère le profil de l'utilisateur connecté depuis Supabase
 * Remplace l'ancien appel vers /api/user/profile qui n'existe pas
 */
export async function getProfile() {
  try {
    // Récupérer la session Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('[API] getProfile: Aucune session Supabase active');
      return null;
    }

    // Récupérer le profil depuis la table profiles
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('[API] getProfile: Erreur Supabase:', error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('[API] getProfile: Exception:', error);
    return null;
  }
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
