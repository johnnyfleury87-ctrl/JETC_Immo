import { useState } from "react";
import DemoLayout from "../../../components/demo/DemoLayout";

export default function DemoLocataireMessages() {
  const [messages] = useState([
    {
      id: 1,
      de: "Régie Horizon",
      sujet: "Intervention programmée",
      date: "2025-12-10",
      preview: "Bonjour, nous vous informons qu une intervention est programmée...",
      lu: false
    },
    {
      id: 2,
      de: "Technicien - Jean Dupont",
      sujet: "Confirmation RDV fuite",
      date: "2025-12-09",
      preview: "Bonjour, je confirme mon passage demain matin à 10h pour...",
      lu: true
    },
    {
      id: 3,
      de: "Régie Horizon",
      sujet: "Quittance de loyer Décembre",
      date: "2025-12-01",
      preview: "Votre quittance de loyer pour le mois de décembre est disponible...",
      lu: true
    }
  ]);

  return (
    <DemoLayout role="locataire" activePage="/demo/locataire/messages">
      <h1 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>💬 Messagerie</h1>

      <div style={{
        backgroundColor: "#fff3cd",
        padding: "1rem",
        borderRadius: "5px",
        marginBottom: "1.5rem",
        borderLeft: "4px solid #ffc107"
      }}>
        <strong>ℹ️ Mode Démo :</strong> Messages fictifs. Aucune action possible.
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
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3498db" }}>3</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>Total messages</div>
        </div>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#e74c3c" }}>1</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>Non lus</div>
        </div>
      </div>

      <button style={{
        marginBottom: "1.5rem",
        padding: "0.75rem 1.5rem",
        backgroundColor: "#3498db",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "not-allowed",
        opacity: 0.6,
        fontWeight: "bold"
      }}
      title="Disponible en version PRO">
        ✉️ Nouveau message
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            backgroundColor: msg.lu ? "white" : "#e7f3ff",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            borderLeft: msg.lu ? "4px solid #ddd" : "4px solid #3498db",
            cursor: "pointer"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
              <div>
                <div style={{
                  fontWeight: msg.lu ? "normal" : "bold",
                  color: "#2c3e50",
                  fontSize: "0.9rem",
                  marginBottom: "0.25rem"
                }}>
                  De: {msg.de}
                </div>
                <h3 style={{
                  margin: 0,
                  color: "#2c3e50",
                  fontWeight: msg.lu ? "normal" : "bold"
                }}>
                  {msg.sujet}
                </h3>
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                <span style={{ fontSize: "0.85rem", color: "#666" }}>📅 {msg.date}</span>
                {!msg.lu && (
                  <span style={{
                    padding: "0.25rem 0.5rem",
                    backgroundColor: "#3498db",
                    color: "white",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: "bold"
                  }}>
                    NOUVEAU
                  </span>
                )}
              </div>
            </div>
            <p style={{ margin: "0.5rem 0 0 0", color: "#666", fontSize: "0.9rem" }}>
              {msg.preview}
            </p>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: "1.5rem",
        padding: "1rem",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h3 style={{ marginTop: 0, color: "#2c3e50" }}>💡 Astuce</h3>
        <p style={{ margin: 0, color: "#666", fontSize: "0.9rem" }}>
          Utilisez la messagerie pour communiquer avec votre régie et suivre l avancement de vos tickets. 
          Toutes vos conversations sont archivées et accessibles à tout moment.
        </p>
      </div>
    </DemoLayout>
  );
}
