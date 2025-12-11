import { useEffect, useState } from "react";
import { getProfileLocal } from "../lib/session";
import { apiFetch } from "../lib/api";

export default function UserBadge() {
  const profile = getProfileLocal();
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      // Vérifier uniquement pour les rôles régie et entreprise
      if (profile && (profile.role === "regie" || profile.role === "entreprise")) {
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

  const isDemoMode = subscriptionStatus === "demo";
  const isProMode = subscriptionStatus === "pro";

  return (
    <div style={{ 
      marginLeft: "auto", 
      display: "flex", 
      alignItems: "center", 
      gap: "1rem" 
    }}>
      <span style={{ fontWeight: "500" }}>
        Bonjour, {profile.prenom} {profile.nom}
      </span>
      
      {!loading && (profile.role === "regie" || profile.role === "entreprise") && (
        <span style={{
          background: isDemoMode ? "var(--orange)" : isProMode ? "var(--green)" : "transparent",
          color: "white",
          padding: "0.35rem 0.75rem",
          borderRadius: "6px",
          fontSize: "0.85rem",
          fontWeight: "700",
          boxShadow: "var(--shadow)"
        }}>
          {isDemoMode ? "🆓 DEMO" : isProMode ? "⭐ PRO" : ""}
        </span>
      )}
    </div>
  );
}
