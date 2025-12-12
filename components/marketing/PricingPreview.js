import { useRouter } from "next/router";
import Button from "../UI/Button";
import Card from "../UI/Card";

export default function PricingPreview() {
  const router = useRouter();

  const plans = [
    {
      name: "Essentiel",
      icon: "🌱",
      price: "49€",
      period: "/mois",
      description: "Pour les petites régies débutantes",
      features: [
        "Jusqu'à 50 logements",
        "Gestion des tickets",
        "5 entreprises partenaires",
        "Support email",
      ],
      color: "#10b981",
      popular: false,
    },
    {
      name: "Pro",
      icon: "⚡",
      price: "99€",
      period: "/mois",
      description: "Pour les régies en croissance",
      features: [
        "Jusqu'à 200 logements",
        "Gestion complète",
        "Entreprises illimitées",
        "Analytics avancés",
        "Support prioritaire",
      ],
      color: "#4f46e5",
      popular: true,
    },
    {
      name: "Premium",
      icon: "🚀",
      price: "199€",
      period: "/mois",
      description: "Pour les grandes régies",
      features: [
        "Logements illimités",
        "Multi-utilisateurs",
        "API personnalisée",
        "Manager dédié",
        "Formation incluse",
      ],
      color: "#f59e0b",
      popular: false,
    },
  ];

  return (
    <section
      style={{
        padding: "5rem 2rem",
        background: "var(--background)",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h2
            className="slide-up"
            style={{
              fontSize: "2.5rem",
              marginBottom: "1rem",
              color: "var(--primary)",
              fontWeight: "700",
            }}
          >
            Des tarifs simples et transparents
          </h2>
          <p
            className="slide-up stagger-1"
            style={{
              fontSize: "1.2rem",
              opacity: 0.8,
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
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
              padding: "0.8rem 1.5rem",
              borderRadius: "50px",
              fontSize: "1rem",
              fontWeight: "700",
              boxShadow: "0 4px 20px rgba(16, 185, 129, 0.3)",
              marginBottom: "3rem",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>🎉</span>
            <span>Entreprises : GRATUIT pour la gestion des tickets</span>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
            alignItems: "stretch",
          }}
        >
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`hover-glow slide-up stagger-${index + 1}`}
              style={{
                padding: "2.5rem",
                textAlign: "center",
                position: "relative",
                border: plan.popular
                  ? `3px solid ${plan.color}`
                  : "1px solid rgba(0, 0, 0, 0.1)",
                transform: plan.popular ? "scale(1.05)" : "scale(1)",
                boxShadow: plan.popular
                  ? `0 12px 40px ${plan.color}30`
                  : "0 4px 12px rgba(0, 0, 0, 0.08)",
              }}
            >
              {/* Badge "POPULAIRE" */}
              {plan.popular && (
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
                  ⭐ Le plus populaire
                </div>
              )}

              <div
                className="hover-rotate"
                style={{
                  fontSize: "4rem",
                  marginBottom: "1rem",
                  marginTop: plan.popular ? "1rem" : "0",
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
                  {plan.price}
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
                    }}
                  >
                    <span
                      style={{
                        color: plan.color,
                        fontWeight: "700",
                        fontSize: "1.2rem",
                      }}
                    >
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => router.push("/pricing")}
                style={{
                  width: "100%",
                  padding: "1rem",
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  background: plan.popular
                    ? plan.color
                    : "transparent",
                  color: plan.popular ? "white" : plan.color,
                  border: plan.popular ? "none" : `2px solid ${plan.color}`,
                }}
                className="hover-bounce"
              >
                {plan.popular ? "🎯 Choisir Pro" : "En savoir plus"}
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
            💡 <strong>Commission de 2%</strong> sur les factures d'intervention
            (prélevée sur la régie). Modules optionnels disponibles pour les
            entreprises souhaitant des outils d'organisation internes.
          </p>
        </div>
      </div>
    </section>
  );
}
