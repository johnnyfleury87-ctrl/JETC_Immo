import { useRouter } from "next/router";
import Link from "next/link";
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
        <h1 style={{ margin: 0, fontSize: "1.5rem", cursor: "pointer" }} onClick={() => router.push("/")}>
          🏢 JETC IMMO
        </h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Button
            onClick={() => router.push("/pricing")}
            style={{ background: "transparent", border: "2px solid white" }}
            className="hover-bounce"
          >
            💰 Tarifs
          </Button>
          <Button
            onClick={() => {
              localStorage.setItem("jetc_demo_mode", "true");
              router.push("/demo-hub");
            }}
            style={{ background: "transparent", border: "2px solid white" }}
            className="hover-bounce"
          >
            🎭 Commencer en mode DEMO
          </Button>
          <Button
            onClick={() => router.push("/login")}
            style={{ background: "white", color: "var(--primary)" }}
            className="hover-bounce"
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

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "3rem 2rem",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          color: "white",
          marginTop: "0",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "700" }}>
            🏢 JETC IMMO
          </h3>
          <p style={{ margin: "0 0 2rem 0", opacity: 0.8, fontSize: "0.95rem" }}>
            La plateforme collaborative pour la gestion immobilière
          </p>
          
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            gap: "2rem", 
            marginBottom: "2rem",
            flexWrap: "wrap"
          }}>
            <Link href="/pricing" style={{ color: "white", textDecoration: "none", opacity: 0.9, transition: "opacity 0.2s" }} onMouseEnter={(e) => e.target.style.opacity = "1"} onMouseLeave={(e) => e.target.style.opacity = "0.9"}>
              💰 Tarifs
            </Link>
            <Link href="/login" style={{ color: "white", textDecoration: "none", opacity: 0.9, transition: "opacity 0.2s" }} onMouseEnter={(e) => e.target.style.opacity = "1"} onMouseLeave={(e) => e.target.style.opacity = "0.9"}>
              🔐 Connexion
            </Link>
            <Link href="/register" style={{ color: "white", textDecoration: "none", opacity: 0.9, transition: "opacity 0.2s" }} onMouseEnter={(e) => e.target.style.opacity = "1"} onMouseLeave={(e) => e.target.style.opacity = "0.9"}>
              ✍️ Inscription
            </Link>
          </div>

          <div style={{ 
            paddingTop: "2rem", 
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            fontSize: "0.9rem",
            opacity: 0.7
          }}>
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
