import { useState } from "react";
import { useRouter } from "next/router";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import { apiFetch } from "../../lib/api";

export default function OnboardingRole() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRoleSelection = async (role) => {
    setLoading(true);
    try {
      await apiFetch("/onboarding/set-role", {
        method: "POST",
        body: JSON.stringify({ role })
      });

      // Redirection selon le rôle
      if (role === "regie" || role === "entreprise") {
        router.push("/onboarding/plan");
      } else if (role === "locataire") {
        router.push("/locataire/tickets");
      } else if (role === "technicien") {
        router.push("/technicien/missions");
      }
    } catch (error) {
      console.error("Erreur sélection rôle", error);
      alert("Erreur lors de la sélection du rôle. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
      padding: "2rem"
    }}>
      <Card style={{ maxWidth: "800px", width: "100%", padding: "3rem" }}>
        <h1 style={{ 
          textAlign: "center", 
          fontSize: "2rem", 
          margin: "0 0 1rem 0",
          color: "var(--primary)"
        }}>
          🎯 Bienvenue sur JETC IMMO
        </h1>
        
        <p style={{ 
          textAlign: "center", 
          fontSize: "1.1rem", 
          opacity: 0.8,
          marginBottom: "3rem"
        }}>
          Pour commencer, choisissez votre profil :
        </p>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1.5rem"
        }}>
          <Card 
            className="hover-glow click-scale"
            style={{ 
              textAlign: "center", 
              padding: "2rem 1rem",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
              color: "white"
            }}
            onClick={() => !loading && handleRoleSelection("regie")}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏢</div>
            <h3 style={{ fontSize: "1.2rem", margin: "0 0 0.5rem 0" }}>Régie</h3>
            <p style={{ fontSize: "0.85rem", margin: 0, opacity: 0.9 }}>
              Gestion immobilière
            </p>
          </Card>

          <Card 
            className="hover-glow click-scale"
            style={{ 
              textAlign: "center", 
              padding: "2rem 1rem",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              background: "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
              color: "white"
            }}
            onClick={() => !loading && handleRoleSelection("entreprise")}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏗️</div>
            <h3 style={{ fontSize: "1.2rem", margin: "0 0 0.5rem 0" }}>Entreprise</h3>
            <p style={{ fontSize: "0.85rem", margin: 0, opacity: 0.9 }}>
              Maintenance & travaux
            </p>
          </Card>

          <Card 
            className="hover-glow click-scale"
            style={{ 
              textAlign: "center", 
              padding: "2rem 1rem",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
              color: "white"
            }}
            onClick={() => !loading && handleRoleSelection("locataire")}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👤</div>
            <h3 style={{ fontSize: "1.2rem", margin: "0 0 0.5rem 0" }}>Locataire</h3>
            <p style={{ fontSize: "0.85rem", margin: 0, opacity: 0.9 }}>
              Créer des tickets
            </p>
          </Card>

          <Card 
            className="hover-glow click-scale"
            style={{ 
              textAlign: "center", 
              padding: "2rem 1rem",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              background: "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)",
              color: "white"
            }}
            onClick={() => !loading && handleRoleSelection("technicien")}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👨‍🔧</div>
            <h3 style={{ fontSize: "1.2rem", margin: "0 0 0.5rem 0" }}>Technicien</h3>
            <p style={{ fontSize: "0.85rem", margin: 0, opacity: 0.9 }}>
              Interventions terrain
            </p>
          </Card>
        </div>

        {loading && (
          <p style={{ 
            textAlign: "center", 
            marginTop: "2rem",
            fontSize: "1rem",
            color: "var(--primary)",
            fontWeight: "600"
          }}>
            ⏳ Configuration en cours...
          </p>
        )}
      </Card>
    </div>
  );
}
