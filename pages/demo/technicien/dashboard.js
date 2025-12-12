import { useState } from "react";
import DemoLayout from "../../../components/demo/DemoLayout";
import Card from "../../../components/UI/Card";
import withDemoAccess from "../../../lib/withDemoAccess";

function DemoTechnicienDashboard() {
  const [overview] = useState({
    missionsAVenir: 4,
    missionsEnCours: 2,
    missionsCompletees: 38,
    tauxReussite: 94,
  });

  const [missions] = useState([
    {
      id: 1,
      titre: "Réparation fuite d'eau",
      adresse: "12 rue des Érables, 75001 Paris",
      date: "2025-12-12",
      statut: "en_cours",
      priorite: "haute",
    },
    {
      id: 2,
      titre: "Installation chauffage",
      adresse: "45 avenue Victor Hugo, 75016 Paris",
      date: "2025-12-13",
      statut: "planifiee",
      priorite: "normale",
    },
    {
      id: 3,
      titre: "Dépannage électrique",
      adresse: "8 boulevard Saint-Germain, 75005 Paris",
      date: "2025-12-14",
      statut: "planifiee",
      priorite: "moyenne",
    },
  ]);

  return (
    <DemoLayout role="technicien" activePage="/demo/technicien/dashboard">
      <h1 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>🔧 Dashboard Technicien</h1>

      <div style={{
        backgroundColor: "#fff3cd",
        padding: "1rem",
        borderRadius: "5px",
        marginBottom: "1.5rem",
        borderLeft: "4px solid #ffc107"
      }}>
        <strong>ℹ️ Mode Démo :</strong> Aperçu fictif du tableau de bord technicien.
      </div>

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
            background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
            color: "white",
          }}
        >
          <h2 style={{ fontSize: "2.5rem", margin: 0 }}>
            {overview.missionsAVenir}
          </h2>
          <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>
            📅 Missions à venir
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
            {overview.missionsEnCours}
          </h2>
          <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>
            🚀 En cours
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
            ✅ Complétées
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
            {overview.tauxReussite}%
          </h2>
          <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>
            ⭐ Taux de réussite
          </p>
        </Card>
      </div>

      {/* Liste missions */}
      <Card style={{ marginBottom: "2rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>📋 Mes missions</h2>
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
                  Adresse
                </th>
                <th style={{ padding: "0.75rem", textAlign: "center" }}>
                  Date
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
                  <td style={{ padding: "0.75rem" }}>📍 {mission.adresse}</td>
                  <td style={{ padding: "0.75rem", textAlign: "center" }}>
                    {new Date(mission.date).toLocaleDateString()}
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
    </DemoLayout>
  );
}

export default withDemoAccess(DemoTechnicienDashboard);
