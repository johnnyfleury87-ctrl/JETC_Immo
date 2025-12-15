import { useEffect, useState } from "react";
import { getProfileLocal } from "../lib/session";
import { apiFetch } from "../lib/api";
import { logFetchDetails } from "../lib/diagnostic";

// Fonction helper pour afficher les rôles en français
function getRoleLabel(role) {
  const labels = {
    regie: "Régie",
    entreprise: "Entreprise",
    technicien: "Technicien",
    locataire: "Locataire",
  };
  return labels[role] || role;
}

export default function UserBadge() {
  const profile = getProfileLocal();
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      // GUARD: Ne rien faire si pas de profile ou profile incomplet
      if (!profile || !profile.id || !profile.role) {
        setLoading(false);
        return;
      }

      // GUARD: Admin JETC n'a pas d'abonnement
      if (profile.role === "admin_jtec") {
        setSubscriptionStatus(null);
        setLoading(false);
        return;
      }

      // Vérifier uniquement pour les rôles régie et entreprise
      if (profile.role === "regie" || profile.role === "entreprise") {
        try {
          console.log('[UserBadge] Tentative récupération abonnement pour:', profile.email);
          
          // Fetch avec diagnostic
          const fetchPromise = apiFetch("/billing/subscription");
          const subData = await (process.env.NODE_ENV === 'development' 
            ? logFetchDetails('/billing/subscription', fetchPromise) 
            : fetchPromise
          ).then(() => fetchPromise);
          
          console.log('[UserBadge] Abonnement récupéré:', subData);
          
          // Vérifier que la réponse est valide
          if (subData && typeof subData === 'object') {
            setSubscriptionStatus(subData?.statut === "actif" ? "pro" : "demo");
          } else {
            console.warn('[UserBadge] Réponse billing invalide:', subData);
            setSubscriptionStatus("demo");
          }
        } catch (error) {
          console.warn('[UserBadge] Erreur billing/subscription:', error.message);
          
          // Diagnostic détaillé en dev
          if (process.env.NODE_ENV === 'development') {
            console.group('🔍 [UserBadge] Détails erreur billing');
            console.log('Type:', error.constructor.name);
            console.log('Message:', error.message);
            console.log('Status:', error.status || 'N/A');
            console.log('Stack:', error.stack);
            console.groupEnd();
          }
          
          // API non disponible = mode DEMO par défaut (pas de blocage)
          setSubscriptionStatus("demo");
        }
      } else {
        // Locataire et technicien n'ont pas d'abonnement
        setSubscriptionStatus(null);
      }
      setLoading(false);
    };

    checkSubscription();
  }, [profile?.id, profile?.role]);

  if (!profile) {
    return null;
  }

  // Vérifications pour éviter undefined dans les conditions
  const isDemoActive = subscriptionStatus === "demo";
  const isProMode = subscriptionStatus === "pro";
  const showBadge = !loading && (profile.role === "regie" || profile.role === "entreprise");

  const displayName = `${profile.prenom || ''} ${profile.nom || ''}`.trim() || 'Utilisateur';

  return (
    <div
      style={{
        marginLeft: "auto",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <span style={{ fontWeight: "500" }}>
        {displayName}
      </span>

      {showBadge ? (
        <span
          style={{
            background: isDemoActive
              ? "var(--orange)"
              : isProMode
                ? "var(--green)"
                : "transparent",
            color: "white",
            padding: "0.35rem 0.75rem",
            borderRadius: "6px",
            fontSize: "0.85rem",
            fontWeight: "700",
            boxShadow: "var(--shadow)",
          }}
        >
          {isDemoActive ? "🆓 DEMO" : isProMode ? "⭐ PRO" : ""}
        </span>
      ) : null}
    </div>
  );
}
