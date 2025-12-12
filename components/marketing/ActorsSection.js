import Card from "../UI/Card";

export default function ActorsSection() {
  const actors = [
    {
      icon: "🏢",
      title: "Régies Immobilières",
      description:
        "Gérez vos immeubles, logements et locataires. Diffusez les tickets aux entreprises partenaires. Suivez les interventions en temps réel.",
      features: [
        "Gestion complète du parc immobilier",
        "Diffusion automatique des tickets",
        "Suivi des interventions en temps réel",
        "Validation des factures",
      ],
      badge: null,
      delay: "stagger-1",
    },
    {
      icon: "🏗️",
      title: "Entreprises",
      description:
        "Recevez les tickets des régies, assignez vos techniciens et gérez vos missions. Éditez et envoyez vos factures directement.",
      features: [
        "Réception des tickets en temps réel",
        "Gestion des techniciens et planning",
        "Suivi des missions",
        "Facturation intégrée",
      ],
      badge: "GRATUIT pour tickets",
      badgeColor: "#10b981",
      delay: "stagger-2",
    },
    {
      icon: "👷",
      title: "Techniciens",
      description:
        "Consultez vos missions du jour, prenez des photos sur site, ajoutez des commentaires et marquez vos interventions comme terminées.",
      features: [
        "Vue mobile optimisée",
        "Photos et commentaires",
        "Signature électronique",
        "Historique des interventions",
      ],
      badge: null,
      delay: "stagger-3",
    },
    {
      icon: "🏠",
      title: "Locataires",
      description:
        "Déclarez vos problèmes facilement, suivez l'avancement en temps réel et recevez des notifications à chaque étape.",
      features: [
        "Déclaration simplifiée",
        "Suivi en temps réel",
        "Notifications automatiques",
        "Historique des demandes",
      ],
      badge: null,
      delay: "stagger-4",
    },
  ];

  return (
    <section
      style={{
        padding: "5rem 2rem",
        maxWidth: "1400px",
        margin: "0 auto",
        background: "var(--background)",
      }}
    >
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
          Une solution pour tous les acteurs
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
          JETC IMMO connecte l'ensemble de l'écosystème immobilier sur une plateforme
          unique et intuitive.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2rem",
        }}
      >
        {actors.map((actor, index) => (
          <Card
            key={index}
            className={`hover-glow slide-up ${actor.delay}`}
            style={{
              textAlign: "center",
              padding: "2.5rem 2rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Badge GRATUIT si présent */}
            {actor.badge && (
              <div
                style={{
                  position: "absolute",
                  top: "15px",
                  right: "15px",
                  background: actor.badgeColor || "var(--primary)",
                  color: "white",
                  padding: "0.4rem 0.8rem",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
                className="pulse"
              >
                {actor.badge}
              </div>
            )}

            <div
              className="hover-rotate"
              style={{
                fontSize: "4.5rem",
                marginBottom: "1.5rem",
                display: "inline-block",
              }}
            >
              {actor.icon}
            </div>

            <h3
              style={{
                fontSize: "1.6rem",
                margin: "0 0 1rem 0",
                color: "var(--primary)",
                fontWeight: "700",
              }}
            >
              {actor.title}
            </h3>

            <p
              style={{
                opacity: 0.8,
                lineHeight: "1.6",
                marginBottom: "1.5rem",
                fontSize: "1rem",
              }}
            >
              {actor.description}
            </p>

            <ul
              style={{
                textAlign: "left",
                listStyle: "none",
                padding: 0,
                margin: 0,
              }}
            >
              {actor.features.map((feature, idx) => (
                <li
                  key={idx}
                  style={{
                    padding: "0.6rem 0",
                    borderBottom:
                      idx < actor.features.length - 1
                        ? "1px solid rgba(0, 0, 0, 0.05)"
                        : "none",
                    fontSize: "0.95rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span style={{ color: "var(--primary)", fontWeight: "700" }}>
                    ✓
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  );
}
