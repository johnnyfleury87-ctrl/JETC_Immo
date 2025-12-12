import { useRouter } from "next/router";
import Link from "next/link";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import { useDemoMode } from "../context/DemoModeContext";

export default function PricingPage() {
  const router = useRouter();
  const { enableDemoMode } = useDemoMode();

  const handleStartDemo = () => {
    enableDemoMode();
    localStorage.setItem("jetc_demo_mode", "true");
    router.push("/register");
  };

  const plans = [
    {
      id: "essentiel",
      name: "Essentiel",
      icon: "🌱",
      price: 49,
      period: "/mois",
      description: "Pour les petites régies qui débutent",
      features: [
        { text: "Jusqu&apos;à 50 logements", included: true },
        { text: "Gestion des tickets", included: true },
        { text: "5 entreprises partenaires max", included: true },
        { text: "Dashboard basique", included: true },
        { text: "Support par email (48h)", included: true },
        { text: "1 utilisateur", included: true },
        { text: "Analytics avancés", included: false },
        { text: "API personnalisée", included: false },
      ],
      color: "#10b981",
      badge: null,
      cta: "Commencer",
    },
    {
      id: "pro",
      name: "Pro",
      icon: "⚡",
      price: 99,
      period: "/mois",
      description: "Pour les régies en pleine croissance",
      features: [
        { text: "Jusqu&apos;à 200 logements", included: true },
        { text: "Gestion complète des tickets", included: true },
        { text: "Entreprises partenaires illimitées", included: true },
        { text: "Dashboard analytique avancé", included: true },
        { text: "Support prioritaire (24h)", included: true },
        { text: "Jusqu&apos;à 5 utilisateurs", included: true },
        { text: "Exports et rapports personnalisés", included: true },
        { text: "Notifications SMS", included: true },
      ],
      color: "#4f46e5",
      badge: "Le plus populaire",
      cta: "Choisir Pro",
    },
    {
      id: "premium",
      name: "Premium",
      icon: "🚀",
      price: 199,
      period: "/mois",
      description: "Pour les grandes régies exigeantes",
      features: [
        { text: "Logements illimités", included: true },
        { text: "Gestion multi-sites", included: true },
        { text: "Intégrations personnalisées", included: true },
        { text: "Dashboard sur-mesure", included: true },
        { text: "Manager dédié + support 7j/7", included: true },
        { text: "Utilisateurs illimités", included: true },
        { text: "API complète", included: true },
        { text: "Formation incluse", included: true },
      ],
      color: "#f59e0b",
      badge: null,
      cta: "Contactez-nous",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        color: "var(--text)",
      }}
    >
      {/* Header Navigation */}
      <header
        className="fade-in"
        style={{
          padding: "1.5rem 2rem",
          background: "var(--primary)",
          color: "white",
          boxShadow: "var(--shadow)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <h1
          style={{ margin: 0, fontSize: "1.5rem", cursor: "pointer" }}
          onClick={() => router.push("/")}
        >
          🏢 JETC IMMO
        </h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Button
            onClick={() => router.push("/")}
            style={{ background: "transparent", border: "2px solid white" }}
            className="hover-bounce"
          >
            ← Accueil
          </Button>
          <Button
            onClick={() => {
              const isDemo = typeof window !== "undefined" && localStorage.getItem("jetc_demo_mode") === "true";
              if (!isDemo) {
                router.push("/login");
              }
            }}
            style={{ background: "white", color: "var(--primary)" }}
            className="hover-bounce"
          >
            🔐 Connexion
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          textAlign: "center",
          padding: "5rem 2rem 3rem",
          background:
            "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
          color: "white",
        }}
      >
        <h1
          className="slide-up"
          style={{
            fontSize: "3rem",
            margin: "0 0 1rem 0",
            fontWeight: "800",
          }}
        >
          Des tarifs simples et transparents
        </h1>
        <p
          className="slide-up stagger-1"
          style={{
            fontSize: "1.3rem",
            opacity: 0.95,
            maxWidth: "700px",
            margin: "0 auto 2rem auto",
            lineHeight: "1.6",
          }}
        >
          Choisissez le plan qui correspond à vos besoins. Sans engagement,
          résiliable à tout moment.
        </p>

        {/* Badge entreprises gratuites */}
        <div
          className="slide-up stagger-2"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(10px)",
            color: "white",
            padding: "1rem 2rem",
            borderRadius: "50px",
            fontSize: "1.1rem",
            fontWeight: "700",
            border: "2px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          <span style={{ fontSize: "1.8rem" }}>🎉</span>
          <span>Entreprises : GRATUIT pour la gestion des tickets</span>
        </div>
      </section>

      {/* Plans Pricing Cards */}
      <section
        style={{
          padding: "5rem 2rem",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2rem",
            alignItems: "stretch",
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
                  : "1px solid rgba(0, 0, 0, 0.1)",
                transform: plan.badge ? "scale(1.05)" : "scale(1)",
                boxShadow: plan.badge
                  ? `0 12px 40px ${plan.color}30`
                  : "0 4px 12px rgba(0, 0, 0, 0.08)",
              }}
            >
              {/* Badge POPULAIRE */}
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
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
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
                  minHeight: "40px",
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
                  minHeight: "300px",
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
                onClick={() => router.push("/register")}
                style={{
                  width: "100%",
                  padding: "1rem",
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  background: plan.badge ? plan.color : "transparent",
                  color: plan.badge ? "white" : plan.color,
                  border: plan.badge ? "none" : `2px solid ${plan.color}`,
                }}
                className="hover-bounce"
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>

        {/* Note commission */}
        <div
          className="slide-up stagger-4"
          style={{
            textAlign: "center",
            marginTop: "3rem",
            padding: "1.5rem",
            background: "rgba(79, 70, 229, 0.05)",
            borderRadius: "12px",
            border: "1px solid rgba(79, 70, 229, 0.1)",
          }}
        >
          <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: "1.6" }}>
            💡 <strong>Commission de 2%</strong> sur les factures d&apos;intervention
            (prélevée sur la régie). Les entreprises de maintenance bénéficient
            d&apos;un accès gratuit pour la réception et gestion des tickets.
          </p>
        </div>
      </section>

      {/* CTA Demo */}
      <section
        style={{
          padding: "4rem 2rem",
          background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <h2
            className="slide-up"
            style={{
              fontSize: "2.5rem",
              marginBottom: "1rem",
              color: "var(--primary)",
              fontWeight: "700",
            }}
          >
            Pas encore sûr ? Essayez notre mode DEMO
          </h2>
          <p
            className="slide-up stagger-1"
            style={{
              fontSize: "1.2rem",
              opacity: 0.8,
              marginBottom: "2rem",
              lineHeight: "1.6",
            }}
          >
            Testez toutes les fonctionnalités de JETC IMMO gratuitement, sans
            créer de compte. Naviguez entre tous les rôles et explorez la
            plateforme en profondeur.
          </p>
          <Button
            onClick={handleStartDemo}
            style={{
              fontSize: "1.2rem",
              padding: "1.2rem 3rem",
              background: "var(--primary)",
              fontWeight: "700",
            }}
            className="hover-bounce"
          >
            🚀 Lancer le mode DEMO
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "3rem 2rem",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          color: "white",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h3
            style={{
              fontSize: "1.5rem",
              marginBottom: "1rem",
              fontWeight: "700",
            }}
          >
            🏢 JETC IMMO
          </h3>
          <p style={{ margin: "0 0 2rem 0", opacity: 0.8, fontSize: "0.95rem" }}>
            La plateforme collaborative pour la gestion immobilière
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "2rem",
              marginBottom: "2rem",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/"
              style={{
                color: "white",
                textDecoration: "none",
                opacity: 0.9,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.opacity = "1")}
              onMouseLeave={(e) => (e.target.style.opacity = "0.9")}
            >
              🏠 Accueil
            </Link>
            <Link
              href="/pricing"
              style={{
                color: "white",
                textDecoration: "none",
                opacity: 0.9,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.opacity = "1")}
              onMouseLeave={(e) => (e.target.style.opacity = "0.9")}
            >
              💰 Tarifs
            </Link>
            <Link
              href="/login"
              style={{
                color: "white",
                textDecoration: "none",
                opacity: 0.9,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.opacity = "1")}
              onMouseLeave={(e) => (e.target.style.opacity = "0.9")}
            >
              🔐 Connexion
            </Link>
          </div>

          <div
            style={{
              paddingTop: "2rem",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "0.9rem",
              opacity: 0.7,
            }}
          >
            <p style={{ margin: 0 }}>
              © 2025 JETC IMMO - Tous droits réservés
            </p>
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.85rem" }}>
              ⚡ Propulsé par Perritie
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
