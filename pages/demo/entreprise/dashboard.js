import { useState } from "react";
import Layout from "../../../components/Layout";
import Card from "../../../components/UI/Card";

export default function DemoEntrepriseDashboard() {
  const [overview] = useState({
    missionsEnCours: 6,
    missionsCompletees: 42,
    techniciensActifs: 5,
    ca_mois: 12500,
  });

  const [missions] = useState([
    {
      id: 1,
      titre: "Réparation fuite d'eau",
      regie: "Régie Horizon",
      statut: "en_cours",
      technicien: "Jean Dupont",
      priorite: "haute",
    },
    {
      id: 2,
      titre: "Installation chauffage",
      regie: "Gestion Plus",
      statut: "en_cours",
      technicien: "Marie Martin",
      priorite: "normale",
    },
    {
      id: 3,
      titre: "Dépannage électrique",
      regie: "Régie Central",
      statut: "planifiee",
      technicien: "Non assigné",
      priorite: "moyenne",
    },
  ]);

  return (
    <Layout>
      <Card>
        {/* Badge MODE DÉMONSTRATION */}
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            padding: "1rem 1.5rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            textAlign: "center",
            fontSize: "1rem",
            fontWeight: "700",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
          }}
        >
          🎭 MODE DÉMONSTRATION • Données fictives
        </div>

        <h1 className="page-title">🏢 Dashboard DEMO – Entreprise</h1>

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
              background: "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
              color: "white",
            }}
          >
            <h2 style={{ fontSize: "2.5rem", margin: 0 }}>
              {overview.missionsEnCours}
            </h2>
            <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>
              🚀 Missions en cours
            </p>
          </Card>

          <Card
            style={{
              textAlign: "center",
              background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
              color: "white",
            }}
          >
            <h2 style={{ fontSize: "2.5rem", margin: 0 }}>
              {overview.missionsCompletees}
            </h2>
            <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>
              ✅ Missions complétées
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
              {overview.techniciensActifs}
            </h2>
            <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>
              👨‍🔧 Techniciens actifs
            </p>
          </Card>

          <Card
            style={{
              textAlign: "center",
              background: "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)",
              color: "white",
            }}
          >
            <h2 style={{ fontSize: "2.5rem", margin: 0 }}>
              {overview.ca_mois}€
            </h2>
            <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>
              💰 CA du mois
            </p>
          </Card>
        </div>

        {/* Liste missions */}
        <Card style={{ marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>📋 Missions récentes</h2>
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
                    Régie
                  </th>
                  <th style={{ padding: "0.75rem", textAlign: "center" }}>
                    Technicien
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
                {missions.map((mission) => (
                  <tr
                    key={mission.id}
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}
                  >
                    <td style={{ padding: "0.75rem" }}>{mission.titre}</td>
                    <td style={{ padding: "0.75rem" }}>{mission.regie}</td>
                    <td style={{ padding: "0.75rem", textAlign: "center" }}>
                      👨‍🔧 {mission.technicien}
                    </td>
                    <td style={{ padding: "0.75rem", textAlign: "center" }}>
                      <span
                        style={{
                          background:
                            mission.statut === "en_cours"
                              ? "var(--green)"
                              : "var(--orange)",
                          color: "white",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontWeight: "600",
                        }}
                      >
                        {mission.statut === "en_cours"
                          ? "En cours"
                          : "Planifiée"}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem", textAlign: "center" }}>
                      <span
                        style={{
                          background:
                            mission.priorite === "haute"
                              ? "var(--red)"
                              : mission.priorite === "moyenne"
                                ? "var(--orange)"
                                : "var(--blue)",
                          color: "white",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontWeight: "600",
                        }}
                      >
                        {mission.priorite === "haute"
                          ? "🔴 Haute"
                          : mission.priorite === "moyenne"
                            ? "🟠 Moyenne"
                            : "🔵 Normale"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
      </Card>
    </Layout>
  );
}
