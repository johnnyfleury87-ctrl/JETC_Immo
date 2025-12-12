import { useRouter } from "next/router";
import { useDemoMode } from "../context/DemoModeContext";

export default function DemoRoleSwitcher() {
  const router = useRouter();
  const { demoMode, demoRole, changeDemoRole } = useDemoMode();

  if (!demoMode) return null;

  const roles = [
    { value: "locataire", label: "👤 Locataire", path: "/locataire/tickets" },
    { value: "regie", label: "🏢 Régie", path: "/regie/dashboard" },
    {
      value: "entreprise",
      label: "🏗️ Entreprise",
      path: "/entreprise/missions",
    },
    {
      value: "technicien",
      label: "🔧 Technicien",
      path: "/technicien/missions",
    },
    { value: "admin_jtec", label: "⚙️ Admin", path: "/admin" },
  ];

  const handleRoleChange = (newRole, path) => {
    changeDemoRole(newRole);
    router.push(path);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        padding: "1rem",
        zIndex: 9998,
        minWidth: "250px",
        border: "2px solid var(--primary)",
      }}
    >
      <div
        style={{
          fontSize: "0.85rem",
          fontWeight: "700",
          color: "var(--primary)",
          marginBottom: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        🎭 Changer de profil
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {roles.map((role) => (
          <button
            key={role.value}
            onClick={() => handleRoleChange(role.value, role.path)}
            style={{
              padding: "0.6rem 1rem",
              border: "2px solid",
              borderColor:
                demoRole === role.value ? "var(--primary)" : "#e0e0e0",
              background:
                demoRole === role.value ? "var(--primary)" : "transparent",
              color: demoRole === role.value ? "white" : "var(--text)",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: demoRole === role.value ? "700" : "500",
              transition: "all 0.2s",
              textAlign: "left",
            }}
            onMouseOver={(e) => {
              if (demoRole !== role.value) {
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.background = "rgba(102, 126, 234, 0.1)";
              }
            }}
            onMouseOut={(e) => {
              if (demoRole !== role.value) {
                e.currentTarget.style.borderColor = "#e0e0e0";
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            {role.label}
          </button>
        ))}
      </div>

      <div
        style={{
          marginTop: "0.75rem",
          fontSize: "0.75rem",
          color: "#666",
          textAlign: "center",
        }}
      >
        Navigation libre en mode démo
      </div>
    </div>
  );
}
