import { useDemoMode } from "../context/DemoModeContext";

export default function DemoModeBanner() {
  const { demoMode, toggleDemoMode } = useDemoMode();

  if (!demoMode) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "0.75rem 1rem",
        textAlign: "center",
        fontSize: "0.9rem",
        fontWeight: "600",
        zIndex: 9999,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
      }}
    >
      <span>
        🎭 <strong>MODE DEMO ACTIF</strong> — Aucune donnée ne sera modifiée
      </span>
      <button
        onClick={toggleDemoMode}
        style={{
          background: "rgba(255, 255, 255, 0.2)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          borderRadius: "4px",
          color: "white",
          padding: "0.25rem 0.75rem",
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
        Désactiver
      </button>
    </div>
  );
}
