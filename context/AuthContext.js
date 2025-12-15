import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getProfile } from '../lib/api';
import { logProfileLoad, logEnvironment } from '../lib/diagnostic';

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
