// Singleton Supabase Client
// Ce fichier exporte UNE SEULE instance partagée de Supabase
// À importer partout : import { supabase } from '@/lib/supabase'

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "⚠️ Variables d'environnement Supabase manquantes (NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY)"
  );
}

// Instance unique - SINGLETON
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Helper pour vérifier si l'utilisateur est connecté
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('[Supabase] Erreur getSession:', error);
    return null;
  }
  return session;
}

// Helper pour récupérer le profil de l'utilisateur connecté
export async function getCurrentProfile() {
  const session = await getSession();
  if (!session?.user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error) {
    console.error('[Supabase] Erreur getCurrentProfile:', error);
    return null;
  }

  return profile;
}
