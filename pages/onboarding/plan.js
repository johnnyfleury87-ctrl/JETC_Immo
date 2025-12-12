import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import { apiFetch, getProfile } from "../../lib/api";

export default function OnboardingPlan() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        setUserRole(profile.role);
      } catch (error) {
        console.error("Erreur chargement profil", error);
        const isDemo = typeof window !== "undefined" && localStorage.getItem("jetc_demo_mode") === "true";
        if (!isDemo) {
          router.push("/login");
        }
      }
    };
    loadProfile();
  }, [router]);

  const plans = [
    {
      id: "essentiel",
      name: "Essentiel",
      icon: "🌱",
      price: 49,
      period: "/mois",
      description: "Idéal pour démarrer",
      features: [
        { text: "Jusqu&apos;à 50 logements", included: true },
        { text: "Gestion des tickets", included: true },
        { text: "5 entreprises partenaires", included: true },
        { text: "Support email (48h)", included: true },
        { text: "1 utilisateur", included: true },
        { text: "Analytics avancés", included: false },
      ],
      color: "#10b981",
      badge: null,
    },
    {
      id: "pro",
      name: "Pro",
      icon: "⚡",
      price: 99,
      period: "/mois",
      description: "Le plus populaire",
      features: [
        { text: "Jusqu&apos;à 200 logements", included: true },
        { text: "Gestion complète", included: true },
        { text: "Entreprises illimitées", included: true },
        { text: "Support prioritaire (24h)", included: true },
        { text: "Jusqu&apos;à 5 utilisateurs", included: true },
        { text: "Analytics avancés", included: true },
      ],
      color: "#4f46e5",
      badge: "RECOMMANDÉ",
    },
    {
      id: "premium",
      name: "Premium",
      icon: "🚀",
      price: 199,
      period: "/mois",
      description: "Pour les pros exigeants",
      features: [
        { text: "Logements illimités", included: true },
        { text: "Multi-sites", included: true },
        { text: "Intégrations personnalisées", included: true },
        { text: "Manager dédié 7j/7", included: true },
        { text: "Utilisateurs illimités", included: true },
        { text: "API complète + formation", included: true },
      ],
      color: "#f59e0b",
      badge: null,
    },
  ];

  const handleChoosePlan = async (planId) => {
    setLoading(true);
    
    try {
      // Simuler l'appel API pour créer une session Stripe
      const res = await apiFetch("/billing/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ planId }),
      });

      if (res.url) {
        // Redirection vers Stripe Checkout
        window.location.href = res.url;
      } else {
        alert("Erreur lors de la création de la session de paiement.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Erreur création checkout", error);
      alert("Erreur lors de la création de la session de paiement.");
      setLoading(false);
    }
  };

  const handleSkipForNow = () => {
    // Accès au dashboard sans souscrire (mode gratuit limité)
    router.push(`/${userRole}/dashboard`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header avec bouton retour */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <Button
            onClick={() => router.back()}
            style={{
              background: "transparent",
              color: "var(--primary)",
              border: "2px solid var(--primary)",
            }}
            className="hover-bounce"
          >
            ← Retour
          </Button>

          <Button
            onClick={handleSkipForNow}
            style={{
              background: "transparent",
              color: "var(--text)",
              border: "none",
              textDecoration: "underline",
            }}
          >
            Passer cette étape →
          </Button>
        </div>

        {/* Hero Section */}
        <Card 
          className="fade-in"
          style={{ 
            padding: "3rem 2rem", 
            marginBottom: "3rem",
            textAlign: "center",
            background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
            color: "white",
          }}
        >
          <h1
            className="slide-up"
            style={{
              fontSize: "2.5rem",
              margin: "0 0 1rem 0",
              fontWeight: "800",
            }}
          >
            💳 Choisissez votre plan
          </h1>
          <p
            className="slide-up stagger-1"
            style={{
              fontSize: "1.2rem",
              opacity: 0.95,
              lineHeight: "1.6",
              maxWidth: "700px",
              margin: "0 auto 1.5rem auto",
            }}
          >
            Commencez avec un essai de 14 jours gratuit. Sans engagement, résiliable à tout moment.
          </p>

          <div
            className="slide-up stagger-2"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              padding: "0.8rem 1.5rem",
              borderRadius: "50px",
              fontSize: "1rem",
              fontWeight: "700",
              border: "2px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>🎁</span>
            <span>14 jours d&apos;essai gratuit inclus</span>
          </div>
        </Card>

        {/* Plans Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2rem",
            marginBottom: "3rem",
          }}
        >
          {plans.map((plan, index) => (
            <Card
              key={plan.id}
              className={`hover-glow slide-up stagger-${index + 1}`}
              style={{
                padding: "2.5rem",
                textAlign: "center",
                position: "relative",
                border: plan.badge
                  ? `3px solid ${plan.color}`
                  : "2px solid rgba(0, 0, 0, 0.1)",
                transform: plan.badge ? "scale(1.05)" : "scale(1)",
                boxShadow: plan.badge
                  ? `0 12px 40px ${plan.color}30`
                  : "0 4px 12px rgba(0, 0, 0, 0.08)",
              }}
            >
              {plan.badge && (
                <div
                  style={{
                    position: "absolute",
                    top: "-15px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: plan.color,
                    color: "white",
                    padding: "0.5rem 1.5rem",
                    borderRadius: "50px",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    boxShadow: `0 4px 12px ${plan.color}40`,
                  }}
                  className="pulse"
                >
                  ⭐ {plan.badge}
                </div>
              )}

              <div
                className="hover-rotate"
                style={{
                  fontSize: "4rem",
                  marginBottom: "1rem",
                  marginTop: plan.badge ? "1rem" : "0",
                }}
              >
                {plan.icon}
              </div>

              <h3
                style={{
                  fontSize: "2rem",
                  margin: "0 0 0.5rem 0",
                  color: plan.color,
                  fontWeight: "700",
                }}
              >
                {plan.name}
              </h3>

              <p
                style={{
                  fontSize: "0.95rem",
                  opacity: 0.7,
                  marginBottom: "1.5rem",
                }}
              >
                {plan.description}
              </p>

              <div style={{ marginBottom: "2rem" }}>
                <span
                  style={{
                    fontSize: "3.5rem",
                    fontWeight: "800",
                    color: plan.color,
                  }}
                >
                  {plan.price}€
                </span>
                <span
                  style={{
                    fontSize: "1.2rem",
                    opacity: 0.7,
                    marginLeft: "0.3rem",
                  }}
                >
                  {plan.period}
                </span>
              </div>

              <ul
                style={{
                  textAlign: "left",
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 2rem 0",
                  minHeight: "200px",
                }}
              >
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    style={{
                      padding: "0.8rem 0",
                      borderBottom:
                        idx < plan.features.length - 1
                          ? "1px solid rgba(0, 0, 0, 0.05)"
                          : "none",
                      fontSize: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.8rem",
                      opacity: feature.included ? 1 : 0.4,
                    }}
                  >
                    <span
                      style={{
                        color: feature.included ? plan.color : "#94a3b8",
                        fontWeight: "700",
                        fontSize: "1.2rem",
                      }}
                    >
                      {feature.included ? "✓" : "✗"}
                    </span>
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleChoosePlan(plan.id)}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "1rem",
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  background: plan.badge ? plan.color : "transparent",
                  color: plan.badge ? "white" : plan.color,
                  border: plan.badge ? "none" : `2px solid ${plan.color}`,
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                className="hover-bounce"
              >
                {loading ? "⏳ Chargement..." : `Essayer ${plan.name}`}
              </Button>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div
          className="slide-up stagger-4"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
            marginTop: "3rem",
          }}
        >
          <Card style={{ padding: "1.5rem", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
              🔒
            </div>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--primary)" }}>
              Paiement sécurisé
            </h4>
            <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.8 }}>
              Transactions protégées par Stripe
            </p>
          </Card>

          <Card style={{ padding: "1.5rem", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
              ↩️
            </div>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--primary)" }}>
              Sans engagement
            </h4>
            <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.8 }}>
              Résiliez à tout moment en 1 clic
            </p>
          </Card>

          <Card style={{ padding: "1.5rem", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
              💬
            </div>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--primary)" }}>
              Support dédié
            </h4>
            <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.8 }}>
              Une équipe à votre écoute 7j/7
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
