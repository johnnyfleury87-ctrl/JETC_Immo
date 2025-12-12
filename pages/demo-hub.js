import { useRouter } from "next/router";
import { useDemoMode } from "../context/DemoModeContext";
import { enterDemoRole } from "../lib/session";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";

export default function DemoHub() {
  const router = useRouter();
  const { demoProfile, changeDemoRole } = useDemoMode();

  // Plus de redirection automatique - le hub est accessible directement
  // Si l'utilisateur veut activer le MODE DEMO, il clique sur un rôle

  const roles = [
    {
      id: "regie",
      icon: "🏢",
      title: "Régie immobilière",
      description: "Gérez vos biens, locataires et diffusez des tickets aux entreprises partenaires",
      path: "/regie/dashboard",
      features: [
        "Gestion des immeubles et logements",
        "Création et suivi des tickets",
        "Analytics et rapports",
        "Gestion multi-utilisateurs",
      ],
      color: "var(--primary)",
    },
    {
      id: "entreprise",
      icon: "🏗️",
      title: "Entreprise de maintenance",
      description: "Recevez et gérez les interventions, coordonnez vos techniciens",
      path: "/entreprise/dashboard",
      features: [
        "Réception tickets gratuite",
        "Gestion d'équipe",
        "Facturation intégrée",
        "Suivi interventions",
      ],
      color: "var(--orange)",
    },
    {
      id: "technicien",
      icon: "🔧",
      title: "Technicien",
      description: "Consultez vos missions, mettez à jour les statuts et signez les interventions",
      path: "/technicien/dashboard",
      features: [
        "Liste missions assignées",
        "Upload photos",
        "Signature électronique",
        "Navigation optimisée",
      ],
      color: "var(--green)",
    },
    {
      id: "locataire",
      icon: "👤",
      title: "Locataire",
      description: "Déclarez vos problèmes et suivez l'avancement en temps réel",
      path: "/locataire/dashboard",
      features: [
        "Création tickets simplifiée",
        "Suivi temps réel",
        "Notifications automatiques",
        "Historique complet",
      ],
      color: "var(--accent)",
    },
  ];

  const handleRoleSelect = (role) => {
    // Changer le rôle DEMO via le contexte
    changeDemoRole(role.id);
    
    // Initialiser COMPLÈTEMENT l'état DEMO de manière SYNCHRONE
    const success = enterDemoRole(role.id, role.path);
    
    if (!success) {
      console.error("❌ Échec de l'initialisation DEMO");
      alert("Erreur lors de l'activation du mode DEMO. Veuillez réessayer.");
      return;
    }
    
    // Navigation vers le dashboard après initialisation complète
    console.log("🎯 Navigation vers:", role.path);
    setTimeout(() => {
      router.push(role.path);
    }, 100); // 100ms pour garantir l'écriture localStorage
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
        padding: "6rem 2rem 4rem",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Hero Section */}
        <div
          style={{
            textAlign: "center",
            color: "white",
            marginBottom: "4rem",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎭</div>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              margin: "0 0 1rem 0",
              letterSpacing: "-0.5px",
            }}
          >
            Bienvenue en mode démonstration
          </h1>
          <p
            style={{
              fontSize: "1.2rem",
              opacity: 0.95,
              maxWidth: "700px",
              margin: "0 auto 1.5rem",
              lineHeight: "1.6",
            }}
          >
            Vous êtes connecté en tant que{" "}
            <strong>{demoProfile?.prenom} {demoProfile?.nom}</strong>
            <br />
            Explorez JETC IMMO librement avec des données simulées
          </p>

          <div
            style={{
              display: "inline-flex",
              gap: "1rem",
              background: "rgba(255, 255, 255, 0.1)",
              padding: "1rem 2rem",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>Email</div>
              <div style={{ fontSize: "1rem", fontWeight: "600" }}>
                {demoProfile?.email}
              </div>
            </div>
            <div
              style={{
                width: "1px",
                background: "rgba(255, 255, 255, 0.3)",
              }}
            />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>Régie</div>
              <div style={{ fontSize: "1rem", fontWeight: "600" }}>
                {demoProfile?.regie_nom || "Régie Démo"}
              </div>
            </div>
          </div>
        </div>

        {/* Guide rapide */}
        <Card
          style={{
            padding: "2rem",
            marginBottom: "3rem",
            background: "white",
            borderRadius: "16px",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              margin: "0 0 1.5rem 0",
              color: "var(--primary)",
            }}
          >
            🚀 Que faire en mode DEMO ?
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1.5rem",
            }}
          >
            <div>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                1️⃣
              </div>
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  margin: "0 0 0.5rem 0",
                }}
              >
                Choisissez un rôle
              </h3>
              <p style={{ margin: 0, fontSize: "0.95rem", opacity: 0.8 }}>
                Cliquez sur une carte ci-dessous pour explorer l'interface de ce profil
              </p>
            </div>
            <div>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                2️⃣
              </div>
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  margin: "0 0 0.5rem 0",
                }}
              >
                Testez les fonctionnalités
              </h3>
              <p style={{ margin: 0, fontSize: "0.95rem", opacity: 0.8 }}>
                Créez des tickets, gérez des missions, testez tout le cycle complet
              </p>
            </div>
            <div>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                3️⃣
              </div>
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  margin: "0 0 0.5rem 0",
                }}
              >
                Changez de perspective
              </h3>
              <p style={{ margin: 0, fontSize: "0.95rem", opacity: 0.8 }}>
                Utilisez le widget en bas à droite pour passer d'un rôle à l'autre
              </p>
            </div>
          </div>
        </Card>

        {/* Rôles disponibles */}
        <h2
          style={{
            fontSize: "1.8rem",
            fontWeight: "700",
            margin: "0 0 2rem 0",
            color: "white",
            textAlign: "center",
          }}
        >
          Choisissez un profil pour commencer
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            marginBottom: "3rem",
          }}
        >
          {roles.map((role) => (
            <Card
              key={role.id}
              style={{
                padding: "2rem",
                cursor: "pointer",
                transition: "all 0.3s ease",
                borderLeft: `4px solid ${role.color}`,
              }}
              className="hover-glow"
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.2)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "var(--shadow)";
              }}
              onClick={() => handleRoleSelect(role)}
            >
              <div
                style={{
                  fontSize: "3rem",
                  marginBottom: "1rem",
                  textAlign: "center",
                }}
              >
                {role.icon}
              </div>
              <h3
                style={{
                  fontSize: "1.3rem",
                  fontWeight: "700",
                  margin: "0 0 0.5rem 0",
                  color: role.color,
                  textAlign: "center",
                }}
              >
                {role.title}
              </h3>
              <p
                style={{
                  fontSize: "0.95rem",
                  opacity: 0.8,
                  margin: "0 0 1.5rem 0",
                  textAlign: "center",
                  lineHeight: "1.5",
                }}
              >
                {role.description}
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 1.5rem 0",
                  fontSize: "0.9rem",
                }}
              >
                {role.features.map((feature, idx) => (
                  <li
                    key={idx}
                    style={{
                      padding: "0.4rem 0",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span style={{ color: role.color, fontSize: "1.2rem" }}>
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                style={{
                  width: "100%",
                  background: role.color,
                  padding: "0.75rem",
                  fontSize: "1rem",
                  fontWeight: "600",
                }}
                className="hover-bounce"
              >
                Explorer ce rôle →
              </Button>
            </Card>
          ))}
        </div>

        {/* Footer actions */}
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <p style={{ color: "white", margin: "0 0 1rem 0", fontSize: "1rem" }}>
            💡 <strong>Astuce :</strong> Toutes les données sont simulées. N'hésitez pas à
            tester toutes les fonctionnalités !
          </p>
          <Button
            onClick={() => router.push("/")}
            style={{
              background: "transparent",
              border: "2px solid white",
              color: "white",
              padding: "0.75rem 2rem",
            }}
          >
            ← Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
}
