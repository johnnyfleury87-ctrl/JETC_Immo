import { supabase } from "../src/lib/supabaseClient";

/**
 * Envoie un Magic Link pour l'authentification admin
 * @param {string} email - Email de l'admin
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendAdminMagicLink(email) {
  try {
    console.log("[ADMIN] Step 1 - Right click detected");
    
    if (!email || !email.includes("@")) {
      console.error("[ADMIN][ERROR] Email validation failed", { email });
      return { success: false, error: "Email invalide" };
    }
    
    console.log("[ADMIN] Step 2 - Magic link request sent to Supabase", { email });
    
    const redirectTo = `${window.location.origin}/auth/callback?next=/admin`;
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    
    if (error) {
      console.error("[ADMIN][ERROR] Magic link send failed", { 
        error: error.message, 
        status: error.status,
        code: error.code 
      });
      return { success: false, error: error.message };
    }
    
    console.log("[ADMIN] Step 3 - Magic link email SENT", { email });
    
    return { success: true };
  } catch (err) {
    console.error("[ADMIN][ERROR] Unexpected error in sendAdminMagicLink", {
      message: err.message,
      stack: err.stack,
    });
    return { success: false, error: err.message };
  }
}

/**
 * Vérifie si l'utilisateur actuel a le role admin_jtec
 * @returns {Promise<{isAdmin: boolean, profile?: object, error?: string}>}
 */
export async function checkAdminRole() {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return { isAdmin: false, error: sessionError?.message || "No session" };
    }
    
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, role")
      .eq("id", session.user.id)
      .single();
    
    if (profileError) {
      return { isAdmin: false, error: profileError.message };
    }
    
    const isAdmin = profile.role === "admin_jtec";
    
    return { isAdmin, profile };
  } catch (err) {
    return { isAdmin: false, error: err.message };
  }
}
