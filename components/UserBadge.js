import { useEffect, useState } from "react";
import { getProfileLocal } from "../lib/session";
import { apiFetch } from "../lib/api";

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
        // ✅ TRY/CATCH TOTAL : JAMAIS crasher
        try {
          const subData = await apiFetch("/api/billing/subscription");
          
          // Vérifier que la réponse est valide
          if (subData && typeof subData === 'object' && subData.statut) {
            setSubscriptionStatus(subData.statut === "actif" ? "pro" : "demo");
          } else {
            // Fallback silencieux
            setSubscriptionStatus("demo");
          }
        } catch (error) {
          // ✅ ERREUR SILENCIEUSE : ne jamais bloquer le rendu
          console.warn('[UserBadge] Billing API indisponible, mode demo');
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
