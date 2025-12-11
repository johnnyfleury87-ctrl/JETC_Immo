// Gestion de la session utilisateur (localStorage)

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
