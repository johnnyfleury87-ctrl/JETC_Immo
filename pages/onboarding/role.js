import { useState } from "react";
import { useRouter } from "next/router";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import { apiFetch } from "../../lib/api";

export default function OnboardingRole() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: "regie",
      icon: "🏢",
      title: "Régie Immobilière",
      description: "Gérez votre parc immobilier, diffusez des tickets et suivez les interventions",
      color: "#4f46e5",
      features: ["Gestion complète", "Dashboard analytique", "Multi-utilisateurs"],
      requiresPlan: true,
    },
    {
      id: "entreprise",
      icon: "🏗️",
      title: "Entreprise de Maintenance",
      description: "Recevez des tickets, gérez vos techniciens et facturez vos interventions",
      color: "#10b981",
      features: ["GRATUIT pour tickets", "Gestion d'équipe", "Facturation intégrée"],
      requiresPlan: false,
    },
    {
      id: "technicien",
      icon: "👷",
      title: "Technicien",
      description: "Consultez vos missions, ajoutez des photos et signez les interventions",
      color: "#f59e0b",
      features: ["Application mobile", "Signature électronique", "Historique"],
      requiresPlan: false,
    },
    {
      id: "locataire",
      icon: "🏠",
      title: "Locataire",
      description: "Déclarez vos problèmes et suivez l'avancement de vos demandes",
      color: "#8b5cf6",
      features: ["Déclaration facile", "Suivi en temps réel", "Notifications"],
      requiresPlan: false,
    },
  ];

  const handleRoleSelection = async (role) => {
    setSelectedRole(role.id);
    setLoading(true);
    
    try {
      await apiFetch("/onboarding/set-role", {
        method: "POST",
        body: JSON.stringify({ role: role.id }),
      });

      // Redirection selon le rôle
      if (role.requiresPlan) {
        router.push("/onboarding/plan");
      } else if (role.id === "locataire") {
        router.push("/locataire/tickets");
      } else if (role.id === "technicien") {
        router.push("/technicien/missions");
      } else if (role.id === "entreprise") {
        router.push("/entreprise/missions");
      }
    } catch (error) {
      console.error("Erreur sélection rôle", error);
      alert("Erreur lors de la sélection du rôle. Veuillez réessayer.");
      setLoading(false);
      setSelectedRole(null);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
        padding: "2rem",
      }}
    >
      <Card 
        className="fade-in"
        style={{ 
          maxWidth: "1200px", 
          width: "100%", 
          padding: "3rem 2rem",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1
            className="slide-up"
            style={{
              fontSize: "2.5rem",
              margin: "0 0 1rem 0",
              color: "var(--primary)",
              fontWeight: "800",
            }}
          >
            🎯 Bienvenue sur JETC IMMO
          </h1>
          <p
            className="slide-up stagger-1"
            style={{
              fontSize: "1.2rem",
              opacity: 0.8,
              lineHeight: "1.6",
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            Pour commencer, choisissez votre profil et accédez immédiatement à votre espace personnalisé
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {roles.map((role, index) => (
            <Card
              key={role.id}
              className={`hover-glow slide-up stagger-${index + 2}`}
              style={{
                textAlign: "center",
                padding: "2rem 1.5rem",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading && selectedRole !== role.id ? 0.4 : 1,
                border: selectedRole === role.id ? `3px solid ${role.color}` : "2px solid rgba(0, 0, 0, 0.1)",
                position: "relative",
                transition: "all 0.3s ease",
                transform: selectedRole === role.id ? "scale(1.02)" : "scale(1)",
              }}
              onClick={() => !loading && handleRoleSelection(role)}
            >
              {role.requiresPlan === false && (
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: role.id === "entreprise" ? "#10b981" : role.color,
                    color: "white",
                    padding: "0.3rem 0.6rem",
                    borderRadius: "20px",
                    fontSize: "0.7rem",
                    fontWeight: "700",
                  }}
                  className="pulse"
                >
                  {role.id === "entreprise" ? "GRATUIT" : "ACCÈS LIBRE"}
                </div>
              )}

              <div
                className="hover-rotate"
                style={{ 
                  fontSize: "4rem", 
                  marginBottom: "1rem",
                  filter: loading && selectedRole !== role.id ? "grayscale(1)" : "none",
                }}
              >
                {role.icon}
              </div>

              <h3 
                style={{ 
                  fontSize: "1.4rem", 
                  margin: "0 0 0.8rem 0",
                  color: role.color,
                  fontWeight: "700",
                }}
              >
                {role.title}
              </h3>

              <p 
                style={{ 
                  fontSize: "0.95rem", 
                  margin: "0 0 1.5rem 0", 
                  opacity: 0.8,
                  lineHeight: "1.5",
                  minHeight: "60px",
                }}
              >
                {role.description}
              </p>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 1.5rem 0",
                  textAlign: "left",
                }}
              >
                {role.features.map((feature, idx) => (
                  <li
                    key={idx}
                    style={{
                      padding: "0.5rem 0",
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span style={{ color: role.color, fontWeight: "700" }}>✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {selectedRole === role.id ? (
                <div
                  style={{
                    padding: "0.8rem",
                    background: role.color,
                    color: "white",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "1rem",
                  }}
                >
                  ⏳ Chargement...
                </div>
              ) : (
                <Button
                  style={{
                    width: "100%",
                    padding: "0.8rem",
                    fontSize: "1rem",
                    fontWeight: "700",
                    background: "transparent",
                    color: role.color,
                    border: `2px solid ${role.color}`,
                  }}
                  className="hover-bounce"
                >
                  Choisir {role.title.split(" ")[0]}
                </Button>
              )}
            </Card>
          ))}
        </div>

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
            💡 <strong>Besoin d&apos;aide ?</strong> Vous pourrez toujours changer de rôle plus tard depuis vos paramètres
          </p>
        </div>
      </Card>
    </div>
  );
}
