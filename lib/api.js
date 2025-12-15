// Fonctions API

import { getToken } from "./session";
import { supabase } from "./supabase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(url, options = {}) {
  // ROUTE LOCALE Next.js (/api/*) : Pas besoin d'API_BASE_URL
  const isLocalApiRoute = url.startsWith('/api/');
  
  // GUARD: Vérifier que l'API_BASE_URL est définie (sauf pour routes locales)
  if (!isLocalApiRoute && (!API_BASE_URL || API_BASE_URL === 'undefined')) {
    console.warn('[API] NEXT_PUBLIC_API_URL non définie, appel API ignoré:', url);
    throw new Error('API_BASE_URL non configurée');
  }

  // GUARD: Vérifier que l'URL ne contient pas undefined
  if (url.includes('undefined')) {
    console.error('[API] URL contient "undefined":', url);
    throw new Error('URL invalide contenant undefined');
  }

  // ✅ CORRECTION : Récupérer le VRAI token Supabase depuis la session
  let token = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token || null;
    
    if (!token) {
      console.warn('[apiFetch] Pas de session Supabase active');
    }
  } catch (error) {
    console.error('[apiFetch] Erreur récupération session:', error.message);
  }

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
    // Debug temporaire
    console.log('[apiFetch] Token présent, longueur:', token.length, 'parties:', token.split('.').length);
  } else {
    console.warn('[apiFetch] Pas de token disponible pour', url);
  }

  try {
    // Routes locales : URL relative, routes externes : API_BASE_URL + url
    const finalUrl = isLocalApiRoute ? url : `${API_BASE_URL}${url}`;
    
    const response = await fetch(finalUrl, {
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
 * 
 * SOURCE DE VÉRITÉ UNIQUE pour l'authentification
 * 
 * @returns {Object} profile - Le profil complet avec role
 * @throws {Error} Si pas de session, pas de profile, ou erreur Supabase
 */
export async function getProfile() {
  // 1. Vérifier session Supabase
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('[getProfile] Erreur session:', sessionError.message);
    throw new Error('Erreur récupération session');
  }
  
  if (!session?.user) {
    console.warn('[getProfile] Aucune session active');
    throw new Error('Non authentifié');
  }

  // 2. Récupérer le profil depuis la table profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (profileError) {
    console.error('[getProfile] Erreur récupération profile:', profileError.message);
    throw new Error('Erreur accès profil: ' + profileError.message);
  }

  if (!profile) {
    console.error('[getProfile] Profile null pour user:', session.user.id);
    throw new Error('Profil introuvable');
  }

  // 3. Vérifier que le role existe (donnée critique)
  if (!profile.role) {
    console.error('[getProfile] Profile sans role:', profile.id);
    throw new Error('Profil incomplet (pas de role)');
  }

  console.log('[getProfile] OK:', { id: profile.id, role: profile.role, email: profile.email });
  return profile;
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
