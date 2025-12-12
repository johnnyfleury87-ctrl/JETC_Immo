// Gestion de la session utilisateur (localStorage)

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

export function clearSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("profile");
  }
}
