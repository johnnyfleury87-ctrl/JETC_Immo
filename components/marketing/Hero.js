import { useRouter } from "next/router";
import Button from "../UI/Button";
import { useDemoMode } from "../../context/DemoModeContext";
import PartnersLogo from "./PartnersLogo";

export default function Hero() {
  const router = useRouter();
  const { enableDemoMode } = useDemoMode();

  const handleDemoStart = () => {
    // Activer le mode DEMO
    enableDemoMode();

    // S'assurer que le localStorage est écrit immédiatement
    localStorage.setItem("jetc_demo_mode", "true");

    // Navigation vers l'inscription
    router.push("/register");
  };

  return (
    <section
      className="hero-section"
      style={{
        position: "relative",
        textAlign: "center",
        padding: "5rem 2rem 6rem",
        background:
          "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
        color: "white",
        overflow: "hidden",
      }}
    >
      {/* Effet de fond subtil */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "900px", margin: "0 auto" }}>
        <PartnersLogo />

        <h1
          className="hero-title"
          style={{
            fontSize: "3.5rem",
            fontWeight: "800",
            margin: "0 0 1.5rem 0",
            lineHeight: "1.2",
            textShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          }}
        >
          Simplifiez la gestion de vos interventions immobilières
        </h1>

        <p
          className="hero-subtitle"
          style={{
            fontSize: "1.4rem",
            margin: "0 auto 3rem auto",
            maxWidth: "700px",
            opacity: 0.95,
            lineHeight: "1.6",
            fontWeight: "400",
          }}
        >
          Une plateforme qui connecte régies, entreprises et techniciens en temps réel.
          Gérez vos tickets, missions et factures en toute simplicité.
        </p>

        <div
          className="hero-cta"
          style={{
            display: "flex",
            gap: "1.5rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            onClick={handleDemoStart}
            style={{
              fontSize: "1.2rem",
              padding: "1.2rem 3rem",
              background: "white",
              color: "var(--primary)",
              fontWeight: "700",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
              border: "none",
            }}
            className="hover-bounce"
          >
            🚀 Commencer en mode DEMO
          </Button>

          <Button
            onClick={() => router.push("/pricing")}
            style={{
              fontSize: "1.2rem",
              padding: "1.2rem 3rem",
              background: "transparent",
              color: "white",
              fontWeight: "700",
              border: "2px solid white",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
            }}
            className="hover-glow"
          >
            💎 Voir les offres
          </Button>
        </div>

        {/* Badge de confiance */}
        <div
          style={{
            marginTop: "3rem",
            fontSize: "0.9rem",
            opacity: 0.8,
            display: "flex",
            justifyContent: "center",
            gap: "2rem",
            flexWrap: "wrap",
          }}
        >
          <span>✅ Sans engagement</span>
          <span>✅ Essai gratuit</span>
          <span>✅ Support 7j/7</span>
        </div>
      </div>
    </section>
  );
}
