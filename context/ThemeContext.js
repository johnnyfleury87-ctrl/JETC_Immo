import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("speciale");

  // Chargement initial du thème depuis localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("jetc_theme");
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Application du thème au changement
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("jetc_theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme doit être utilisé dans ThemeProvider");
  }
  return context;
}
