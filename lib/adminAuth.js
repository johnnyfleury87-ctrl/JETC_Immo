import { supabase } from "../src/lib/supabaseClient";

/**
 * Envoie un Magic Link pour l'authentification admin
 * @param {string} email - Email de l'admin
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendAdminMagicLink(email) {
  try {
    if (!email || !email.includes("@")) {
      console.error("[ADMIN][ERROR] Email validation failed", { email });
      return { success: false, error: "Email invalide" };
    }
    
    const redirectTo = `${window.location.origin}/auth/callback?next=/admin`;
    
    console.log("[ADMIN][STEP 3] Magic link request sent to Supabase", { 
      email,
      redirectTo 
    });
    
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
    
    console.log("[ADMIN][STEP 3] ✅ Magic link email SENT successfully", { 
      email,
      sessionData: data 
    });
    
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
    console.log("[AUTH] checkAdminRole - Getting session...");
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("[AUTH] checkAdminRole - Session error", sessionError);
      return { isAdmin: false, error: sessionError.message };
    }
    
    if (!session) {
      console.warn("[AUTH] checkAdminRole - No active session");
      return { isAdmin: false, error: "No session" };
    }
    
    console.log("[AUTH] checkAdminRole - Session OK, user.id =", session.user.id);
    console.log("[AUTH] checkAdminRole - Fetching profile from DB...");
    
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, role")
      .eq("id", session.user.id)
      .single();
    
    if (profileError) {
      console.error("[AUTH] checkAdminRole - Profile fetch error", profileError);
      return { isAdmin: false, error: profileError.message };
    }
    
    console.log("[AUTH] checkAdminRole - Profile fetched:", {
      id: profile.id,
      email: profile.email,
      role: profile.role
    });
    
    const isAdmin = profile.role === "admin_jtec";
    console.log("[AUTH] checkAdminRole - Is admin?", isAdmin);
    
    return { isAdmin, profile };
  } catch (err) {
    console.error("[AUTH] checkAdminRole - Unexpected error", err);
    return { isAdmin: false, error: err.message };
  }
}
