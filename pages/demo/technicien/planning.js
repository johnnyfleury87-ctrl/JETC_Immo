import { useState } from "react";
import DemoLayout from "../../../components/demo/DemoLayout";

export default function DemoTechnicienPlanning() {
  const [missions] = useState([
    { id: 1, ref: "MIS-2401", type: "Plomberie", adresse: "12 Rue des Lilas, Apt A101", date: "2025-12-15", heure: "10:00", duree: "2h", regie: "Régie Horizon", statut: "planifiee" },
    { id: 2, ref: "MIS-2402", type: "Électricité", adresse: "34 Avenue Victor Hugo, Apt B205", date: "2025-12-12", heure: "14:30", duree: "3h", regie: "Gestion Plus", statut: "en_cours" },
    { id: 3, ref: "MIS-2405", type: "Plomberie", adresse: "56 Boulevard Haussmann, Apt D101", date: "2025-12-12", heure: "16:00", duree: "1.5h", regie: "Régie Horizon", statut: "en_cours" },
    { id: 4, ref: "MIS-2408", type: "Chauffage", adresse: "78 Rue de la Paix, Apt C204", date: "2025-12-16", heure: "09:00", duree: "2.5h", regie: "Régie Central", statut: "planifiee" }
  ]);

  return (
    <DemoLayout role="technicien" activePage="/demo/technicien/planning">
      <h1 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>📅 Mon Planning</h1>

      <div style={{
        backgroundColor: "#fff3cd",
        padding: "1rem",
        borderRadius: "5px",
        marginBottom: "1.5rem",
        borderLeft: "4px solid #ffc107"
      }}>
        <strong>ℹ️ Mode Démo :</strong> Planning fictif. Aucune modification possible.
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
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3498db" }}>4</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>Missions cette semaine</div>
        </div>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#f39c12" }}>2</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>Aujourd hui</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {missions.map((mission) => (
          <div key={mission.id} style={{
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            borderLeft: mission.statut === "en_cours" ? "4px solid #f39c12" : "4px solid #3498db"
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
                  🏢 {mission.regie}
                </p>
                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", fontSize: "0.9rem" }}>
                  <span>📅 <strong>{mission.date}</strong></span>
                  <span>🕐 <strong>{mission.heure}</strong></span>
                  <span>⏱️ <strong>{mission.duree}</strong></span>
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
                Voir détails
              </button>
            </div>
          </div>
        ))}
      </div>
    </DemoLayout>
  );
}
