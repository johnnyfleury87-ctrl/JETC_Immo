import { useState } from "react";
import { useDemoMode } from "../context/DemoModeContext";

export default function DemoModeBanner() {
  const { demoMode, demoRole, disableDemoMode } = useDemoMode();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!demoMode) return null;

  // Mapping des rôles pour affichage
  const roleLabels = {
    locataire: "👤 Locataire",
    regie: "🏢 Régie immobilière",
    entreprise: "🏗️ Entreprise de maintenance",
    technicien: "🔧 Technicien",
    admin_jtec: "⚙️ Administrateur JETC",
  };

  const currentRole = roleLabels[demoRole] || "👤 Utilisateur";

  if (isCollapsed) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "0.5rem 1rem",
          textAlign: "center",
          fontSize: "0.85rem",
          fontWeight: "600",
          zIndex: 9999,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          cursor: "pointer",
        }}
        onClick={() => setIsCollapsed(false)}
      >
        <span>🎭 MODE DÉMO</span>
        <span style={{ fontSize: "0.75rem", opacity: 0.9 }}>
          {currentRole}
        </span>
        <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>
          ↓ Cliquez pour voir les détails
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "1.25rem 2rem",
        zIndex: 9999,
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Header avec titre et actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "0.75rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.5rem" }}>🎭</span>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  letterSpacing: "0.5px",
                }}
              >
                MODE DÉMONSTRATION
              </h3>
              <p
                style={{
                  margin: "0.25rem 0 0 0",
                  fontSize: "0.85rem",
                  opacity: 0.95,
                }}
              >
                Profil actuel : <strong>{currentRole}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              onClick={() => setIsCollapsed(true)}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "6px",
                color: "white",
                padding: "0.4rem 0.9rem",
                fontSize: "0.85rem",
                cursor: "pointer",
                fontWeight: "600",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
              }}
            >
              ↑ Réduire
            </button>
            <button
              onClick={disableDemoMode}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.4)",
                borderRadius: "6px",
                color: "white",
                padding: "0.4rem 0.9rem",
                fontSize: "0.85rem",
                cursor: "pointer",
                fontWeight: "600",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
              }}
            >
              ✕ Désactiver
            </button>
          </div>
        </div>

        {/* Message pédagogique */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            padding: "1rem",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1rem",
              fontSize: "0.9rem",
              lineHeight: "1.5",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem" }}>✨</span>
              <div>
                <strong>Explorez librement</strong>
                <br />
                <span style={{ opacity: 0.9, fontSize: "0.85rem" }}>
                  Toutes les données sont simulées. Testez sans limite !
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem" }}>🔄</span>
              <div>
                <strong>Changez de rôle</strong>
                <br />
                <span style={{ opacity: 0.9, fontSize: "0.85rem" }}>
                  Utilisez le widget en bas à droite pour naviguer
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem" }}>🔒</span>
              <div>
                <strong>100% sécurisé</strong>
                <br />
                <span style={{ opacity: 0.9, fontSize: "0.85rem" }}>
                  Aucune donnée réelle, aucune facturation
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
