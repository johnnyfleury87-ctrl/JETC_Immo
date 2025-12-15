import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getProfile } from '../lib/api';
import { logProfileLoad, logEnvironment } from '../lib/diagnostic';
import { supabase } from '../lib/supabase';

/**
 * AuthContext - Source de vérité UNIQUE pour l'authentification
 * 
 * Expose :
 * - profile: objet profil complet ou null
 * - loading: boolean (true pendant vérification)
 * - role: string (rôle de l'utilisateur)
 * - isAuthenticated: boolean
 */
const AuthContext = createContext({
  profile: null,
  loading: true,
  role: null,
  isAuthenticated: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Log environnement au démarrage (une seule fois)
    logEnvironment();
    
    async function loadProfile() {
      try {
        console.log('[AuthProvider] 🔄 Chargement profile...');
        
        // 🔧 FIX : Vérifier et rafraîchir la session si nécessaire
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[AuthProvider] ❌ Erreur récupération session:', sessionError.message);
          throw new Error('Session invalide: ' + sessionError.message);
        }
        
        if (!currentSession) {
          console.warn('[AuthProvider] ⚠️ Pas de session active');
          throw new Error('Aucune session active');
        }
        
        // Vérifier si la session est stale (> 1h)
        const expiresAt = currentSession.expires_at * 1000; // Convertir en ms
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;
        const hoursUntilExpiry = timeUntilExpiry / (1000 * 60 * 60);
        
        console.log('[AuthProvider] Session expire dans:', hoursUntilExpiry.toFixed(2), 'heures');
        
        // Si la session expire dans moins de 1h, la rafraîchir
        if (hoursUntilExpiry < 1) {
          console.warn('[AuthProvider] ⚠️ Session proche expiration, rafraîchissement...');
          
          const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error('[AuthProvider] ❌ Échec refresh session:', refreshError.message);
            throw new Error('Impossible de rafraîchir la session');
          }
          
          if (newSession) {
            console.log('[AuthProvider] ✅ Session rafraîchie, nouvelle expiration:', new Date(newSession.expires_at * 1000).toISOString());
          }
        } else {
          console.log('[AuthProvider] ✅ Session valide');
        }
        
        // Charger le profile
        const profileData = await getProfile();
        
        // Log succès avec diagnostic
        logProfileLoad(profileData, null);
        console.log('[AuthProvider] ✅ Profile chargé, role:', profileData.role);
        
        setProfile(profileData);
        
        // Cache pour sessionStorage (optionnel, pour compatibilité)
        try {
          sessionStorage.setItem('jetc_profile', JSON.stringify(profileData));
        } catch (e) {
          // Ignore errors
        }
      } catch (error) {
        console.error('[AuthProvider] ❌ Échec chargement profile:', error.message);
        
        // Log diagnostic détaillé
        logProfileLoad(null, error);
        
        setProfile(null);
        
        // Nettoyer cache
        try {
          sessionStorage.removeItem('jetc_profile');
        } catch (e) {
          // Ignore
        }
      } finally {
        console.log('[AuthProvider] 🏁 Chargement terminé, loading=false');
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const value = {
    profile,
    loading,
    role: profile?.role || null,
    isAuthenticated: !!profile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
