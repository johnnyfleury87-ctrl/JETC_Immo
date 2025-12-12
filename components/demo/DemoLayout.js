import { useState } from "react";
import Link from "next/link";

export default function DemoLayout({ children, role, activePage }) {
  const [menuOpen, setMenuOpen] = useState(true);

  const menus = {
    regie: [
      { label: "Dashboard", href: "/demo/regie/dashboard", icon: "📊" },
      { label: "Locataires", href: "/demo/regie/locataires", icon: "👥" },
      { label: "Logements", href: "/demo/regie/logements", icon: "🏢" },
      { label: "Tickets", href: "/demo/regie/tickets", icon: "🎫" },
      { label: "Interventions", href: "/demo/regie/interventions", icon: "🔧" },
      { label: "Paramètres", href: "/demo/regie/parametres", icon: "⚙️" }
    ],
    entreprise: [
      { label: "Dashboard", href: "/demo/entreprise/dashboard", icon: "📊" },
      { label: "Planning", href: "/demo/entreprise/planning", icon: "📅" },
      { label: "Techniciens", href: "/demo/entreprise/techniciens", icon: "👷" },
      { label: "Missions", href: "/demo/entreprise/missions", icon: "📋" },
      { label: "Statistiques", href: "/demo/entreprise/statistiques", icon: "📈" },
      { label: "Paramètres", href: "/demo/entreprise/parametres", icon: "⚙️" }
    ],
    locataire: [
      { label: "Dashboard", href: "/demo/locataire/dashboard", icon: "🏠" },
      { label: "Mes tickets", href: "/demo/locataire/tickets", icon: "🎫" },
      { label: "Nouveau ticket", href: "/demo/locataire/nouveau-ticket", icon: "➕" },
      { label: "Mon logement", href: "/demo/locataire/logement", icon: "🔑" },
      { label: "Messages", href: "/demo/locataire/messages", icon: "💬" },
      { label: "Profil", href: "/demo/locataire/profil", icon: "👤" }
    ],
    technicien: [
      { label: "Dashboard", href: "/demo/technicien/dashboard", icon: "📊" },
      { label: "Planning", href: "/demo/technicien/planning", icon: "📅" },
      { label: "Missions", href: "/demo/technicien/missions", icon: "🔧" },
      { label: "Historique", href: "/demo/technicien/historique", icon: "📚" },
      { label: "Profil", href: "/demo/technicien/profil", icon: "👤" }
    ]
  };

  const currentMenu = menus[role] || [];
  const roleLabels = {
    regie: "Régie",
    entreprise: "Entreprise",
    locataire: "Locataire",
    technicien: "Technicien"
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Sidebar */}
      {menuOpen && (
        <aside style={{
          width: "250px",
          backgroundColor: "#2c3e50",
          color: "white",
          padding: "1rem",
          boxShadow: "2px 0 5px rgba(0,0,0,0.1)"
        }}>
          <div style={{ marginBottom: "2rem", textAlign: "center" }}>
            <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#3498db" }}>JETC Immo</h2>
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem", color: "#95a5a6" }}>
              {roleLabels[role]}
            </p>
          </div>

          <div style={{
            backgroundColor: "#e74c3c",
            color: "white",
            padding: "0.5rem",
            borderRadius: "5px",
            textAlign: "center",
            marginBottom: "1.5rem",
            fontSize: "0.85rem",
            fontWeight: "bold"
          }}>
            🎭 MODE DÉMO
          </div>

          <nav>
            {currentMenu.map((item, idx) => (
              <Link key={idx} href={item.href} style={{ textDecoration: "none" }}>
                <div style={{
                  padding: "0.75rem 1rem",
                  marginBottom: "0.5rem",
                  borderRadius: "5px",
                  cursor: "pointer",
                  backgroundColor: activePage === item.href ? "#34495e" : "transparent",
                  color: "white",
                  transition: "background 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem"
                }}
                onMouseEnter={(e) => {
                  if (activePage !== item.href) {
                    e.currentTarget.style.backgroundColor = "#34495e";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activePage !== item.href) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>

          <div style={{
            position: "absolute",
            bottom: "1rem",
            left: "1rem",
            right: "1rem"
          }}>
            <Link href="/demo-hub" style={{ textDecoration: "none" }}>
              <button style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#3498db",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold"
              }}>
                ← Retour Hub
              </button>
            </Link>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main style={{ flex: 1, padding: "2rem" }}>
        {/* Header */}
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          padding: "1rem",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            {menuOpen ? "◀ Masquer" : "☰ Menu"}
          </button>

          <div style={{
            backgroundColor: "#ff9800",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "5px",
            fontWeight: "bold",
            fontSize: "0.9rem"
          }}>
            🎭 MODE DÉMONSTRATION
          </div>
        </header>

        {/* Page Content */}
        <div>
          {children}
        </div>
      </main>
    </div>
  );
}
