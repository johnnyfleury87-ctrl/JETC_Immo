import { useState } from "react";
import DemoLayout from "../../../components/demo/DemoLayout";
import Card from "../../../components/UI/Card";

export default function DemoLocataireDashboard() {
  const [overview] = useState({
    ticketsOuverts: 2,
    ticketsEnCours: 1,
    ticketsResolus: 8,
  });

  const [tickets] = useState([
    {
      id: 1,
      titre: "Fuite d'eau salle de bain",
      categorie: "Plomberie",
      date: "2025-12-10",
      statut: "en_cours",
      priorite: "haute",
    },
    {
      id: 2,
      titre: "Ampoule grillée couloir",
      categorie: "Électricité",
      date: "2025-12-11",
      statut: "ouvert",
      priorite: "basse",
    },
    {
      id: 3,
      titre: "Problème chauffage chambre",
      categorie: "Chauffage",
      date: "2025-12-09",
      statut: "resolu",
      priorite: "moyenne",
    },
  ]);

  return (
    <DemoLayout role="locataire" activePage="/demo/locataire/dashboard">
      <div style={{
        backgroundColor: "#fff3cd",
        padding: "1rem",
        borderRadius: "5px",
        marginBottom: "1.5rem",
        borderLeft: "4px solid #ffc107"
      }}>
        <strong>ℹ️ Mode Démo :</strong> Toutes les données affichées sont fictives. Navigation complète disponible.
      </div>

      <h1 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>🏠 Dashboard Locataire</h1>

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <Card
          style={{
            textAlign: "center",
            background: "linear-gradient(135deg, #F44336 0%, #D32F2F 100%)",
            color: "white",
          }}
        >
          <h2 style={{ fontSize: "2.5rem", margin: 0 }}>
            {overview.ticketsOuverts}
          </h2>
          <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>
              🎫 Tickets ouverts
            </p>
          </Card>

          <Card
            style={{
              textAlign: "center",
              background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
              color: "white",
            }}
          >
            <h2 style={{ fontSize: "2.5rem", margin: 0 }}>
              {overview.ticketsEnCours}
            </h2>
            <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>
              🚀 En cours
            </p>
          </Card>

          <Card
            style={{
              textAlign: "center",
              background: "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
              color: "white",
            }}
          >
            <h2 style={{ fontSize: "2.5rem", margin: 0 }}>
              {overview.ticketsResolus}
            </h2>
            <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>
              ✅ Résolus
            </p>
          </Card>
        </div>

        {/* Liste tickets */}
        <Card style={{ marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>📋 Mes tickets</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    background: "var(--background)",
                    borderBottom: "2px solid var(--primary)",
                  }}
                >
                  <th style={{ padding: "0.75rem", textAlign: "left" }}>
                    Titre
                  </th>
                  <th style={{ padding: "0.75rem", textAlign: "left" }}>
                    Catégorie
                  </th>
                  <th style={{ padding: "0.75rem", textAlign: "center" }}>
                    Date création
                  </th>
                  <th style={{ padding: "0.75rem", textAlign: "center" }}>
                    Statut
                  </th>
                  <th style={{ padding: "0.75rem", textAlign: "center" }}>
                    Priorité
                  </th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}
                  >
                    <td style={{ padding: "0.75rem" }}>{ticket.titre}</td>
                    <td style={{ padding: "0.75rem" }}>🔧 {ticket.categorie}</td>
                    <td style={{ padding: "0.75rem", textAlign: "center" }}>
                      {new Date(ticket.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "0.75rem", textAlign: "center" }}>
                      <span
                        style={{
                          background:
                            ticket.statut === "resolu"
                              ? "var(--green)"
                              : ticket.statut === "en_cours"
                                ? "var(--orange)"
                                : "var(--red)",
                          color: "white",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontWeight: "600",
                        }}
                      >
                        {ticket.statut === "resolu"
                          ? "✅ Résolu"
                          : ticket.statut === "en_cours"
                            ? "🚀 En cours"
                            : "🎫 Ouvert"}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem", textAlign: "center" }}>
                      <span
                        style={{
                          background:
                            ticket.priorite === "haute"
                              ? "var(--red)"
                              : ticket.priorite === "moyenne"
                                ? "var(--orange)"
                                : "var(--blue)",
                          color: "white",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontWeight: "600",
                        }}
                      >
                        {ticket.priorite === "haute"
                          ? "🔴 Haute"
                          : ticket.priorite === "moyenne"
                            ? "🟠 Moyenne"
                            : "🔵 Basse"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Info logement */}
        <Card style={{ marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>🏠 Mon logement</h2>
          <div style={{ padding: "1rem" }}>
            <p>
              <strong>Adresse :</strong> 12 rue des Érables, Appt 4B, 75001
              Paris
            </p>
            <p>
              <strong>Type :</strong> Appartement T3
            </p>
            <p>
              <strong>Surface :</strong> 65m²
            </p>
            <p>
              <strong>Régie :</strong> Régie Horizon
            </p>
          </div>
        </Card>

        {/* Bouton retour hub */}
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <button
            onClick={() => (window.location.href = "/demo-hub")}
            style={{
              background: "var(--primary)",
              color: "white",
              padding: "0.75rem 1.5rem",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            ← Retour au hub DEMO
          </button>
        </div>
    </DemoLayout>
  );
}
