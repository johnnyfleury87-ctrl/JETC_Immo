// Protection des pages par rôle

import { getRole } from "./session";

export function requireRole(allowedRoles) {
  if (typeof window !== "undefined") {
    const userRole = getRole();
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      window.location.href = "/login";
    }
  }
}
