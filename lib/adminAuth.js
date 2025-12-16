import { supabase } from "../src/lib/supabaseClient";

/**
 * Helper pour logger les étapes du flux Admin Magic Link
 */
export function adminLog(step, msg, extra = null) {
  const timestamp = new Date().toISOString();
  console.log(`[ADMIN-AUTH][${step}] ${msg}`, extra || "");
  console.log(`  └─ Timestamp: ${timestamp}`);
}

/**
 * Envoie un Magic Link pour l'authentification admin
 * @param {string} email - Email de l'admin
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendAdminMagicLink(email) {
  try {
    adminLog(1, "RightClick detected on logo");
    
    if (!email || !email.includes("@")) {
      adminLog(2, "Email validation FAILED", { email });
      return { success: false, error: "Email invalide" };
    }
    
    adminLog(2, "Email validated", { email });
    
    const redirectTo = `${window.location.origin}/auth/callback?next=/admin`;
    adminLog(3, "Calling supabase.auth.signInWithOtp...", { 
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
      adminLog(4, "OTP request FAILED", { 
        error: error.message, 
        status: error.status,
        code: error.code 
      });
      return { success: false, error: error.message };
    }
    
    adminLog(4, "OTP request SUCCESS (mail should be sent)", { 
      data,
      email 
    });
    
    return { success: true };
  } catch (err) {
    adminLog("ERROR", "Unexpected error in sendAdminMagicLink", {
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
    
    if (sessionError) {
      adminLog("ERROR", "Session error", { error: sessionError.message });
      return { isAdmin: false, error: sessionError.message };
    }
    
    if (!session) {
      adminLog("WARN", "No active session");
      return { isAdmin: false, error: "No session" };
    }
    
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, role")
      .eq("id", session.user.id)
      .single();
    
    if (profileError) {
      adminLog("ERROR", "Profile fetch error", { error: profileError.message });
      return { isAdmin: false, error: profileError.message };
    }
    
    const isAdmin = profile.role === "admin_jtec";
    adminLog(7, "Profile fetched", { 
      role: profile.role, 
      email: profile.email,
      isAdmin 
    });
    
    return { isAdmin, profile };
  } catch (err) {
    adminLog("ERROR", "Unexpected error in checkAdminRole", {
      message: err.message,
      stack: err.stack,
    });
    return { isAdmin: false, error: err.message };
  }
}
