import { useState } from "react";
import DemoLayout from "../../../components/demo/DemoLayout";

export default function DemoRegieLogements() {
  const [logements] = useState([
    { id: 1, reference: "A101", adresse: "12 Rue des Lilas", type: "T2", surface: 45, loyer: 680, statut: "occupé", locataire: "Dupont Marie" },
    { id: 2, reference: "A204", adresse: "12 Rue des Lilas", type: "T3", surface: 62, loyer: 850, statut: "préavis", locataire: "Petit Lucas" },
    { id: 3, reference: "B108", adresse: "34 Avenue Victor Hugo", type: "T1", surface: 28, loyer: 520, statut: "occupé", locataire: "Moreau Thomas" },
    { id: 4, reference: "B205", adresse: "34 Avenue Victor Hugo", type: "T4", surface: 85, loyer: 1200, statut: "occupé", locataire: "Martin Pierre" },
    { id: 5, reference: "C302", adresse: "8 Rue des Érables", type: "T3", surface: 65, loyer: 890, statut: "occupé", locataire: "Bernard Sophie" },
    { id: 6, reference: "C405", adresse: "8 Rue des Érables", type: "T2", surface: 48, loyer: 720, statut: "vacant", locataire: null },
    { id: 7, reference: "D101", adresse: "56 Boulevard Haussmann", type: "T5", surface: 110, loyer: 1650, statut: "occupé", locataire: "Dubois Camille" },
    { id: 8, reference: "D203", adresse: "56 Boulevard Haussmann", type: "T3", surface: 70, loyer: 950, statut: "vacant", locataire: null }
  ]);

  return (
    <DemoLayout role="regie" activePage="/demo/regie/logements">
      <h1 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>🏢 Gestion des Logements</h1>

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
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "1.5rem"
      }}>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3498db" }}>34</div>
          <div style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.5rem" }}>Total logements</div>
        </div>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#27ae60" }}>30</div>
          <div style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.5rem" }}>Occupés</div>
        </div>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#e74c3c" }}>2</div>
          <div style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.5rem" }}>Vacants</div>
        </div>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#f39c12" }}>2</div>
          <div style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.5rem" }}>Préavis</div>
        </div>
      </div>

      <div style={{
        display: "flex",
        gap: "1rem",
        marginBottom: "1.5rem"
      }}>
        <button style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: "#3498db",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "not-allowed",
          opacity: 0.6
        }}
        title="Disponible en version PRO">
          + Nouveau logement
        </button>
        <select disabled style={{
          padding: "0.75rem",
          border: "1px solid #ddd",
          borderRadius: "5px",
          opacity: 0.6
        }}>
          <option>Tous les statuts</option>
        </select>
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
              <th style={{ padding: "1rem", textAlign: "left" }}>Adresse</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>Type</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>Surface</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>Loyer</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>Statut</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Locataire</th>
            </tr>
          </thead>
          <tbody>
            {logements.map((log) => (
              <tr key={log.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                <td style={{ padding: "1rem" }}>
                  <strong>{log.reference}</strong>
                </td>
                <td style={{ padding: "1rem", fontSize: "0.9rem" }}>
                  {log.adresse}
                </td>
                <td style={{ padding: "1rem", textAlign: "center", fontWeight: "bold" }}>
                  {log.type}
                </td>
                <td style={{ padding: "1rem", textAlign: "center" }}>
                  {log.surface} m²
                </td>
                <td style={{ padding: "1rem", textAlign: "center", fontWeight: "bold", color: "#27ae60" }}>
                  {log.loyer} €
                </td>
                <td style={{ padding: "1rem", textAlign: "center" }}>
                  <span style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "12px",
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                    backgroundColor: log.statut === "occupé" ? "#d4edda" : log.statut === "préavis" ? "#fff3cd" : "#f8d7da",
                    color: log.statut === "occupé" ? "#155724" : log.statut === "préavis" ? "#856404" : "#721c24"
                  }}>
                    {log.statut.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#666" }}>
                  {log.locataire || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DemoLayout>
  );
}
