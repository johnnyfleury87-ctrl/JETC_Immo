import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import Link from "next/link";
import Button from "../components/UI/Button";
import Hero from "../components/marketing/Hero";
import ActorsSection from "../components/marketing/ActorsSection";
import HowItWorks from "../components/marketing/HowItWorks";
import PricingPreview from "../components/marketing/PricingPreview";
import FAQ from "../components/marketing/FAQ";
import { supabase } from "../lib/supabase";

export default function HomePage() {
  const router = useRouter();
  const logoRef = useRef(null);

  useEffect(() => {
    const handleSecretAccess = (e) => {
      e.preventDefault();
      supabase.auth.signInWithOtp({
        email: 'johnny.fleury87@gmail.com',
        options: {
          emailRedirectTo: `${window.location.origin}/admin/jetc`
        }
      });
    };

    if (logoRef.current) {
      logoRef.current.addEventListener('contextmenu', handleSecretAccess);
    }

    return () => {
      if (logoRef.current) {
        logoRef.current.removeEventListener('contextmenu', handleSecretAccess);
      }
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        color: "#1e293b",
      }}
    >
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(147, 51, 234, 0.4),
                        0 0 20px rgba(147, 51, 234, 0.2);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 20px rgba(147, 51, 234, 0.6),
                        0 0 40px rgba(147, 51, 234, 0.3),
                        0 0 60px rgba(147, 51, 234, 0.1);
            transform: scale(1.02);
          }
        }
        
        .demo-button-animated {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        
        .hover-lift {
          transition: all 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
      `}</style>

      {/* Header Navigation */}
      <header
        style={{
          padding: "1rem 2rem",
          background: "#ffffff",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "1rem",
            cursor: "pointer" 
          }} 
          onClick={() => router.push("/")}
        >
          <img 
            ref={logoRef}
            src="/branding/jetc/logo.png" 
            alt="JETC IMMO" 
            style={{ 
              height: "clamp(40px, 8vw, 56px)",
              width: "auto",
              objectFit: "contain"
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <span 
            style={{ 
              display: "none",
              fontSize: "1.5rem", 
              fontWeight: "700",
              color: "#3b82f6"
            }}
          >
            🏢 JETC IMMO
          </span>
        </div>
        
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Button
            onClick={() => router.push("/pricing")}
            style={{ 
              background: "transparent",
              color: "#64748b",
              border: "2px solid #e2e8f0",
              padding: "0.6rem 1.5rem",
              fontWeight: "500",
              transition: "all 0.2s ease"
            }}
            className="hover-lift"
            onMouseEnter={(e) => {
              e.target.style.borderColor = "#3b82f6";
              e.target.style.color = "#3b82f6";
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = "#e2e8f0";
              e.target.style.color = "#64748b";
            }}
          >
            💰 Tarifs
          </Button>
          
          <Button
            onClick={() => {
              localStorage.setItem("jetc_demo_mode", "true");
              router.push("/demo-hub");
            }}
            style={{ 
              background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
              color: "white",
              border: "none",
              padding: "0.6rem 1.5rem",
              fontWeight: "600",
              transition: "all 0.3s ease"
            }}
            className="demo-button-animated hover-lift"
          >
            🎭 Commencer en mode DEMO
          </Button>
          
          <Button
            onClick={() => router.push("/login")}
            style={{ 
              background: "#3b82f6",
              color: "white",
              border: "none",
              padding: "0.6rem 1.5rem",
              fontWeight: "500",
              transition: "all 0.2s ease"
            }}
            className="hover-lift"
            onMouseEnter={(e) => {
              e.target.style.background = "#2563eb";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#3b82f6";
            }}
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

      {/* Section Partenariat */}
      <section
        style={{
          padding: "5rem 2rem",
          background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              textAlign: "center",
              marginBottom: "3rem",
              color: "#1e293b",
            }}
          >
            Partenariat
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
              gap: "3rem",
              alignItems: "start",
            }}
          >
            {/* JETC IMMO */}
            <div
              style={{
                background: "white",
                padding: "2.5rem",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                textAlign: "center",
              }}
              className="hover-lift"
            >
              <img
                src="/branding/jetc/logo.png"
                alt="JETC IMMO"
                style={{
                  height: "60px",
                  marginBottom: "1.5rem",
                  objectFit: "contain",
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div 
                style={{ 
                  display: "none",
                  fontSize: "2rem",
                  marginBottom: "1.5rem"
                }}
              >
                🏢
              </div>
              
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  marginBottom: "1rem",
                  color: "#3b82f6",
                }}
              >
                JETC IMMO
              </h3>
              
              <p
                style={{
                  fontSize: "1rem",
                  color: "#64748b",
                  lineHeight: "1.6",
                  marginBottom: "1.5rem",
                }}
              >
                Plateforme collaborative pour la gestion immobilière moderne
              </p>

              <div
                style={{
                  padding: "1.5rem",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  color: "#475569",
                  textAlign: "left",
                }}
              >
                <p style={{ margin: "0 0 0.5rem 0" }}>
                  <strong>📧 Email :</strong> contact@jetc-immo.fr
                </p>
                <p style={{ margin: "0 0 0.5rem 0" }}>
                  <strong>📞 Téléphone :</strong> +33 (0)1 XX XX XX XX
                </p>
                <p style={{ margin: "0" }}>
                  <strong>📍 Adresse :</strong> Paris, France
                </p>
              </div>
            </div>

            {/* Perriti */}
            <div
              style={{
                background: "white",
                padding: "2.5rem",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                textAlign: "center",
                border: "2px solid #8b5cf6",
              }}
              className="hover-lift"
            >
              <img
                src="/branding/perriti/logo.svg"
                alt="Perriti"
                style={{
                  height: "60px",
                  marginBottom: "1.5rem",
                  objectFit: "contain",
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div 
                style={{ 
                  display: "none",
                  fontSize: "2rem",
                  marginBottom: "1.5rem"
                }}
              >
                🤝
              </div>
              
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                  color: "#8b5cf6",
                }}
              >
                Perriti
              </h3>
              
              <div
                style={{
                  display: "inline-block",
                  padding: "0.4rem 1rem",
                  background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                  color: "white",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  marginBottom: "1rem",
                }}
              >
                ✨ Partenaire & Revendeur Officiel
              </div>
              
              <p
                style={{
                  fontSize: "1rem",
                  color: "#64748b",
                  lineHeight: "1.6",
                  marginBottom: "1.5rem",
                }}
              >
                Expert en solutions digitales pour l&apos;immobilier
              </p>

              <div
                style={{
                  padding: "1.5rem",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  color: "#475569",
                  textAlign: "left",
                }}
              >
                <p style={{ margin: "0 0 0.5rem 0" }}>
                  <strong>📧 Email :</strong> contact@perriti.com
                </p>
                <p style={{ margin: "0 0 0.5rem 0" }}>
                  <strong>📞 Téléphone :</strong> +33 (0)X XX XX XX XX
                </p>
                <p style={{ margin: "0" }}>
                  <strong>📍 Adresse :</strong> France
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Final */}
      <section
        style={{
          padding: "5rem 2rem",
          background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
          color: "white",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              marginBottom: "1.5rem",
            }}
          >
            Prêt à transformer votre gestion immobilière ?
          </h2>
          <p
            style={{
              fontSize: "1.2rem",
              marginBottom: "2.5rem",
              opacity: 0.95,
            }}
          >
            Rejoignez les régies qui font confiance à JETC IMMO pour gérer leurs interventions
          </p>
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              onClick={() => router.push("/demande-adhesion")}
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
              🚀 Faire une demande d'adhésion
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
              }}
              className="hover-glow"
            >
              💰 Voir les tarifs
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "4rem 2rem 2rem",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          color: "white",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <img
              src="/branding/jetc/logo.png"
              alt="JETC IMMO"
              style={{
                height: "50px",
                marginBottom: "1rem",
                objectFit: "contain",
                filter: "brightness(0) invert(1)",
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <h3 
              style={{ 
                display: "none",
                fontSize: "1.5rem", 
                marginBottom: "1rem", 
                fontWeight: "700" 
              }}
            >
              🏢 JETC IMMO
            </h3>
            
            <p style={{ margin: "1rem 0 0 0", opacity: 0.8, fontSize: "0.95rem" }}>
              La plateforme collaborative pour la gestion immobilière
            </p>
          </div>
          
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "2rem",
              marginBottom: "2rem",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/pricing"
              style={{
                color: "white",
                textDecoration: "none",
                opacity: 0.9,
                transition: "all 0.2s ease",
                fontSize: "0.95rem",
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = "1";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = "0.9";
                e.target.style.transform = "translateY(0)";
              }}
            >
              💰 Tarifs
            </Link>
            <Link
              href="/login"
              style={{
                color: "white",
                textDecoration: "none",
                opacity: 0.9,
                transition: "all 0.2s ease",
                fontSize: "0.95rem",
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = "1";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = "0.9";
                e.target.style.transform = "translateY(0)";
              }}
            >
              🔐 Connexion
            </Link>
            <Link
              href="/demande-adhesion"
              style={{
                color: "white",
                textDecoration: "none",
                opacity: 0.9,
                transition: "all 0.2s ease",
                fontSize: "0.95rem",
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = "1";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = "0.9";
                e.target.style.transform = "translateY(0)";
              }}
            >
              📝 Demande d'adhésion
            </Link>
          </div>

          <div
            style={{
              paddingTop: "2rem",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "0.9rem",
              opacity: 0.7,
              textAlign: "center",
            }}
          >
            <p style={{ margin: 0 }}>© 2025 JETC IMMO - Tous droits réservés</p>
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.85rem" }}>
              ⚡ Propulsé par Perriti
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
