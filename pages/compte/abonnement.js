import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import { apiFetch, getProfile } from "../../lib/api";
import { requireRole } from "../../lib/roleGuard";

export default function AbonnementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [user, setUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    requireRole(["regie", "entreprise"]);
    
    const loadData = async () => {
      try {
        const profile = await getProfile();
        setUser(profile);

        try {
          const subData = await apiFetch("/billing/subscription");
          setSubscription(subData);
        } catch (error) {
          // Pas d'abonnement, c'est OK (mode DEMO)
          setSubscription(null);
        }
      } catch (error) {
        console.error("Erreur chargement données", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleManageBilling = async () => {
    setActionLoading(true);
    try {
      const res = await apiFetch("/billing/portal");
      if (res.url) {
        window.location.href = res.url;
      } else {
        alert("Erreur lors de l'accès au portail de facturation.");
        setActionLoading(false);
      }
    } catch (error) {
      console.error("Erreur portail facturation", error);
      alert("Erreur lors de l'accès au portail de facturation.");
      setActionLoading(false);
    }
  };

  const handleUpgradeToPro = async () => {
    router.push("/onboarding/plan");
  };

  if (loading) {
    return (
      <Layout>
        <Card>
          <p style={{ textAlign: "center", padding: "2rem" }}>Chargement...</p>
        </Card>
      </Layout>
    );
  }

  const hasPro = subscription && subscription.statut === "actif";

  return (
    <Layout>
      <Card>
        <h1 className="page-title">💳 Mon abonnement</h1>

        {!hasPro ? (
          // Mode DEMO
          <div>
            <Card style={{ 
              background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
              color: "white",
              padding: "2rem",
              marginBottom: "2rem",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🆓</div>
              <h2 style={{ fontSize: "1.8rem", margin: "0 0 1rem 0" }}>
                Vous êtes en mode DEMO
              </h2>
              <p style={{ fontSize: "1.1rem", opacity: 0.95, margin: 0 }}>
                Accès limité aux fonctionnalités. Passez en PRO pour débloquer tout le potentiel de JETC IMMO.
              </p>
            </Card>

            <Card style={{ padding: "2rem", marginBottom: "2rem" }}>
              <h3 style={{ margin: "0 0 1rem 0", color: "var(--primary)" }}>
                🔓 Fonctionnalités du mode PRO :
              </h3>
              <ul style={{ lineHeight: "2", fontSize: "1rem" }}>
                <li>✅ Accès complet à toutes les fonctionnalités</li>
                <li>✅ Gestion illimitée des tickets et missions</li>
                <li>✅ Facturation et exports automatisés</li>
                <li>✅ Analytics avancés et rapports personnalisés</li>
                <li>✅ Support prioritaire et assistance dédiée</li>
                <li>✅ Jusqu'à {user?.role === "regie" ? "10" : "20"} utilisateurs</li>
              </ul>
            </Card>

            <div style={{ textAlign: "center" }}>
              <Button
                onClick={handleUpgradeToPro}
                style={{ 
                  fontSize: "1.2rem",
                  padding: "1rem 2.5rem",
                  background: "var(--accent)",
                  fontWeight: "700"
                }}
                className="hover-bounce"
              >
                ⭐ Passer en PRO maintenant
              </Button>
            </div>
          </div>
        ) : (
          // Mode PRO actif
          <div>
            <Card style={{ 
              background: "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
              color: "white",
              padding: "2rem",
              marginBottom: "2rem",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⭐</div>
              <h2 style={{ fontSize: "1.8rem", margin: "0 0 1rem 0" }}>
                Mode PRO actif
              </h2>
              <p style={{ fontSize: "1.1rem", opacity: 0.95, margin: 0 }}>
                Vous profitez de toutes les fonctionnalités JETC IMMO
              </p>
            </Card>

            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2rem"
            }}>
              <Card style={{ padding: "1.5rem" }}>
                <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--primary)" }}>Plan actuel</h4>
                <p style={{ fontSize: "1.3rem", fontWeight: "700", margin: 0 }}>
                  {subscription.plan_nom || "N/A"}
                </p>
              </Card>

              <Card style={{ padding: "1.5rem" }}>
                <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--primary)" }}>Statut</h4>
                <span style={{
                  background: subscription.statut === "actif" ? "var(--green)" : "var(--orange)",
                  color: "white",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "6px",
                  fontWeight: "700",
                  fontSize: "1rem"
                }}>
                  {subscription.statut === "actif" ? "✅ Actif" : "⏳ En attente"}
                </span>
              </Card>

              <Card style={{ padding: "1.5rem" }}>
                <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--primary)" }}>Prix mensuel</h4>
                <p style={{ fontSize: "1.3rem", fontWeight: "700", margin: 0 }}>
                  {subscription.plan_prix}€ / mois
                </p>
              </Card>

              {subscription.date_fin && (
                <Card style={{ padding: "1.5rem" }}>
                  <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--primary)" }}>Renouvellement</h4>
                  <p style={{ fontSize: "1rem", margin: 0 }}>
                    {new Date(subscription.date_fin).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </p>
                </Card>
              )}
            </div>

            <Card style={{ padding: "2rem", background: "var(--background)" }}>
              <h3 style={{ margin: "0 0 1rem 0", color: "var(--primary)" }}>
                🛠️ Gestion de l'abonnement
              </h3>
              <p style={{ marginBottom: "1.5rem", opacity: 0.8 }}>
                Gérez votre abonnement, vos moyens de paiement et vos factures depuis le portail de facturation sécurisé.
              </p>
              <Button
                onClick={handleManageBilling}
                disabled={actionLoading}
                style={{ 
                  padding: "0.75rem 2rem",
                  opacity: actionLoading ? 0.6 : 1,
                  cursor: actionLoading ? "not-allowed" : "pointer"
                }}
                className="hover-bounce"
              >
                {actionLoading ? "⏳ Chargement..." : "💼 Gérer ma facturation"}
              </Button>
            </Card>

            <Card style={{ padding: "2rem", marginTop: "2rem", background: "var(--background)" }}>
              <h3 style={{ margin: "0 0 1rem 0", color: "var(--primary)" }}>
                📊 Informations complémentaires
              </h3>
              <ul style={{ lineHeight: "2", fontSize: "0.95rem" }}>
                <li>Nombre d'utilisateurs : {subscription.nombre_licences || 1}</li>
                <li>Date de début : {subscription.date_debut ? new Date(subscription.date_debut).toLocaleDateString("fr-FR") : "N/A"}</li>
                <li>Support prioritaire : ✅ Inclus</li>
                <li>Exports et rapports : ✅ Illimités</li>
              </ul>
            </Card>
          </div>
        )}
      </Card>
    </Layout>
  );
}
