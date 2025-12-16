import { useEffect, useState } from "react";
import Link from "next/link";
import UserBadge from "./UserBadge";
import { useTheme } from "../context/ThemeContext";
import { canUseDemo } from "../lib/demoAccess";
import { getProfile } from "../lib/auth";
import { sendAdminMagicLink } from "../lib/adminAuth";

export default function Layout({ children }) {
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const user = await getProfile();
      setProfile(user);
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleAdminRightClick = async (e) => {
    e.preventDefault();
    
    let email = profile?.email;
    
    if (!email) {
      email = prompt("Email admin pour Magic Link:");
      if (!email) {
        alert("Email requis pour l'authentification admin");
        return;
      }
    }
    
    const result = await sendAdminMagicLink(email);
    
    if (result.success) {
      alert(`Magic Link envoyé à ${email}. Vérifiez votre boîte mail.`);
    } else {
      alert(`Erreur: ${result.error}`);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      <header
        style={{
          background: "var(--primary)",
          color: "white",
          padding: "1rem 2rem",
          boxShadow: "var(--shadow)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link href="/" style={{ textDecoration: "none" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "1.5rem",
                color: "var(--accent)",
                cursor: "pointer",
                transition: "transform 0.2s ease, opacity 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.opacity = "1";
              }}
              onContextMenu={handleAdminRightClick}
              title="Clic droit pour accès admin"
            >
              🏢 JETC IMMO
            </h1>
          </Link>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                padding: "0.3rem 0.5rem",
                borderRadius: "6px",
                display: "flex",
                gap: "0.5rem",
              }}
            >
              <button
                onClick={() => setTheme("speciale")}
                style={{
                  background:
                    theme === "speciale" ? "var(--accent)" : "transparent",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  padding: "0.3rem 0.6rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: theme === "speciale" ? "600" : "400",
                }}
              >
                Spéciale
              </button>
              <button
                onClick={() => setTheme("jardin")}
                style={{
                  background:
                    theme === "jardin" ? "var(--accent)" : "transparent",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  padding: "0.3rem 0.6rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: theme === "jardin" ? "600" : "400",
                }}
              >
                Jardin
              </button>
              <button
                onClick={() => setTheme("zen")}
                style={{
                  background: theme === "zen" ? "var(--accent)" : "transparent",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  padding: "0.3rem 0.6rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: theme === "zen" ? "600" : "400",
                }}
              >
                Zen
              </button>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <UserBadge />
            </div>
          </div>
        </div>
      </header>

      <nav
        style={{
          background: "var(--secondary)",
          padding: "0.75rem 2rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            gap: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/login"
            style={{
              color: "white",
              textDecoration: "none",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              transition: "all 0.2s ease",
            }}
                className="hover-glow"
              >
                Connexion
              </Link>
          <Link
            href="/register"
            style={{
              color: "white",
              textDecoration: "none",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              transition: "all 0.2s ease",
            }}
            className="hover-glow"
          >
            📝 Inscription
          </Link>
          
          {/* Bouton MODE DEMO visible uniquement pour visiteurs non connectés */}
          {!loading && canUseDemo(profile) && (
            <Link
              href="/demo-hub"
              style={{
                color: "white",
                textDecoration: "none",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                transition: "all 0.2s ease",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                fontWeight: "600",
              }}
              className="hover-glow"
            >
              🎭 Mode démo
            </Link>
          )}
          
          <Link
            href="/locataire/tickets"
            style={{
              color: "white",
              textDecoration: "none",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              transition: "all 0.2s ease",
            }}
            className="hover-glow"
          >
            👤 Locataire
          </Link>
          <Link
            href="/regie/dashboard"
            style={{
              color: "white",
              textDecoration: "none",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              transition: "all 0.2s ease",
            }}
            className="hover-glow"
          >
            🏢 Régie
          </Link>
          <Link
            href="/entreprise/missions"
            style={{
              color: "white",
              textDecoration: "none",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              transition: "all 0.2s ease",
            }}
            className="hover-glow"
          >
            🔧 Entreprise
          </Link>
          <Link
            href="/technicien/missions"
            style={{
              color: "white",
              textDecoration: "none",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              transition: "all 0.2s ease",
            }}
            className="hover-glow"
          >
            ⚙️ Technicien
          </Link>
        </div>
      </nav>

      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem",
        }}
        className="fade-in"
      >
        {children}
      </main>
    </div>
  );
}
