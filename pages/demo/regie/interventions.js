import { useState } from "react";
import DemoLayout from "../../../components/demo/DemoLayout";

export default function DemoRegieInterventions() {
  const [interventions] = useState([
    { id: 1, mission: "MIS-2401", ticket: "TKT-001", entreprise: "PlombiTech Pro", technicien: "Jean Dupont", logement: "A101", statut: "planifiée", date: "2025-12-15", heure: "10:00" },
    { id: 2, mission: "MIS-2402", ticket: "TKT-002", entreprise: "Électric Services", technicien: "Marc Legrand", logement: "B205", statut: "en cours", date: "2025-12-12", heure: "14:30" },
    { id: 3, mission: "MIS-2403", ticket: "TKT-003", entreprise: "Chauffage Plus", technicien: "Sophie Martin", logement: "C302", statut: "attente validation", date: "2025-12-14", heure: "09:00" },
    { id: 4, mission: "MIS-2398", ticket: "TKT-006", entreprise: "VentiClim", technicien: "Pierre Durand", logement: "A204", statut: "terminée", date: "2025-12-10", heure: "11:00" },
    { id: 5, mission: "MIS-2400", ticket: "TKT-005", entreprise: "PlombiTech Pro", technicien: "Jean Dupont", logement: "D101", statut: "en cours", date: "2025-12-12", heure: "16:00" }
  ]);

  const getStatutColor = (statut) => {
    switch (statut) {
      case "planifiée": return { bg: "#cfe2ff", color: "#084298" };
      case "en cours": return { bg: "#fff3cd", color: "#856404" };
      case "attente validation": return { bg: "#f8d7da", color: "#721c24" };
      case "terminée": return { bg: "#d1e7dd", color: "#0a3622" };
      default: return { bg: "#e2e3e5", color: "#41464b" };
    }
  };

  return (
    <DemoLayout role="regie" activePage="/demo/regie/interventions">
      <h1 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>🔧 Suivi des Interventions</h1>

      <div style={{
        backgroundColor: "#fff3cd",
        padding: "1rem",
        borderRadius: "5px",
        marginBottom: "1.5rem",
        borderLeft: "4px solid #ffc107"
      }}>
        <strong>ℹ️ Mode Démo :</strong> Les données affichées sont fictives. Aucune modification n'est possible.
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3498db" }}>8</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>Missions en cours</div>
        </div>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#f39c12" }}>4</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>Planifiées</div>
        </div>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#e74c3c" }}>2</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>Attente validation</div>
        </div>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#27ae60" }}>42</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>Complétées ce mois</div>
        </div>
      </div>

      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        overflow: "hidden"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
              <th style={{ padding: "1rem", textAlign: "left" }}>Mission</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Ticket</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Entreprise</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Technicien</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>Logement</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>Date/Heure</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>Statut</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {interventions.map((intervention) => {
              const statutStyle = getStatutColor(intervention.statut);
              
              return (
                <tr key={intervention.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                  <td style={{ padding: "1rem" }}>
                    <strong>{intervention.mission}</strong>
                  </td>
                  <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#666" }}>
                    {intervention.ticket}
                  </td>
                  <td style={{ padding: "1rem", fontSize: "0.9rem" }}>
                    {intervention.entreprise}
                  </td>
                  <td style={{ padding: "1rem", fontSize: "0.9rem" }}>
                    👷 {intervention.technicien}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center", fontWeight: "bold" }}>
                    {intervention.logement}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center", fontSize: "0.9rem" }}>
                    📅 {intervention.date}<br />
                    🕐 {intervention.heure}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <span style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "12px",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      backgroundColor: statutStyle.bg,
                      color: statutStyle.color,
                      whiteSpace: "nowrap"
                    }}>
                      {intervention.statut.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <button style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#6c757d",
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{
        marginTop: "1.5rem",
        padding: "1.5rem",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h3 style={{ marginTop: 0, color: "#2c3e50" }}>📊 Performance des Entreprises</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>PlombiTech Pro</strong>
              <div style={{ fontSize: "0.85rem", color: "#666" }}>18 interventions ce mois</div>
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#27ae60" }}>96%</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>Électric Services</strong>
              <div style={{ fontSize: "0.85rem", color: "#666" }}>12 interventions ce mois</div>
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#27ae60" }}>94%</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>Chauffage Plus</strong>
              <div style={{ fontSize: "0.85rem", color: "#666" }}>8 interventions ce mois</div>
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#f39c12" }}>88%</div>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}
