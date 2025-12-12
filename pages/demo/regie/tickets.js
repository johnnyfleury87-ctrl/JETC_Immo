import { useState } from "react";
import DemoLayout from "../../../components/demo/DemoLayout";

export default function DemoRegieTickets() {
  const [tickets] = useState([
    { id: 1, reference: "TKT-001", locataire: "Dupont Marie", logement: "A101", categorie: "Plomberie", urgence: "haute", statut: "ouvert", date: "2025-12-10", description: "Fuite sous l'évier" },
    { id: 2, reference: "TKT-002", locataire: "Martin Pierre", logement: "B205", categorie: "Électricité", urgence: "moyenne", statut: "en cours", date: "2025-12-09", description: "Panne électrique salon" },
    { id: 3, reference: "TKT-003", locataire: "Bernard Sophie", logement: "C302", categorie: "Chauffage", urgence: "haute", statut: "attente diffusion", date: "2025-12-11", description: "Radiateur ne chauffe plus" },
    { id: 4, reference: "TKT-004", locataire: "Moreau Thomas", logement: "B108", categorie: "Serrurerie", urgence: "basse", statut: "ouvert", date: "2025-12-08", description: "Porte difficile à fermer" },
    { id: 5, reference: "TKT-005", locataire: "Dubois Camille", logement: "D101", categorie: "Plomberie", urgence: "moyenne", statut: "en cours", date: "2025-12-07", description: "WC qui fuit légèrement" },
    { id: 6, reference: "TKT-006", locataire: "Petit Lucas", logement: "A204", categorie: "Ventilation", urgence: "basse", statut: "résolu", date: "2025-12-05", description: "VMC bruyante" }
  ]);

  const getUrgenceColor = (urgence) => {
    switch (urgence) {
      case "haute": return { bg: "#fee", color: "#c00" };
      case "moyenne": return { bg: "#ffe", color: "#c60" };
      case "basse": return { bg: "#efe", color: "#060" };
      default: return { bg: "#eee", color: "#666" };
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case "ouvert": return { bg: "#fff3cd", color: "#856404" };
      case "en cours": return { bg: "#cfe2ff", color: "#084298" };
      case "attente diffusion": return { bg: "#f8d7da", color: "#721c24" };
      case "résolu": return { bg: "#d1e7dd", color: "#0a3622" };
      default: return { bg: "#e2e3e5", color: "#41464b" };
    }
  };

  return (
    <DemoLayout role="regie" activePage="/demo/regie/tickets">
      <h1 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>🎫 Gestion des Tickets</h1>

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
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#f39c12" }}>12</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>Tickets ouverts</div>
        </div>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3498db" }}>8</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>En cours</div>
        </div>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#e74c3c" }}>5</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>Attente diffusion</div>
        </div>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#27ae60" }}>45</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>Résolus ce mois</div>
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

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {tickets.map((ticket) => {
          const urgenceStyle = getUrgenceColor(ticket.urgence);
          const statutStyle = getStatutColor(ticket.statut);
          
          return (
            <div key={ticket.id} style={{
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              borderLeft: `4px solid ${urgenceStyle.color}`
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                <div>
                  <h3 style={{ margin: "0 0 0.5rem 0", color: "#2c3e50" }}>
                    {ticket.reference} - {ticket.categorie}
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
                    📍 {ticket.locataire} • Logement {ticket.logement}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "12px",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    backgroundColor: urgenceStyle.bg,
                    color: urgenceStyle.color
                  }}>
                    {ticket.urgence.toUpperCase()}
                  </span>
                  <span style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "12px",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    backgroundColor: statutStyle.bg,
                    color: statutStyle.color
                  }}>
                    {ticket.statut.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <p style={{ margin: "0 0 1rem 0", color: "#555" }}>
                {ticket.description}
              </p>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "#999" }}>
                  📅 {ticket.date}
                </span>
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
          );
        })}
      </div>
    </DemoLayout>
  );
}
