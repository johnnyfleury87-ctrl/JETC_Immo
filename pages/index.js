import { useRouter } from "next/router";
import Button from "../components/UI/Button";
import Hero from "../components/marketing/Hero";
import ActorsSection from "../components/marketing/ActorsSection";
import HowItWorks from "../components/marketing/HowItWorks";
import PricingPreview from "../components/marketing/PricingPreview";
import FAQ from "../components/marketing/FAQ";

export default function HomePage() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        color: "var(--text)",
      }}
    >
      {/* Header simple */}
      <header
        style={{
          padding: "1.5rem 2rem",
          background: "var(--primary)",
          color: "white",
          boxShadow: "var(--shadow)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>🏢 JETC IMMO</h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Button
            onClick={() => router.push("/pricing")}
            style={{ background: "transparent", border: "2px solid white" }}
          >
            💰 Tarifs
          </Button>
          <Button
            onClick={() => router.push("/login")}
            style={{ background: "white", color: "var(--primary)" }}
          >
            🔐 Connexion
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <Hero />

      {/* Section des acteurs */}
      <ActorsSection />

      {/* Comment ça marche */}
      <HowItWorks />

      {/* Aperçu des tarifs */}
      <PricingPreview />

      {/* FAQ */}
      <FAQ />

      {/* Footer simple */}
      <footer
        style={{
          textAlign: "center",
          padding: "2rem",
          background: "var(--card-bg)",
          marginTop: "4rem",
          borderTop: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <p style={{ margin: 0, opacity: 0.7 }}>
          © 2025 JETC IMMO - Plateforme de gestion immobilière collaborative
        </p>
        <div style={{ marginTop: "1rem" }}>
          <a
            href="/pricing"
            style={{
              margin: "0 1rem",
              color: "var(--primary)",
              textDecoration: "none",
            }}
          >
            Tarifs
          </a>
          <a
            href="/login"
            style={{
              margin: "0 1rem",
              color: "var(--primary)",
              textDecoration: "none",
            }}
          >
            Connexion
          </a>
          <a
            href="/register"
            style={{
              margin: "0 1rem",
              color: "var(--primary)",
              textDecoration: "none",
            }}
          >
            Inscription
          </a>
        </div>
      </footer>
    </div>
  );
}
