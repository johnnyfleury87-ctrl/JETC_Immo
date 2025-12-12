export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Inscription & Configuration",
      description:
        "Créez votre compte en quelques clics. Configurez votre profil et invitez vos collaborateurs selon votre rôle (régie, entreprise, technicien).",
      icon: "🚀",
      color: "#4f46e5",
    },
    {
      number: "2",
      title: "Gestion des Tickets & Missions",
      description:
        "Les régies créent des tickets, les entreprises les reçoivent et assignent leurs techniciens. Suivi en temps réel à chaque étape.",
      icon: "⚡",
      color: "#0ea5e9",
    },
    {
      number: "3",
      title: "Intervention & Facturation",
      description:
        "Les techniciens interviennent sur site avec photos et signatures. Les entreprises facturent directement via la plateforme.",
      icon: "✅",
      color: "#10b981",
    },
  ];

  return (
    <section
      style={{
        padding: "5rem 2rem",
        background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
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
            Comment ça marche ?
          </h2>
          <p
            className="slide-up stagger-1"
            style={{
              fontSize: "1.2rem",
              opacity: 0.8,
              maxWidth: "700px",
              margin: "0 auto",
              lineHeight: "1.6",
            }}
          >
            Trois étapes simples pour révolutionner votre gestion immobilière
          </p>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: "3rem",
          }}
        >
          {steps.map((step, index) => (
            <div
              key={index}
              className={`slide-up stagger-${index + 1}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2rem",
                position: "relative",
                flexDirection: index % 2 === 0 ? "row" : "row-reverse",
              }}
            >
              {/* Numéro de l'étape */}
              <div
                className="hover-scale"
                style={{
                  minWidth: "120px",
                  minHeight: "120px",
                  borderRadius: "50%",
                  background: step.color,
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2.5rem",
                  fontWeight: "800",
                  boxShadow: `0 8px 32px ${step.color}40`,
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <div style={{ fontSize: "3rem" }}>{step.icon}</div>
                <div style={{ fontSize: "1.2rem", marginTop: "0.3rem" }}>
                  {step.number}
                </div>
              </div>

              {/* Contenu de l'étape */}
              <div
                className="hover-glow"
                style={{
                  flex: 1,
                  background: "white",
                  padding: "2rem",
                  borderRadius: "16px",
                  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
                  border: `2px solid ${step.color}20`,
                }}
              >
                <h3
                  style={{
                    fontSize: "1.8rem",
                    marginBottom: "1rem",
                    color: step.color,
                    fontWeight: "700",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: "1.1rem",
                    lineHeight: "1.7",
                    opacity: 0.85,
                    margin: 0,
                  }}
                >
                  {step.description}
                </p>
              </div>

              {/* Ligne de connexion entre les étapes (sauf dernière) */}
              {index < steps.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    left: "60px",
                    top: "120px",
                    width: "2px",
                    height: "calc(100% + 3rem)",
                    background: `linear-gradient(180deg, ${step.color} 0%, ${
                      steps[index + 1].color
                    } 100%)`,
                    opacity: 0.3,
                    zIndex: 1,
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* CTA vers le mode DEMO */}
        <div
          style={{
            textAlign: "center",
            marginTop: "4rem",
          }}
        >
          <p
            style={{
              fontSize: "1.1rem",
              marginBottom: "1.5rem",
              opacity: 0.8,
            }}
          >
            Envie de tester ? Essayez notre mode démo sans inscription !
          </p>
        </div>
      </div>
    </section>
  );
}
