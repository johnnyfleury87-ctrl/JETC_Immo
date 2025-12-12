import { useState } from "react";
import DemoLayout from "../../../components/demo/DemoLayout";
import withDemoAccess from "../../../lib/withDemoAccess";

function DemoEntrepriseMissions() {
  const [missions] = useState([
    { id: 1, ref: "MIS-2401", type: "Plomberie", regie: "Régie Horizon", adresse: "12 Rue des Lilas", technicien: "Jean Dupont", statut: "en_cours", urgence: "haute", date_debut: "2025-12-10", montant: 450 },
    { id: 2, ref: "MIS-2402", type: "Électricité", regie: "Gestion Plus", adresse: "34 Avenue Victor Hugo", technicien: "Marc Legrand", statut: "en_cours", urgence: "moyenne", date_debut: "2025-12-09", montant: 380 },
    { id: 3, ref: "MIS-2403", type: "Chauffage", regie: "Régie Central", adresse: "8 Rue des Érables", technicien: "Sophie Martin", statut: "planifiee", urgence: "haute", date_debut: "2025-12-14", montant: 520 },
    { id: 4, ref: "MIS-2398", type: "Ventilation", regie: "Régie Horizon", adresse: "23 Rue de la Paix", technicien: "Pierre Durand", statut: "terminee", urgence: "basse", date_debut: "2025-12-05", montant: 280 },
    { id: 5, ref: "MIS-2400", type: "Plomberie", regie: "Gestion Plus", adresse: "56 Boulevard Haussmann", technicien: "Jean Dupont", statut: "en_cours", urgence: "moyenne", date_debut: "2025-12-07", montant: 350 },
    { id: 6, ref: "MIS-2404", type: "Serrurerie", regie: "Régie Central", adresse: "45 Avenue Foch", technicien: "Non assigné", statut: "nouvelle", urgence: "basse", date_debut: "2025-12-16", montant: 200 }
  ]);

  const getStatutColor = (statut) => {
    switch (statut) {
      case "nouvelle": return { bg: "#cfe2ff", color: "#084298" };
      case "planifiee": return { bg: "#d1ecf1", color: "#0c5460" };
      case "en_cours": return { bg: "#fff3cd", color: "#856404" };
      case "terminee": return { bg: "#d1e7dd", color: "#0a3622" };
      default: return { bg: "#e2e3e5", color: "#41464b" };
    }
  };

  const getUrgenceColor = (urgence) => {
    switch (urgence) {
      case "haute": return { bg: "#f8d7da", color: "#721c24" };
      case "moyenne": return { bg: "#fff3cd", color: "#856404" };
      case "basse": return { bg: "#d1e7dd", color: "#0a3622" };
      default: return { bg: "#e2e3e5", color: "#41464b" };
    }
  };

  return (
    <DemoLayout role="entreprise" activePage="/demo/entreprise/missions">
      <h1 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>📋 Suivi des Missions</h1>

      <div style={{
        backgroundColor: "#fff3cd",
        padding: "1rem",
        borderRadius: "5px",
        marginBottom: "1.5rem",
        borderLeft: "4px solid #ffc107"
      }}>
        <strong>ℹ️ Mode Démo :</strong> Missions fictives. Aucune action réelle n'est possible.
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
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3498db" }}>1</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>Nouvelles</div>
        </div>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#f39c12" }}>3</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>En cours</div>
        </div>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#27ae60" }}>42</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>Complétées</div>
        </div>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#e67e22" }}>12500 €</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>CA ce mois</div>
        </div>
      </div>

      <div style={{
        display: "flex",
        gap: "1rem",
        marginBottom: "1.5rem"
      }}>
        <select disabled style={{
          padding: "0.75rem",
          border: "1px solid #ddd",
          borderRadius: "5px",
          opacity: 0.6
        }}>
          <option>Tous les statuts</option>
        </select>
        <select disabled style={{
          padding: "0.75rem",
          border: "1px solid #ddd",
          borderRadius: "5px",
          opacity: 0.6
        }}>
          <option>Toutes les urgences</option>
        </select>
        <input
          type="text"
          placeholder="Rechercher..."
          disabled
          style={{
            flex: 1,
            padding: "0.75rem",
            border: "1px solid #ddd",
            borderRadius: "5px",
            opacity: 0.6
          }}
        />
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
              <th style={{ padding: "1rem", textAlign: "left" }}>Référence</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Type</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Régie</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Adresse</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Technicien</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>Urgence</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>Statut</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>Montant</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {missions.map((mission) => {
              const statutStyle = getStatutColor(mission.statut);
              const urgenceStyle = getUrgenceColor(mission.urgence);
              
              return (
                <tr key={mission.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                  <td style={{ padding: "1rem" }}>
                    <strong>{mission.ref}</strong>
                  </td>
                  <td style={{ padding: "1rem", fontSize: "0.9rem" }}>
                    🔧 {mission.type}
                  </td>
                  <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#666" }}>
                    {mission.regie}
                  </td>
                  <td style={{ padding: "1rem", fontSize: "0.9rem" }}>
                    📍 {mission.adresse}
                  </td>
                  <td style={{ padding: "1rem", fontSize: "0.9rem" }}>
                    👷 {mission.technicien}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <span style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "12px",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      backgroundColor: urgenceStyle.bg,
                      color: urgenceStyle.color
                    }}>
                      {mission.urgence.toUpperCase()}
                    </span>
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
                      {mission.statut.toUpperCase().replace("_", " ")}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center", fontWeight: "bold", color: "#27ae60" }}>
                    {mission.montant} €
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </DemoLayout>
  );
}

export default withDemoAccess(DemoEntrepriseMissions);
