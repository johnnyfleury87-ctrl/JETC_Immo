import { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Comment fonctionne le mode DEMO ?",
      answer:
        "Le mode DEMO vous permet de tester toutes les fonctionnalités de JETC IMMO sans créer de compte. Vous pouvez naviguer entre les différents rôles (régie, entreprise, technicien, locataire) et explorer l'interface complète. Aucune donnée réelle n'est utilisée, tout est simulé pour votre confort.",
      icon: "🎮",
    },
    {
      question: "Quel est le modèle économique pour les entreprises ?",
      answer:
        "Les entreprises de maintenance bénéficient d'un accès GRATUIT pour la gestion des tickets reçus des régies. Si elles souhaitent utiliser des modules d'organisation interne avancés (planning, gestion RH, statistiques détaillées), des options payantes sont disponibles. Aucun engagement requis.",
      icon: "💰",
    },
    {
      question: "Comment sont facturées les interventions ?",
      answer:
        "Lorsqu'une intervention est terminée, l'entreprise édite sa facture directement dans JETC IMMO. Une commission de 2% est prélevée sur le montant de la facture et facturée à la régie immobilière. Le paiement est géré de manière sécurisée via notre partenaire Stripe.",
      icon: "🧾",
    },
    {
      question: "Puis-je résilier mon abonnement à tout moment ?",
      answer:
        "Oui, absolument ! Tous nos abonnements sont sans engagement. Vous pouvez résilier à tout moment depuis votre espace compte. Si vous résiliez en cours de mois, vous conservez l'accès jusqu'à la fin de votre période de facturation. Aucun frais caché.",
      icon: "🔓",
    },
    {
      question: "Quels sont les moyens de support disponibles ?",
      answer:
        "Nous offrons plusieurs niveaux de support selon votre plan : support par email pour le plan Essentiel (réponse sous 48h), support prioritaire pour le plan Pro (réponse sous 24h), et un manager dédié avec support téléphonique pour le plan Premium. Une base de connaissances complète est accessible à tous.",
      icon: "💬",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      style={{
        padding: "5rem 2rem",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
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
            Questions fréquentes
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
            Tout ce que vous devez savoir sur JETC IMMO
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`slide-up stagger-${index + 1}`}
              style={{
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
                border: openIndex === index
                  ? "2px solid var(--primary)"
                  : "2px solid transparent",
                transition: "all 0.3s ease",
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                style={{
                  width: "100%",
                  padding: "1.5rem",
                  background: "transparent",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  color: "var(--text)",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(79, 70, 229, 0.03)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <span style={{ fontSize: "2rem", flexShrink: 0 }}>
                  {faq.icon}
                </span>
                <span style={{ flex: 1 }}>{faq.question}</span>
                <span
                  style={{
                    fontSize: "1.5rem",
                    color: "var(--primary)",
                    transform: openIndex === index ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                  }}
                >
                  ▼
                </span>
              </button>

              {/* Réponse avec animation */}
              <div
                style={{
                  maxHeight: openIndex === index ? "500px" : "0",
                  overflow: "hidden",
                  transition: "max-height 0.3s ease",
                }}
              >
                <div
                  style={{
                    padding: "0 1.5rem 1.5rem 1.5rem",
                    paddingLeft: "4.5rem",
                    fontSize: "1rem",
                    lineHeight: "1.7",
                    opacity: 0.85,
                  }}
                >
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA final */}
        <div
          className="slide-up stagger-4"
          style={{
            textAlign: "center",
            marginTop: "4rem",
            padding: "2rem",
            background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
            borderRadius: "16px",
            color: "white",
            boxShadow: "0 8px 32px rgba(79, 70, 229, 0.2)",
          }}
        >
          <h3 style={{ fontSize: "1.8rem", marginBottom: "0.5rem", fontWeight: "700" }}>
            Une autre question ?
          </h3>
          <p style={{ fontSize: "1.1rem", opacity: 0.95, marginBottom: "1.5rem" }}>
            Notre équipe est là pour vous répondre
          </p>
          <a
            href="mailto:contact@jetcimmo.fr"
            style={{
              display: "inline-block",
              padding: "1rem 2rem",
              background: "white",
              color: "var(--primary)",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "1.1rem",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
            className="hover-bounce"
          >
            📧 Contactez-nous
          </a>
        </div>
      </div>
    </section>
  );
}
