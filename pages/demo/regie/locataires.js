import { useState } from "react";
import DemoLayout from "../../../components/demo/DemoLayout";

export default function DemoRegieLocataires() {
  const [locataires] = useState([
    { id: 1, nom: "Dupont", prenom: "Marie", logement: "A101 - 12 Rue des Lilas", telephone: "06 12 34 56 78", email: "marie.dupont@email.fr", statut: "actif" },
    { id: 2, nom: "Martin", prenom: "Pierre", logement: "B205 - 34 Avenue Victor Hugo", telephone: "06 23 45 67 89", email: "p.martin@email.fr", statut: "actif" },
    { id: 3, nom: "Bernard", prenom: "Sophie", logement: "C302 - 8 Rue des Érables", telephone: "06 34 56 78 90", email: "sophie.b@email.fr", statut: "actif" },
    { id: 4, nom: "Petit", prenom: "Lucas", logement: "A204 - 12 Rue des Lilas", telephone: "06 45 67 89 01", email: "lucas.petit@email.fr", statut: "préavis" },
    { id: 5, nom: "Dubois", prenom: "Camille", logement: "D101 - 56 Boulevard Haussmann", telephone: "06 56 78 90 12", email: "c.dubois@email.fr", statut: "actif" },
    { id: 6, nom: "Moreau", prenom: "Thomas", logement: "B108 - 34 Avenue Victor Hugo", telephone: "06 67 89 01 23", email: "thomas.m@email.fr", statut: "retard" }
  ]);

  return (
    <DemoLayout role="regie" activePage="/demo/regie/locataires">
      <h1 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>👥 Gestion des Locataires</h1>

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
          + Nouveau locataire
        </button>
        <input
          type="text"
          placeholder="Rechercher un locataire..."
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
              <th style={{ padding: "1rem", textAlign: "left" }}>Nom</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Logement</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Contact</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>Statut</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {locataires.map((loc) => (
              <tr key={loc.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                <td style={{ padding: "1rem" }}>
                  <strong>{loc.prenom} {loc.nom}</strong>
                </td>
                <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#666" }}>
                  {loc.logement}
                </td>
                <td style={{ padding: "1rem", fontSize: "0.9rem" }}>
                  📞 {loc.telephone}<br />
                  📧 {loc.email}
                </td>
                <td style={{ padding: "1rem", textAlign: "center" }}>
                  <span style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "12px",
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                    backgroundColor: loc.statut === "actif" ? "#d4edda" : loc.statut === "préavis" ? "#fff3cd" : "#f8d7da",
                    color: loc.statut === "actif" ? "#155724" : loc.statut === "préavis" ? "#856404" : "#721c24"
                  }}>
                    {loc.statut.toUpperCase()}
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
                    Voir détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{
        marginTop: "1.5rem",
        padding: "1rem",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h3 style={{ marginTop: 0, color: "#2c3e50" }}>📊 Statistiques</h3>
        <div style={{ display: "flex", gap: "2rem", marginTop: "1rem" }}>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#27ae60" }}>6</div>
            <div style={{ fontSize: "0.9rem", color: "#666" }}>Locataires actifs</div>
          </div>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#f39c12" }}>1</div>
            <div style={{ fontSize: "0.9rem", color: "#666" }}>Préavis en cours</div>
          </div>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#e74c3c" }}>1</div>
            <div style={{ fontSize: "0.9rem", color: "#666" }}>Retard de paiement</div>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}
