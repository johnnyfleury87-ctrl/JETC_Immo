import { useEffect } from "react";
import { useRouter } from "next/router";
import { ThemeProvider } from "../context/ThemeContext";
import { DemoModeProvider } from "../context/DemoModeContext";
import { createClient } from "@supabase/supabase-js";
import "../styles/global.css";
import "../styles/animations.css";
import "../styles/marketing.css";
import "../styles/theme-speciale.css";
import "../styles/theme-jardin.css";
import "../styles/theme-zen.css";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // La gestion du magic link est maintenant dans login.js uniquement
  // Cet effect n'est plus nécessaire car login.js gère directement la redirection

  return (
    <DemoModeProvider>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </DemoModeProvider>
  );
}
