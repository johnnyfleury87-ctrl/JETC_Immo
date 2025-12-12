import { createContext, useContext, useState, useEffect } from "react";
import { getDemoProfileByRole } from "../lib/session";

const DemoModeContext = createContext();

export function DemoModeProvider({ children }) {
  const [demoMode, setDemoMode] = useState(false);
  const [demoRole, setDemoRole] = useState("regie");
  const [demoProfile, setDemoProfile] = useState(null);

  // Charger l'état du localStorage au montage
  useEffect(() => {
    const storedMode = localStorage.getItem("jetc_demo_mode");
    const storedRole = localStorage.getItem("jetc_demo_role");

    if (storedMode === "true") {
      setDemoMode(true);
      const role = storedRole || "regie";
      setDemoRole(role);
      setDemoProfile(getDemoProfileByRole(role));
    } else if (storedRole) {
      setDemoRole(storedRole);
    }
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem("jetc_demo_mode", demoMode ? "true" : "false");
    
    // Mettre à jour le profil DEMO si mode actif
    if (demoMode) {
      const profile = getDemoProfileByRole(demoRole);
      setDemoProfile(profile);
      
      // Sauvegarder le profil dans localStorage pour compatibilité
      localStorage.setItem("profile", JSON.stringify(profile));
    } else {
      setDemoProfile(null);
    }
  }, [demoMode, demoRole]);

  useEffect(() => {
    localStorage.setItem("jetc_demo_role", demoRole);
  }, [demoRole]);

  const toggleDemoMode = () => {
    setDemoMode((prev) => !prev);
  };

  const enableDemoMode = () => {
    setDemoMode(true);
    const profile = getDemoProfileByRole(demoRole);
    setDemoProfile(profile);
  };

  const disableDemoMode = () => {
    setDemoMode(false);
    setDemoProfile(null);
    localStorage.removeItem("profile");
  };

  const changeDemoRole = (role) => {
    setDemoRole(role);
    
    // Mettre à jour le profil DEMO
    const profile = getDemoProfileByRole(role);
    setDemoProfile(profile);
    
    // Mettre à jour aussi le localStorage de session pour compatibilité
    if (typeof window !== "undefined") {
      const sessionData = localStorage.getItem("session");
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData);
          session.role = role;
          localStorage.setItem("session", JSON.stringify(session));
        } catch (e) {
          // Si pas de session, en créer une pour le mode DEMO
          localStorage.setItem(
            "session",
            JSON.stringify({
              token: "demo_token",
              role: role,
            })
          );
        }
      } else {
        // Créer une session DEMO
        localStorage.setItem(
          "session",
          JSON.stringify({
            token: "demo_token",
            role: role,
          })
        );
      }
      
      // Sauvegarder le profil
      localStorage.setItem("profile", JSON.stringify(profile));
    }
  };

  return (
    <DemoModeContext.Provider
      value={{
        demoMode,
        demoRole,
        demoProfile,
        toggleDemoMode,
        enableDemoMode,
        disableDemoMode,
        changeDemoRole,
      }}
    >
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error("useDemoMode must be used within a DemoModeProvider");
  }
  return context;
}
