import { useState } from "react";
import DemoLayout from "../../../components/demo/DemoLayout";

export default function DemoEntreprisePlanning() {
  const [missions] = useState([
    { id: 1, ref: "MIS-2401", type: "Plomberie", adresse: "12 Rue des Lilas, Apt A101", technicien: "Jean Dupont", date: "2025-12-15", heure: "10:00", statut: "planifiée", duree: "2h" },
    { id: 2, ref: "MIS-2402", type: "Électricité", adresse: "34 Avenue Victor Hugo, Apt B205", technicien: "Marc Legrand", date: "2025-12-12", heure: "14:30", statut: "en cours", duree: "3h" },
    { id: 3, ref: "MIS-2403", type: "Chauffage", adresse: "8 Rue des Érables, Apt C302", technicien: "Sophie Martin", date: "2025-12-14", heure: "09:00", statut: "planifiée", duree: "2.5h" },
    { id: 4, ref: "MIS-2405", type: "Plomberie", adresse: "56 Boulevard Haussmann, Apt D101", technicien: "Jean Dupont", date: "2025-12-12", heure: "16:00", statut: "en cours", duree: "1.5h" },
    { id: 5, ref: "MIS-2406", type: "Serrurerie", adresse: "23 Rue de la Paix, Apt E205", technicien: "Pierre Durand", date: "2025-12-16", heure: "11:00", statut: "planifiée", duree: "1h" },
    { id: 6, ref: "MIS-2407", type: "Ventilation", adresse: "45 Avenue Foch, Apt F102", technicien: "Sophie Martin", date: "2025-12-13", heure: "13:30", statut: "planifiée", duree: "2h" }
  ]);

  const getStatutColor = (statut) => {
    switch (statut) {
      case "planifiée": return { bg: "#cfe2ff", color: "#084298" };
      case "en cours": return { bg: "#fff3cd", color: "#856404" };
      case "terminée": return { bg: "#d1e7dd", color: "#0a3622" };
      default: return { bg: "#e2e3e5", color: "#41464b" };
    }
  };

  // Grouper par date
  const missionsByDate = missions.reduce((acc, mission) => {
    if (!acc[mission.date]) {
      acc[mission.date] = [];
    }
    acc[mission.date].push(mission);
    return acc;
  }, {});

  return (
    <DemoLayout role="entreprise" activePage="/demo/entreprise/planning">
      <h1 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>📅 Planning des Missions</h1>

      <div style={{
        backgroundColor: "#fff3cd",
        padding: "1rem",
        borderRadius: "5px",
        marginBottom: "1.5rem",
        borderLeft: "4px solid #ffc107"
      }}>
        <strong>ℹ️ Mode Démo :</strong> Planning fictif. Les modifications ne sont pas enregistrées.
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
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3498db" }}>6</div>
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
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>En cours aujourd'hui</div>
        </div>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#27ae60" }}>4</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>Planifiées</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {Object.entries(missionsByDate).sort().map(([date, missionsForDate]) => (
          <div key={date}>
            <h2 style={{
              color: "#2c3e50",
              borderBottom: "2px solid #3498db",
              paddingBottom: "0.5rem",
              marginBottom: "1rem"
            }}>
              📆 {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {missionsForDate.map((mission) => {
                const statutStyle = getStatutColor(mission.statut);
                
                return (
                  <div key={mission.id} style={{
                    backgroundColor: "white",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    borderLeft: "4px solid #3498db"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                          <h3 style={{ margin: 0, color: "#2c3e50" }}>
                            {mission.ref} - {mission.type}
                          </h3>
                          <span style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "12px",
                            fontSize: "0.8rem",
                            fontWeight: "bold",
                            backgroundColor: statutStyle.bg,
                            color: statutStyle.color
                          }}>
                            {mission.statut.toUpperCase()}
                          </span>
                        </div>
                        
                        <p style={{ margin: "0.5rem 0", fontSize: "0.9rem", color: "#666" }}>
                          📍 {mission.adresse}
                        </p>
                        
                        <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem", fontSize: "0.9rem" }}>
                          <span>👷 <strong>{mission.technicien}</strong></span>
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
                        Modifier
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </DemoLayout>
  );
}
