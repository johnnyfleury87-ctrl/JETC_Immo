import { createContext, useContext, useState, useEffect } from "react";

const DemoModeContext = createContext();

export function DemoModeProvider({ children }) {
  const [demoMode, setDemoMode] = useState(false);

  // Charger l'état du localStorage au montage
  useEffect(() => {
    const stored = localStorage.getItem("jetc_demo_mode");
    if (stored === "true") {
      setDemoMode(true);
    }
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem("jetc_demo_mode", demoMode ? "true" : "false");
  }, [demoMode]);

  const toggleDemoMode = () => {
    setDemoMode((prev) => !prev);
  };

  const enableDemoMode = () => {
    setDemoMode(true);
  };

  const disableDemoMode = () => {
    setDemoMode(false);
  };

  return (
    <DemoModeContext.Provider
      value={{
        demoMode,
        toggleDemoMode,
        enableDemoMode,
        disableDemoMode,
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
