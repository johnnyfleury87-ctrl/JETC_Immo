/**
 * Helpers de diagnostic pour débugger les problèmes d'environnement,
 * d'API et de chargement des données
 * 
 * Utilisation :
 * - En dev : toujours actif
 * - En prod : activer avec localStorage.setItem('jetc_debug', 'true')
 */

const isDiagnosticEnabled = () => {
  if (typeof window === 'undefined') return false;
  
  // Toujours actif en dev
  if (process.env.NODE_ENV === 'development') return true;
  
  // En prod, vérifier localStorage
  try {
    return localStorage.getItem('jetc_debug') === 'true';
  } catch {
    return false;
  }
};

/**
 * Log les variables d'environnement critiques
 */
export function logEnvironment() {
  if (!isDiagnosticEnabled()) return;
  
  console.group('🔍 [DIAGNOSTIC] Environnement');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ MANQUANT');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Présent' : '❌ MANQUANT');
  console.log('API Base URL:', typeof window !== 'undefined' ? window.location.origin : 'N/A');
  console.groupEnd();
}

/**
 * Log les détails d'un fetch API
 */
export async function logFetchDetails(url, fetchPromise) {
  if (!isDiagnosticEnabled()) return fetchPromise;
  
  const startTime = Date.now();
  
  try {
    const response = await fetchPromise;
    const duration = Date.now() - startTime;
    
    // Clone la réponse pour pouvoir lire le body sans consommer le stream
    const clonedResponse = response.clone();
    let body;
    
    try {
      body = await clonedResponse.json();
    } catch {
      body = await clonedResponse.text();
    }
    
    console.group(`🌐 [DIAGNOSTIC] Fetch: ${url}`);
    console.log('Status:', response.status, response.statusText);
    console.log('Duration:', duration + 'ms');
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Body:', body);
    console.groupEnd();
    
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.group(`❌ [DIAGNOSTIC] Fetch FAILED: ${url}`);
    console.log('Duration:', duration + 'ms');
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
    console.groupEnd();
    
    throw error;
  }
}

/**
 * Log les détails d'une requête Supabase
 */
export function logSupabaseQuery(tableName, query, result) {
  if (!isDiagnosticEnabled()) return;
  
  const { data, error, count } = result;
  
  console.group(`🗄️ [DIAGNOSTIC] Supabase: ${tableName}`);
  console.log('Query:', query);
  console.log('Data:', data);
  console.log('Count:', count);
  if (error) {
    console.error('Error:', error);
  }
  console.groupEnd();
}

/**
 * Log les détails du profile chargé (SANS DONNÉES SENSIBLES)
 */
export function logProfileLoad(profile, error) {
  if (!isDiagnosticEnabled()) return;
  
  if (error) {
    console.group('❌ [DIAGNOSTIC] Profile Load FAILED');
    console.error('Error:', error.message);
    console.groupEnd();
    return;
  }
  
  console.group('✅ [DIAGNOSTIC] Profile Loaded');
  console.log('User ID:', profile?.id);
  console.log('Role:', profile?.role);
  // ❌ NE PAS LOGGER L'EMAIL (RGPD)
  console.log('Has Email:', !!profile?.email);
  console.log('Regie ID:', profile?.regie_id || 'N/A');
  console.log('Entreprise ID:', profile?.entreprise_id || 'N/A');
  console.groupEnd();
}

/**
 * Log les erreurs React (en dev)
 */
export function logReactError(error, errorInfo) {
  if (!isDiagnosticEnabled()) return;
  
  console.group('⚛️ [DIAGNOSTIC] React Error');
  console.error('Error:', error);
  console.error('Component Stack:', errorInfo?.componentStack);
  console.groupEnd();
}

/**
 * Vérifier l'état de la session Supabase
 */
export async function checkSupabaseSession(supabase) {
  if (!isDiagnosticEnabled()) return;
  
  console.group('🔐 [DIAGNOSTIC] Session Supabase');
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Erreur getSession:', error);
    } else if (!session) {
      console.warn('⚠️ Aucune session active');
    } else {
      console.log('✅ Session active');
      console.log('User ID:', session.user?.id);
      console.log('Email:', session.user?.email);
      console.log('Access Token:', session.access_token ? '✅ Présent' : '❌ MANQUANT');
      console.log('Expires At:', new Date(session.expires_at * 1000).toISOString());
    }
  } catch (err) {
    console.error('❌ Exception:', err);
  }
  
  console.groupEnd();
}

/**
 * Activer le mode diagnostic (en prod)
 */
export function enableDiagnostic() {
  if (typeof window === 'undefined') return;
  localStorage.setItem('jetc_debug', 'true');
  console.log('✅ Mode diagnostic activé');
}

/**
 * Désactiver le mode diagnostic
 */
export function disableDiagnostic() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('jetc_debug');
  console.log('❌ Mode diagnostic désactivé');
}

/**
 * Afficher un rapport complet
 */
export async function fullDiagnosticReport(supabase) {
  console.group('📊 [DIAGNOSTIC] Rapport Complet');
  
  logEnvironment();
  await checkSupabaseSession(supabase);
  
  console.log('Timestamp:', new Date().toISOString());
  console.log('User Agent:', typeof window !== 'undefined' ? navigator.userAgent : 'N/A');
  console.log('URL:', typeof window !== 'undefined' ? window.location.href : 'N/A');
  
  console.groupEnd();
}
