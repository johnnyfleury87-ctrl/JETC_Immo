import { useState } from "react";
import DemoLayout from "../../../components/demo/DemoLayout";
import withDemoAccess from "../../../lib/withDemoAccess";

function DemoLocataireTickets() {
  const [tickets] = useState([
    { id: 1, ref: "TKT-001", titre: "Fuite d eau salle de bain", categorie: "Plomberie", date: "2025-12-10", statut: "en_cours", priorite: "haute", description: "Fuite importante sous le lavabo" },
    { id: 2, ref: "TKT-002", titre: "Ampoule grillée couloir", categorie: "Électricité", date: "2025-12-11", statut: "ouvert", priorite: "basse", description: "Ampoule du couloir principal grillée" },
    { id: 3, ref: "TKT-006", titre: "Radiateur chambre", categorie: "Chauffage", date: "2025-11-28", statut: "resolu", priorite: "moyenne", description: "Radiateur chambre ne chauffait pas assez" },
    { id: 4, ref: "TKT-012", titre: "VMC bruyante", categorie: "Ventilation", date: "2025-11-15", statut: "resolu", priorite: "basse", description: "Bruit anormal de la VMC" }
  ]);

  const getStatutColor = (statut) => {
    switch (statut) {
      case "ouvert": return { bg: "#fff3cd", color: "#856404" };
      case "en_cours": return { bg: "#cfe2ff", color: "#084298" };
      case "resolu": return { bg: "#d1e7dd", color: "#0a3622" };
      default: return { bg: "#e2e3e5", color: "#41464b" };
    }
  };

  const getPrioriteColor = (priorite) => {
    switch (priorite) {
      case "haute": return { bg: "#f8d7da", color: "#721c24" };
      case "moyenne": return { bg: "#fff3cd", color: "#856404" };
      case "basse": return { bg: "#d1e7dd", color: "#0a3622" };
      default: return { bg: "#e2e3e5", color: "#41464b" };
    }
  };

  return (
    <DemoLayout role="locataire" activePage="/demo/locataire/tickets">
      <h1 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>🎫 Mes Tickets</h1>

      <div style={{
        backgroundColor: "#fff3cd",
        padding: "1rem",
        borderRadius: "5px",
        marginBottom: "1.5rem",
        borderLeft: "4px solid #ffc107"
      }}>
        <strong>ℹ️ Mode Démo :</strong> Tickets fictifs. Aucune modification possible.
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
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>Tickets ouverts</div>
        </div>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3498db" }}>1</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>En cours</div>
        </div>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#27ae60" }}>8</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>Résolus</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {tickets.map((ticket) => {
          const statutStyle = getStatutColor(ticket.statut);
          const prioriteStyle = getPrioriteColor(ticket.priorite);
          
          return (
            <div key={ticket.id} style={{
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              borderLeft: `4px solid ${prioriteStyle.color}`
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                <div>
                  <h3 style={{ margin: "0 0 0.5rem 0", color: "#2c3e50" }}>
                    {ticket.ref} - {ticket.titre}
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
                    🔧 {ticket.categorie} • 📅 {ticket.date}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "12px",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    backgroundColor: prioriteStyle.bg,
                    color: prioriteStyle.color
                  }}>
                    {ticket.priorite.toUpperCase()}
                  </span>
                  <span style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "12px",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    backgroundColor: statutStyle.bg,
                    color: statutStyle.color
                  }}>
                    {ticket.statut.toUpperCase().replace("_", " ")}
                  </span>
                </div>
              </div>
              
              <p style={{ margin: "0 0 1rem 0", color: "#555" }}>
                {ticket.description}
              </p>
              
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
          );
        })}
      </div>
    </DemoLayout>
  );
}

export default withDemoAccess(DemoLocataireTickets);
