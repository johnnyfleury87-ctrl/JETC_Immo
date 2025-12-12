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

  useEffect(() => {    const checkSubscription = async () => {
      // Vérifier uniquement pour les rôles régie et entreprise
      if (
        profile &&
        (profile.role === "regie" || profile.role === "entreprise")
      ) {
        try {
          const subData = await apiFetch("/billing/subscription");
          setSubscriptionStatus(subData?.statut === "actif" ? "pro" : "demo");
        } catch {
          // Pas d'abonnement = mode DEMO
          setSubscriptionStatus("demo");
        }
      } else {
        // Locataire et technicien n'ont pas d'abonnement
        setSubscriptionStatus(null);
      }
      setLoading(false);
    };

    if (profile) {
      checkSubscription();
    }
  }, [profile?.id]);

  if (!profile) {
    return null;
  }

  const isDemoActive = subscriptionStatus === "demo";
  const isProMode = subscriptionStatus === "pro";

  const displayName = `${profile.prenom} ${profile.nom}`;

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

      {!loading &&
        (profile.role === "regie" || profile.role === "entreprise") && (
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
        )}
    </div>
  );
}
