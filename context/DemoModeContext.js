import { createContext, useContext, useState, useEffect } from "react";

const DemoModeContext = createContext();

export function DemoModeProvider({ children }) {
  const [demoMode, setDemoMode] = useState(false);
  const [demoRole, setDemoRole] = useState("locataire");

  // Charger l'état du localStorage au montage
  useEffect(() => {
    const storedMode = localStorage.getItem("jetc_demo_mode");
    const storedRole = localStorage.getItem("jetc_demo_role");

    if (storedMode === "true") {
      setDemoMode(true);
    }

    if (storedRole) {
      setDemoRole(storedRole);
    }
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem("jetc_demo_mode", demoMode ? "true" : "false");
  }, [demoMode]);

  useEffect(() => {
    localStorage.setItem("jetc_demo_role", demoRole);
  }, [demoRole]);

  const toggleDemoMode = () => {
    setDemoMode((prev) => !prev);
  };

  const enableDemoMode = () => {
    setDemoMode(true);
  };

  const disableDemoMode = () => {
    setDemoMode(false);
  };

  const changeDemoRole = (role) => {
    setDemoRole(role);
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
    }
  };

  return (
    <DemoModeContext.Provider
      value={{
        demoMode,
        demoRole,
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
