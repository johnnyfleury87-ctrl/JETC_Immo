import { useState } from "react";
import DemoLayout from "../../../components/demo/DemoLayout";
import withDemoAccess from "../../../lib/withDemoAccess";

function DemoTechnicienMissions() {
  const [missions] = useState([
    { id: 1, ref: "MIS-2401", type: "Plomberie", adresse: "12 Rue des Lilas", regie: "Régie Horizon", statut: "en_cours", priorite: "haute", date: "2025-12-15" },
    { id: 2, ref: "MIS-2402", type: "Électricité", adresse: "34 Avenue Victor Hugo", regie: "Gestion Plus", statut: "en_cours", priorite: "moyenne", date: "2025-12-12" },
    { id: 3, ref: "MIS-2408", type: "Chauffage", adresse: "78 Rue de la Paix", regie: "Régie Central", statut: "planifiee", priorite: "haute", date: "2025-12-16" },
    { id: 4, ref: "MIS-2405", type: "Plomberie", adresse: "56 Boulevard Haussmann", regie: "Régie Horizon", statut: "planifiee", priorite: "moyenne", date: "2025-12-12" }
  ]);

  return (
    <DemoLayout role="technicien" activePage="/demo/technicien/missions">
      <h1 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>🔧 Mes Missions</h1>

      <div style={{
        backgroundColor: "#fff3cd",
        padding: "1rem",
        borderRadius: "5px",
        marginBottom: "1.5rem",
        borderLeft: "4px solid #ffc107"
      }}>
        <strong>ℹ️ Mode Démo :</strong> Missions fictives. Aucune action réelle possible.
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "1rem",
        marginBottom: "1.5rem"
      }}>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#f39c12" }}>2</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>En cours</div>
        </div>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3498db" }}>2</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>Planifiées</div>
        </div>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#27ae60" }}>38</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>Complétées</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {missions.map((mission) => (
          <div key={mission.id} style={{
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            borderLeft: mission.priorite === "haute" ? "4px solid #e74c3c" : "4px solid #3498db"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 0.5rem 0", color: "#2c3e50" }}>
                  {mission.ref} - {mission.type}
                </h3>
                <p style={{ margin: "0.5rem 0", fontSize: "0.9rem", color: "#666" }}>
                  📍 {mission.adresse}
                </p>
                <p style={{ margin: "0.5rem 0", fontSize: "0.9rem", color: "#666" }}>
                  🏢 {mission.regie} • 📅 {mission.date}
                </p>
                <div style={{ marginTop: "0.5rem" }}>
                  <span style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "12px",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    backgroundColor: mission.statut === "en_cours" ? "#fff3cd" : "#cfe2ff",
                    color: mission.statut === "en_cours" ? "#856404" : "#084298"
                  }}>
                    {mission.statut.toUpperCase().replace("_", " ")}
                  </span>
                </div>
              </div>
              <button style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#3498db",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "not-allowed",
                fontSize: "0.85rem",
                opacity: 0.6
              }}
              title="Disponible en version PRO">
                Détails
              </button>
            </div>
          </div>
        ))}
      </div>
    </DemoLayout>
  );
}

export default withDemoAccess(DemoTechnicienMissions);
