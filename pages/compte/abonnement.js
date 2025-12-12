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
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview, plans, invoices
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Plans statiques (même structure que pricing.js)
  const plans = [
    {
      id: "essentiel",
      nom: "Essentiel",
      prix: 49,
      description: "Pour démarrer votre activité",
      features: [
        "Jusqu'à 5 utilisateurs",
        "100 tickets par mois",
        "Gestion de base",
        "Support par email",
        "Rapports standards",
        "1 Go de stockage",
      ],
    },
    {
      id: "pro",
      nom: "Pro",
      prix: 99,
      description: "Pour une gestion complète",
      popular: true,
      features: [
        "Jusqu'à 15 utilisateurs",
        "Tickets illimités",
        "Gestion avancée",
        "Support prioritaire",
        "Analytics avancés",
        "10 Go de stockage",
        "Facturation automatique",
        "API & Webhooks",
      ],
    },
    {
      id: "premium",
      nom: "Premium",
      prix: 199,
      description: "Pour les grandes structures",
      features: [
        "Utilisateurs illimités",
        "Tickets illimités",
        "Fonctionnalités complètes",
        "Support dédié 24/7",
        "Analytics personnalisés",
        "Stockage illimité",
        "Facturation avancée",
        "API & Webhooks",
        "Formation personnalisée",
        "Accompagnement dédié",
      ],
    },
  ];

  // Factures simulées (à remplacer par vraies données API)
  const mockInvoices = [
    {
      id: 1,
      date: "2025-12-01",
      montant: 99,
      statut: "payée",
      numero: "INV-2025-12-001",
    },
    {
      id: 2,
      date: "2025-11-01",
      montant: 99,
      statut: "payée",
      numero: "INV-2025-11-001",
    },
    {
      id: 3,
      date: "2025-10-01",
      montant: 99,
      statut: "payée",
      numero: "INV-2025-10-001",
    },
  ];

  useEffect(() => {
    requireRole(["regie", "entreprise"]);

    const loadData = async () => {
      try {
        await getProfile();

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

  const handleChangePlan = (planId) => {
    setActionLoading(true);
    // Simuler changement de plan - à implémenter avec vraie API Stripe
    setTimeout(() => {
      alert(`Changement vers le plan ${planId} en cours...`);
      setActionLoading(false);
      setActiveTab("overview");
    }, 1500);
  };

  const handleCancelSubscription = () => {
    setShowCancelModal(true);
  };

  const confirmCancelSubscription = async () => {
    setActionLoading(true);
    try {
      // API call pour annuler l'abonnement
      await apiFetch("/billing/cancel", { method: "POST" });
      alert("Votre abonnement sera annulé à la fin de la période en cours.");
      setShowCancelModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Erreur annulation", error);
      alert("Erreur lors de l'annulation de l'abonnement.");
    } finally {
      setActionLoading(false);
    }
  };

  const getCurrentPlanId = () => {
    if (!subscription || !subscription.plan_nom) return null;
    const planName = subscription.plan_nom.toLowerCase();
    if (planName.includes("essentiel")) return "essentiel";
    if (planName.includes("pro")) return "pro";
    if (planName.includes("premium")) return "premium";
    return null;
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
          <Card>
            <p style={{ textAlign: "center", padding: "2rem" }}>⏳ Chargement...</p>
          </Card>
        </div>
      </Layout>
    );
  }

  const hasPro = subscription && subscription.statut === "actif";
  const currentPlanId = getCurrentPlanId();

  return (
    <Layout>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        {/* Header avec tabs */}
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              margin: "0 0 0.5rem 0",
              background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            💳 Mon abonnement
          </h1>
          <p style={{ fontSize: "1.1rem", opacity: 0.7, margin: 0 }}>
            Gérez votre abonnement et vos paiements
          </p>
        </div>

        {/* Tabs Navigation */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            borderBottom: "2px solid rgba(0,0,0,0.1)",
            flexWrap: "wrap",
          }}
        >
          {[
            { id: "overview", label: "📊 Vue d'ensemble", icon: "📊" },
            { id: "plans", label: "💎 Changer de plan", icon: "💎" },
            { id: "invoices", label: "🧾 Factures", icon: "🧾" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "1rem 1.5rem",
                background: "transparent",
                border: "none",
                borderBottom:
                  activeTab === tab.id
                    ? "3px solid var(--accent)"
                    : "3px solid transparent",
                color: activeTab === tab.id ? "var(--accent)" : "var(--text)",
                fontWeight: activeTab === tab.id ? "700" : "500",
                fontSize: "1rem",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              className="hover-glow"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: Vue d'ensemble */}
        {activeTab === "overview" && (
          <div className="fade-in">
            {!hasPro ? (
              // Mode DEMO
              <>
                <Card
                  style={{
                    background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
                    color: "white",
                    padding: "3rem",
                    marginBottom: "2rem",
                    textAlign: "center",
                    borderRadius: "16px",
                    boxShadow: "0 8px 32px rgba(255, 152, 0, 0.3)",
                  }}
                  className="hover-glow"
                >
                  <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🆓</div>
                  <h2 style={{ fontSize: "2rem", margin: "0 0 1rem 0", fontWeight: "700" }}>
                    Mode DEMO actif
                  </h2>
                  <p style={{ fontSize: "1.2rem", opacity: 0.95, margin: 0 }}>
                    Découvrez JETC IMMO gratuitement avec accès limité
                  </p>
                </Card>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "1.5rem",
                    marginBottom: "2rem",
                  }}
                >
                  <Card style={{ padding: "2rem" }} className="hover-glow slide-up">
                    <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔓</div>
                    <h3 style={{ margin: "0 0 1rem 0", color: "var(--primary)" }}>
                      Passez en PRO
                    </h3>
                    <p style={{ fontSize: "0.95rem", lineHeight: "1.6", opacity: 0.8 }}>
                      Débloquez toutes les fonctionnalités : gestion illimitée,
                      analytics avancés, support prioritaire et bien plus.
                    </p>
                  </Card>

                  <Card style={{ padding: "2rem" }} className="hover-glow slide-up">
                    <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📊</div>
                    <h3 style={{ margin: "0 0 1rem 0", color: "var(--primary)" }}>
                      Analytics avancés
                    </h3>
                    <p style={{ fontSize: "0.95rem", lineHeight: "1.6", opacity: 0.8 }}>
                      Rapports personnalisés, tableaux de bord en temps réel et
                      exports automatisés pour piloter votre activité.
                    </p>
                  </Card>

                  <Card style={{ padding: "2rem" }} className="hover-glow slide-up">
                    <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🎯</div>
                    <h3 style={{ margin: "0 0 1rem 0", color: "var(--primary)" }}>
                      Support dédié
                    </h3>
                    <p style={{ fontSize: "0.95rem", lineHeight: "1.6", opacity: 0.8 }}>
                      Assistance prioritaire, formation personnalisée et
                      accompagnement pour réussir votre déploiement.
                    </p>
                  </Card>
                </div>

                <Card style={{ padding: "2.5rem", background: "var(--background)" }}>
                  <h3
                    style={{
                      margin: "0 0 1.5rem 0",
                      color: "var(--primary)",
                      fontSize: "1.5rem",
                    }}
                  >
                    ✨ Ce que vous obtenez en PRO :
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                      gap: "1rem",
                      marginBottom: "2rem",
                    }}
                  >
                    {[
                      "Tickets & missions illimités",
                      "Facturation automatique",
                      "Multi-utilisateurs",
                      "API & Webhooks",
                      "Exports avancés",
                      "Support prioritaire",
                    ].map((feature, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontSize: "1rem",
                        }}
                      >
                        <span style={{ color: "var(--accent)", fontSize: "1.2rem" }}>
                          ✓
                        </span>
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <Button
                      onClick={handleUpgradeToPro}
                      style={{
                        fontSize: "1.2rem",
                        padding: "1.25rem 3rem",
                        background: "var(--accent)",
                        fontWeight: "700",
                        boxShadow: "0 4px 16px rgba(0, 122, 255, 0.3)",
                      }}
                      className="hover-bounce"
                    >
                      ⭐ Passer en PRO maintenant
                    </Button>
                    <p
                      style={{
                        marginTop: "1rem",
                        fontSize: "0.9rem",
                        opacity: 0.6,
                      }}
                    >
                      14 jours d&apos;essai gratuit • Sans engagement
                    </p>
                  </div>
                </Card>
              </>
            ) : (
              // Mode PRO actif
              <>
                <Card
                  style={{
                    background: "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
                    color: "white",
                    padding: "3rem",
                    marginBottom: "2rem",
                    textAlign: "center",
                    borderRadius: "16px",
                    boxShadow: "0 8px 32px rgba(76, 175, 80, 0.3)",
                  }}
                  className="hover-glow"
                >
                  <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⭐</div>
                  <h2 style={{ fontSize: "2rem", margin: "0 0 1rem 0", fontWeight: "700" }}>
                    Abonnement PRO actif
                  </h2>
                  <p style={{ fontSize: "1.2rem", opacity: 0.95, margin: 0 }}>
                    Vous profitez de toutes les fonctionnalités premium
                  </p>
                </Card>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1.5rem",
                    marginBottom: "2rem",
                  }}
                >
                  <Card style={{ padding: "1.5rem" }} className="hover-glow">
                    <h4
                      style={{
                        margin: "0 0 0.5rem 0",
                        color: "var(--primary)",
                        fontSize: "0.9rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Plan actuel
                    </h4>
                    <p
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        margin: 0,
                        color: "var(--accent)",
                      }}
                    >
                      {subscription.plan_nom || "Pro"}
                    </p>
                  </Card>

                  <Card style={{ padding: "1.5rem" }} className="hover-glow">
                    <h4
                      style={{
                        margin: "0 0 0.5rem 0",
                        color: "var(--primary)",
                        fontSize: "0.9rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Statut
                    </h4>
                    <span
                      style={{
                        background:
                          subscription.statut === "actif"
                            ? "var(--green)"
                            : "var(--orange)",
                        color: "white",
                        padding: "0.4rem 0.8rem",
                        borderRadius: "8px",
                        fontWeight: "700",
                        fontSize: "1rem",
                        display: "inline-block",
                      }}
                    >
                      {subscription.statut === "actif"
                        ? "✅ Actif"
                        : "⏳ En attente"}
                    </span>
                  </Card>

                  <Card style={{ padding: "1.5rem" }} className="hover-glow">
                    <h4
                      style={{
                        margin: "0 0 0.5rem 0",
                        color: "var(--primary)",
                        fontSize: "0.9rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Prix mensuel
                    </h4>
                    <p
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        margin: 0,
                        color: "var(--accent)",
                      }}
                    >
                      {subscription.plan_prix}€
                    </p>
                  </Card>

                  {subscription.date_fin && (
                    <Card style={{ padding: "1.5rem" }} className="hover-glow">
                      <h4
                        style={{
                          margin: "0 0 0.5rem 0",
                          color: "var(--primary)",
                          fontSize: "0.9rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Renouvellement
                      </h4>
                      <p style={{ fontSize: "1rem", margin: 0, fontWeight: "600" }}>
                        {new Date(subscription.date_fin).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </Card>
                  )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "1.5rem",
                    marginBottom: "2rem",
                  }}
                >
                  <Card
                    style={{ padding: "2rem", background: "var(--background)" }}
                  >
                    <h3
                      style={{
                        margin: "0 0 1rem 0",
                        color: "var(--primary)",
                        fontSize: "1.3rem",
                      }}
                    >
                      🛠️ Gestion
                    </h3>
                    <p
                      style={{
                        marginBottom: "1.5rem",
                        opacity: 0.8,
                        fontSize: "0.95rem",
                      }}
                    >
                      Gérez vos moyens de paiement et vos factures
                    </p>
                    <Button
                      onClick={handleManageBilling}
                      disabled={actionLoading}
                      style={{
                        padding: "0.75rem 1.5rem",
                        opacity: actionLoading ? 0.6 : 1,
                        cursor: actionLoading ? "not-allowed" : "pointer",
                        width: "100%",
                      }}
                      className="hover-bounce"
                    >
                      {actionLoading
                        ? "⏳ Chargement..."
                        : "💼 Portail facturation"}
                    </Button>
                  </Card>

                  <Card
                    style={{ padding: "2rem", background: "var(--background)" }}
                  >
                    <h3
                      style={{
                        margin: "0 0 1rem 0",
                        color: "var(--primary)",
                        fontSize: "1.3rem",
                      }}
                    >
                      📊 Utilisation
                    </h3>
                    <div style={{ fontSize: "0.95rem", lineHeight: "1.8" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <span>Utilisateurs :</span>
                        <strong>{subscription.nombre_licences || 1} / 15</strong>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <span>Stockage :</span>
                        <strong>2.4 Go / 10 Go</strong>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>Tickets ce mois :</span>
                        <strong>84 / illimité</strong>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card
                  style={{
                    padding: "2rem",
                    background: "var(--background)",
                    borderLeft: "4px solid var(--red)",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 1rem 0",
                      color: "var(--red)",
                      fontSize: "1.2rem",
                    }}
                  >
                    ⚠️ Zone dangereuse
                  </h3>
                  <p style={{ marginBottom: "1.5rem", opacity: 0.8 }}>
                    Annuler votre abonnement mettra fin à votre accès aux
                    fonctionnalités PRO à la fin de la période en cours.
                  </p>
                  <Button
                    onClick={handleCancelSubscription}
                    style={{
                      background: "transparent",
                      color: "var(--red)",
                      border: "2px solid var(--red)",
                      padding: "0.75rem 1.5rem",
                    }}
                  >
                    🚫 Annuler mon abonnement
                  </Button>
                </Card>
              </>
            )}
          </div>
        )}

        {/* TAB: Changer de plan */}
        {activeTab === "plans" && (
          <div className="fade-in">
            <Card
              style={{
                padding: "2.5rem",
                marginBottom: "2rem",
                background: "linear-gradient(135deg, rgba(0, 122, 255, 0.05) 0%, rgba(138, 43, 226, 0.05) 100%)",
                borderRadius: "16px",
              }}
            >
              <h2
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "700",
                  margin: "0 0 0.5rem 0",
                  color: "var(--primary)",
                }}
              >
                💎 Choisissez le plan adapté à vos besoins
              </h2>
              <p style={{ fontSize: "1rem", opacity: 0.7, margin: 0 }}>
                Changez de plan à tout moment. Les modifications prennent effet
                immédiatement.
              </p>
            </Card>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "2rem",
              }}
            >
              {plans.map((plan) => {
                const isCurrentPlan = currentPlanId === plan.id;
                const isPremium = plan.id === "premium";

                return (
                  <Card
                    key={plan.id}
                    style={{
                      padding: "2rem",
                      border: isCurrentPlan
                        ? "3px solid var(--accent)"
                        : plan.popular
                          ? "2px solid var(--primary)"
                          : "1px solid rgba(0,0,0,0.1)",
                      position: "relative",
                      background: isCurrentPlan
                        ? "linear-gradient(135deg, rgba(0, 122, 255, 0.05) 0%, rgba(138, 43, 226, 0.05) 100%)"
                        : "white",
                    }}
                    className="hover-glow slide-up"
                  >
                    {isCurrentPlan && (
                      <div
                        style={{
                          position: "absolute",
                          top: "-15px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          background: "var(--accent)",
                          color: "white",
                          padding: "0.35rem 1.2rem",
                          borderRadius: "20px",
                          fontSize: "0.85rem",
                          fontWeight: "700",
                        }}
                      >
                        ✓ PLAN ACTUEL
                      </div>
                    )}

                    {!isCurrentPlan && plan.popular && (
                      <div
                        style={{
                          position: "absolute",
                          top: "-15px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          background: "var(--primary)",
                          color: "white",
                          padding: "0.35rem 1.2rem",
                          borderRadius: "20px",
                          fontSize: "0.85rem",
                          fontWeight: "700",
                        }}
                        className="pulse"
                      >
                        ⭐ LE PLUS POPULAIRE
                      </div>
                    )}

                    <h3
                      style={{
                        fontSize: "1.8rem",
                        margin: "0 0 0.5rem 0",
                        color: "var(--primary)",
                        fontWeight: "700",
                      }}
                    >
                      {plan.nom}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.95rem",
                        opacity: 0.7,
                        margin: "0 0 1.5rem 0",
                      }}
                    >
                      {plan.description}
                    </p>

                    <div style={{ margin: "1.5rem 0" }}>
                      <span
                        style={{
                          fontSize: "3rem",
                          fontWeight: "700",
                          color: "var(--accent)",
                        }}
                      >
                        {plan.prix}€
                      </span>
                      <span style={{ fontSize: "1rem", opacity: 0.6 }}>
                        {" "}
                        / mois
                      </span>
                    </div>

                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        margin: "0 0 2rem 0",
                        fontSize: "0.95rem",
                        lineHeight: "2",
                      }}
                    >
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <span
                            style={{
                              color: "var(--accent)",
                              fontSize: "1.2rem",
                              flexShrink: 0,
                            }}
                          >
                            ✓
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleChangePlan(plan.id)}
                      disabled={isCurrentPlan || actionLoading}
                      style={{
                        width: "100%",
                        padding: "1rem",
                        fontSize: "1.1rem",
                        fontWeight: "700",
                        background: isCurrentPlan
                          ? "var(--gray)"
                          : isPremium
                            ? "var(--primary)"
                            : "var(--accent)",
                        opacity: isCurrentPlan || actionLoading ? 0.6 : 1,
                        cursor:
                          isCurrentPlan || actionLoading
                            ? "not-allowed"
                            : "pointer",
                      }}
                      className={!isCurrentPlan ? "hover-bounce" : ""}
                    >
                      {isCurrentPlan
                        ? "✓ Plan actuel"
                        : actionLoading
                          ? "⏳ Changement..."
                          : `Changer vers ${plan.nom}`}
                    </Button>
                  </Card>
                );
              })}
            </div>

            <Card
              style={{
                marginTop: "2rem",
                padding: "2rem",
                textAlign: "center",
                background: "var(--background)",
              }}
            >
              <p style={{ fontSize: "1rem", opacity: 0.8, margin: "0 0 1rem 0" }}>
                💡 Besoin d&apos;aide pour choisir ? Notre équipe est là pour vous
                conseiller.
              </p>
              <Button
                onClick={() => (window.location.href = "mailto:support@jetc-immo.fr")}
                style={{
                  background: "transparent",
                  border: "2px solid var(--primary)",
                  color: "var(--primary)",
                  padding: "0.75rem 2rem",
                }}
              >
                📧 Contactez-nous
              </Button>
            </Card>
          </div>
        )}

        {/* TAB: Factures */}
        {activeTab === "invoices" && (
          <div className="fade-in">
            <Card
              style={{
                padding: "2.5rem",
                marginBottom: "2rem",
                background: "linear-gradient(135deg, rgba(0, 122, 255, 0.05) 0%, rgba(138, 43, 226, 0.05) 100%)",
                borderRadius: "16px",
              }}
            >
              <h2
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "700",
                  margin: "0 0 0.5rem 0",
                  color: "var(--primary)",
                }}
              >
                🧾 Historique de facturation
              </h2>
              <p style={{ fontSize: "1rem", opacity: 0.7, margin: 0 }}>
                Retrouvez toutes vos factures et téléchargez-les en PDF
              </p>
            </Card>

            {!hasPro ? (
              <Card style={{ padding: "3rem", textAlign: "center" }}>
                <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📄</div>
                <h3
                  style={{
                    fontSize: "1.5rem",
                    margin: "0 0 1rem 0",
                    color: "var(--primary)",
                  }}
                >
                  Aucune facture disponible
                </h3>
                <p style={{ fontSize: "1rem", opacity: 0.7, marginBottom: "2rem" }}>
                  Vous êtes en mode DEMO. Passez en PRO pour accéder à vos
                  factures.
                </p>
                <Button
                  onClick={handleUpgradeToPro}
                  style={{
                    padding: "1rem 2rem",
                    background: "var(--accent)",
                    fontWeight: "700",
                  }}
                  className="hover-bounce"
                >
                  ⭐ Passer en PRO
                </Button>
              </Card>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {mockInvoices.map((invoice) => (
                  <Card
                    key={invoice.id}
                    style={{
                      padding: "1.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "1rem",
                    }}
                    className="hover-glow"
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                      <div
                        style={{
                          fontSize: "2rem",
                          background: "var(--background)",
                          width: "60px",
                          height: "60px",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        📄
                      </div>
                      <div>
                        <h4
                          style={{
                            margin: "0 0 0.25rem 0",
                            fontSize: "1.1rem",
                            fontWeight: "700",
                          }}
                        >
                          {invoice.numero}
                        </h4>
                        <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.7 }}>
                          {new Date(invoice.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "2rem",
                      }}
                    >
                      <div style={{ textAlign: "right" }}>
                        <p
                          style={{
                            margin: "0 0 0.25rem 0",
                            fontSize: "1.3rem",
                            fontWeight: "700",
                            color: "var(--accent)",
                          }}
                        >
                          {invoice.montant}€
                        </p>
                        <span
                          style={{
                            background: "var(--green)",
                            color: "white",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "6px",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                          }}
                        >
                          ✓ Payée
                        </span>
                      </div>

                      <Button
                        onClick={() => alert(`Téléchargement de ${invoice.numero}...`)}
                        style={{
                          padding: "0.75rem 1.5rem",
                          background: "var(--primary)",
                          fontSize: "0.95rem",
                        }}
                        className="hover-bounce"
                      >
                        ⬇️ Télécharger
                      </Button>
                    </div>
                  </Card>
                ))}

                <Card
                  style={{
                    marginTop: "1rem",
                    padding: "1.5rem",
                    textAlign: "center",
                    background: "var(--background)",
                  }}
                >
                  <p style={{ margin: 0, opacity: 0.7 }}>
                    💡 Pour plus d&apos;options, accédez au{" "}
                    <button
                      onClick={handleManageBilling}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--accent)",
                        textDecoration: "underline",
                        cursor: "pointer",
                        padding: 0,
                        fontSize: "inherit",
                      }}
                    >
                      portail de facturation
                    </button>
                  </p>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Modal annulation */}
        {showCancelModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "1rem",
            }}
            onClick={() => setShowCancelModal(false)}
          >
            <Card
              style={{
                maxWidth: "500px",
                padding: "2.5rem",
                textAlign: "center",
              }}
              onClick={(e) => e.stopPropagation()}
              className="slide-up"
            >
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⚠️</div>
              <h2
                style={{
                  fontSize: "1.8rem",
                  margin: "0 0 1rem 0",
                  color: "var(--red)",
                }}
              >
                Confirmer l&apos;annulation
              </h2>
              <p style={{ fontSize: "1rem", lineHeight: "1.6", marginBottom: "2rem" }}>
                Êtes-vous sûr de vouloir annuler votre abonnement ? Vous perdrez
                l&apos;accès aux fonctionnalités PRO à la fin de votre période de
                facturation actuelle.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  onClick={() => setShowCancelModal(false)}
                  style={{
                    background: "var(--gray)",
                    color: "var(--text)",
                    padding: "0.75rem 2rem",
                  }}
                >
                  ← Retour
                </Button>
                <Button
                  onClick={confirmCancelSubscription}
                  disabled={actionLoading}
                  style={{
                    background: "var(--red)",
                    padding: "0.75rem 2rem",
                    opacity: actionLoading ? 0.6 : 1,
                  }}
                >
                  {actionLoading ? "⏳ Annulation..." : "Confirmer l'annulation"}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
