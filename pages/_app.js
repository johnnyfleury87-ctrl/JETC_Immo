import { useEffect } from "react";
import { useRouter } from "next/router";
import { ThemeProvider } from "../context/ThemeContext";
import { DemoModeProvider } from "../context/DemoModeContext";
import { supabase } from "../lib/supabase";
import "../styles/global.css";
import "../styles/animations.css";
import "../styles/marketing.css";
import "../styles/theme-speciale.css";
import "../styles/theme-jardin.css";
import "../styles/theme-zen.css";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // Listener global pour tous les changements d'état auth Supabase
  // S'exécute UNE SEULE FOIS au montage du composant
  useEffect(() => {
    console.log('[AUTH] Initialisation listener Supabase auth');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AUTH] Event:', event, 'Session:', !!session);

      // Si connexion réussie (magic link ou autre)
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          // Charger le profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('[AUTH] Erreur chargement profile:', error);
            return;
          }

          console.log('[AUTH] Profile chargé:', profile?.role);

          // Redirection automatique pour admin_jtec
          if (profile?.role === 'admin_jtec') {
            console.log('[AUTH] Redirection vers /admin/jetc');
            window.location.href = '/admin/jetc'; // Hard redirect pour éviter les boucles
            return;
          }

          // Redirection selon le rôle pour les autres
          if (profile?.role) {
            const roleRoutes = {
              'locataire': '/locataire/tickets',
              'regie': '/regie/dashboard',
              'entreprise': '/entreprise/missions',
              'technicien': '/technicien/missions'
            };

            const targetRoute = roleRoutes[profile.role];
            const currentPath = window.location.pathname;
            
            // Rediriger uniquement si on est sur /login ou /
            if (targetRoute && (currentPath === '/login' || currentPath === '/')) {
              window.location.href = targetRoute; // Hard redirect
            }
          }
        } catch (err) {
          console.error('[AUTH] Erreur lors de la gestion de la connexion:', err);
        }
      }

      // Si déconnexion
      if (event === 'SIGNED_OUT') {
        console.log('[AUTH] Déconnexion détectée');
        window.location.href = '/login'; // Hard redirect
      }
    });

    // Nettoyage : désabonner lors du démontage
    return () => {
      console.log('[AUTH] Nettoyage listener Supabase');
      subscription?.unsubscribe();
    };
  }, []); // VIDE : s'exécute UNE SEULE FOIS

  return (
    <DemoModeProvider>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </DemoModeProvider>
  );
}
