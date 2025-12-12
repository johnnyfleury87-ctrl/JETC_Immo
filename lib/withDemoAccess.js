/**
 * HOC pour protéger les pages DEMO
 * 
 * Vérifie que l'utilisateur a le droit d'accéder au MODE DEMO
 * Redirige automatiquement si l'accès est refusé
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { canUseDemo, getDemoRedirectUrl } from "./demoAccess";
import { getProfile } from "./auth";

/**
 * Higher Order Component pour protéger les pages DEMO
 * 
 * @param {React.Component} Component - Le composant page à protéger
 * @returns {React.Component} - Le composant protégé
 */
export default function withDemoAccess(Component) {
  return function ProtectedDemoPage(props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
      const checkAccess = async () => {
        const user = await getProfile();
        
        // Vérifier si l'utilisateur peut accéder au DEMO
        const hasAccess = canUseDemo(user);
        
        if (!hasAccess) {
          // Redirection vers la page appropriée
          const redirectUrl = getDemoRedirectUrl(user, null);
          router.replace(redirectUrl);
          return;
        }
        
        setAuthorized(true);
        setLoading(false);
      };

      checkAccess();
    }, [router]);

    // Afficher un loader pendant la vérification
    if (loading || !authorized) {
      return (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "var(--background)"
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "3rem",
              marginBottom: "1rem"
            }}>
              ⏳
            </div>
            <p style={{ color: "var(--text)", fontSize: "1.2rem" }}>
              Vérification de l'accès...
            </p>
          </div>
        </div>
      );
    }

    // Si autorisé, afficher la page
    return <Component {...props} />;
  };
}
