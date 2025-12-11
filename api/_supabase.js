import { createClient } from "@supabase/supabase-js";

// Client Supabase côté backend (utilise SERVICE_ROLE_KEY)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("⚠️ Variables d'environnement Supabase manquantes (SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY)");
}

export const supabaseServer = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
