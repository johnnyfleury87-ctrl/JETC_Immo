// Gestion de la session utilisateur (localStorage)

// ============================================
// FONCTION HELPER : Détecter le MODE DEMO
// ============================================
export function isDemoMode() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("jetc_demo_mode") === "true";
}

export function getDemoRole() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("jetc_demo_role");
}

// ============================================
// FONCTION CENTRALE : Entrer en mode DEMO
// ============================================
export function enterDemoRole(roleId, rolePath) {
  if (typeof window === "undefined") return false;

  console.log("🚀 DÉMARRAGE MODE DEMO - Rôle:", roleId);

  try {
    // 1. Activer le mode DEMO
    localStorage.setItem("jetc_demo_mode", "true");
    console.log("✅ Step 1/4: jetc_demo_mode = true");

    // 2. Définir le rôle
    localStorage.setItem("jetc_demo_role", roleId);
    localStorage.setItem("role", roleId);
    console.log("✅ Step 2/4: Rôle =", roleId);

    // 3. Créer le profil DEMO
    const profile = getDemoProfileByRole(roleId);
    localStorage.setItem("profile", JSON.stringify(profile));
    console.log("✅ Step 3/4: Profil créé", profile.email, profile.role);

    // 4. Créer la session DEMO
    const session = {
      token: "demo_token_" + Date.now(),
      role: roleId,
      user: profile,
    };
    localStorage.setItem("session", JSON.stringify(session));
    console.log("✅ Step 4/4: Session créée");

    // Validation finale
    console.log("🎯 ÉTAT DEMO FINAL:", {
      mode: localStorage.getItem("jetc_demo_mode"),
      role: localStorage.getItem("jetc_demo_role"),
      profile: JSON.parse(localStorage.getItem("profile") || "{}").role,
    });

    return true;
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation DEMO:", error);
    return false;
  }
}

// Profil DEMO maître fixe
export function getDemoProfile() {
  return {
    id: "DEMO_USER_001",
    email: "johnny.fleury87@gmail.com",
    nom: "Fleury",
    prenom: "Johnny",
    telephone: "+33 6 12 34 56 78",
    role: "regie",
    regie_id: "REGIE_DEMO_001",
    regie_nom: "Régie Démo Perritie",
    entreprise_id: null,
    is_demo: true,
    permissions: ["full_access", "create_tickets", "manage_users", "view_analytics"],
    created_at: "2025-01-01T00:00:00.000Z",
    avatar_url: null,
  };
}

// Profils DEMO par rôle (pour navigation multi-rôles)
export function getDemoProfileByRole(role) {
  const baseProfile = getDemoProfile();
  
  const roleProfiles = {
    regie: {
      ...baseProfile,
      role: "regie",
      regie_id: "REGIE_DEMO_001",
      regie_nom: "Régie Démo Perritie",
      entreprise_id: null,
      permissions: ["full_access", "create_tickets", "manage_users", "view_analytics"],
    },
    entreprise: {
      ...baseProfile,
      role: "entreprise",
      regie_id: null,
      entreprise_id: "ENTREPRISE_DEMO_001",
      entreprise_nom: "Maintenance Démo Pro",
      permissions: ["receive_tickets", "manage_technicians", "create_invoices"],
    },
    technicien: {
      ...baseProfile,
      role: "technicien",
      regie_id: null,
      entreprise_id: "ENTREPRISE_DEMO_001",
      technicien_id: "TECH_DEMO_001",
      permissions: ["view_missions", "update_status", "upload_photos"],
    },
    locataire: {
      ...baseProfile,
      role: "locataire",
      regie_id: "REGIE_DEMO_001",
      locataire_id: "LOCATAIRE_DEMO_001",
      logement_id: "LOGEMENT_DEMO_001",
      permissions: ["create_tickets", "view_own_tickets"],
    },
    admin_jtec: {
      ...baseProfile,
      role: "admin_jtec",
      permissions: ["super_admin", "manage_all"],
    },
  };

  return roleProfiles[role] || roleProfiles.regie;
}

export function saveSession(data) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", data.token || "");
    localStorage.setItem("role", data.role || "");
  }
}

export function getRole() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("role");
  }
  return null;
}

export function getToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

export function saveProfile(profile) {
  if (typeof window !== "undefined") {
    localStorage.setItem("profile", JSON.stringify(profile));
  }
}

export function getProfileLocal() {
  if (typeof window !== "undefined") {
    const profile = localStorage.getItem("profile");
    return profile ? JSON.parse(profile) : null;
  }
  return null;
}

// Alias pour compatibilité avec imports existants
export const getProfile = getProfileLocal;

export function clearSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("profile");
  }
}
