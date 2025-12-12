import { createClient } from "@supabase/supabase-js";

// Client Supabase côté frontend (utilise ANON_KEY uniquement)
const supabaseUrl =
  process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "⚠️ Variables d'environnement Supabase manquantes (SUPABASE_URL ou SUPABASE_ANON_KEY)"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});
