import { useState } from "react";
import DemoLayout from "../../../components/demo/DemoLayout";
import Card from "../../../components/UI/Card";
import HeatmapImmeubles from "../../../components/charts/HeatmapImmeubles";
import PieCategories from "../../../components/charts/PieCategories";
import withDemoAccess from "../../../lib/withDemoAccess";

function DemoRegieDashboard() {
  // Données mockées LOCALES uniquement
  const [overview] = useState({
    ticketsOuverts: 12,
    ticketsAttenteDiffusion: 5,
    missionsEnCours: 8,
    logementsActifs: 34,
  });

  const [interventionsImmeubles] = useState([
    { immeuble: "Résidence Les Érables", interventions: 8 },
    { immeuble: "Tour Horizon", interventions: 5 },
    { immeuble: "Immeuble Central", interventions: 12 },
    { immeuble: "Villa Soleil", interventions: 3 },
  ]);

  const [techniciens] = useState([
    {
      nom: "Jean Dupont",
      missions_effectuees: 24,
      taux_reussite: 95,
      temps_moyen: 2,
    },
    {
      nom: "Marie Martin",
      missions_effectuees: 18,
      taux_reussite: 92,
      temps_moyen: 3,
    },
    {
      nom: "Luc Bernard",
      missions_effectuees: 15,
      taux_reussite: 88,
      temps_moyen: 2.5,
    },
  ]);

  const [categories] = useState([
    { label: "Plomberie", value: 35 },
    { label: "Électricité", value: 28 },
    { label: "Serrurerie", value: 15 },
    { label: "Autres", value: 22 },
  ]);

  const [delais] = useState({
    moyenne: 3,
    tendance: [4, 3.5, 3, 2.5, 3, 2.8, 3],
  });

  const [urgences] = useState([
    {
      titre: "Fuite d'eau importante",
      locataire_nom: "Sophie Dubois",
      date_creation: "2025-12-10",
      priorite: "haute",
    },
    {
      titre: "Panne électrique appartement",
      locataire_nom: "Pierre Laurent",
      date_creation: "2025-12-11",
      priorite: "haute",
    },
    {
      titre: "Porte d'entrée bloquée",
      locataire_nom: "Claire Petit",
      date_creation: "2025-12-11",
      priorite: "moyenne",
    },
  ]);

  return (
    <DemoLayout role="regie" activePage="/demo/regie/dashboard">
      <div style={{
        backgroundColor: "#fff3cd",
        padding: "1rem",
        borderRadius: "5px",
        marginBottom: "1.5rem",
        borderLeft: "4px solid #ffc107"
      }}>
        <strong>ℹ️ Mode Démo :</strong> Toutes les données affichées sont fictives. Navigation complète disponible.
      </div>

      <h1 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>🏢 Dashboard Régie</h1>

      {/* SECTION A - Vue globale */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <Card
          className="hover-glow"
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
            className="hover-glow"
            style={{
              textAlign: "center",
              background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
              color: "white",
            }}
          >
            <h2 style={{ fontSize: "2.5rem", margin: 0 }}>
              {overview.ticketsAttenteDiffusion}
            </h2>
            <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>
              ⏳ En attente diffusion
            </p>
          </Card>

          <Card
            className="hover-glow"
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
            className="hover-glow"
            style={{
              textAlign: "center",
              background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
              color: "white",
            }}
          >
            <h2 style={{ fontSize: "2.5rem", margin: 0 }}>
              {overview.logementsActifs}
            </h2>
            <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>
              🏠 Logements actifs
            </p>
          </Card>
        </div>

        {/* SECTION B - Heatmap interventions */}
        <Card style={{ marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>
            🗺️ Interventions par immeuble
          </h2>
          <HeatmapImmeubles data={interventionsImmeubles} />
        </Card>

        {/* SECTION C - Performance techniciens */}
        <Card style={{ marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>⚙️ Performance techniciens</h2>
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
                    Nom
                  </th>
                  <th style={{ padding: "0.75rem", textAlign: "center" }}>
                    Missions effectuées
                  </th>
                  <th style={{ padding: "0.75rem", textAlign: "center" }}>
                    Taux de réussite
                  </th>
                  <th style={{ padding: "0.75rem", textAlign: "center" }}>
                    Temps moyen
                  </th>
                </tr>
              </thead>
              <tbody>
                {techniciens.map((tech, index) => (
                  <tr
                    key={index}
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}
                  >
                    <td style={{ padding: "0.75rem" }}>👨‍🔧 {tech.nom}</td>
                    <td style={{ padding: "0.75rem", textAlign: "center" }}>
                      {tech.missions_effectuees}
                    </td>
                    <td style={{ padding: "0.75rem", textAlign: "center" }}>
                      <span
                        style={{
                          background:
                            tech.taux_reussite >= 80
                              ? "var(--green)"
                              : "var(--orange)",
                          color: "white",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontWeight: "600",
                        }}
                      >
                        {tech.taux_reussite}%
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem", textAlign: "center" }}>
                      {tech.temps_moyen} jours
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {/* SECTION D - Répartition catégories */}
          <Card>
            <h2 style={{ marginBottom: "1rem" }}>📊 Catégories de tickets</h2>
            <PieCategories data={categories} />
          </Card>

          {/* SECTION E - Délai moyen */}
          <Card>
            <h2 style={{ marginBottom: "1rem" }}>
              ⏱️ Délai moyen de résolution
            </h2>
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <h3
                style={{ fontSize: "3rem", margin: 0, color: "var(--primary)" }}
              >
                {delais.moyenne}{" "}
                <span style={{ fontSize: "1.5rem", opacity: 0.7 }}>jours</span>
              </h3>
              {delais.tendance && delais.tendance.length > 0 && (
                <div
                  style={{
                    marginTop: "1rem",
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "0.25rem",
                    height: "60px",
                    justifyContent: "center",
                  }}
                >
                  {delais.tendance.map((val, idx) => {
                    const maxVal = Math.max(...delais.tendance);
                    const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
                    return (
                      <div
                        key={idx}
                        style={{
                          width: "30px",
                          height: `${height}%`,
                          background: "var(--accent)",
                          borderRadius: "2px",
                          minHeight: "5px",
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* SECTION F - Liste urgences */}
        <Card>
          <h2 style={{ marginBottom: "1rem" }}>🚨 Urgences en cours</h2>
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
                    Locataire
                  </th>
                  <th style={{ padding: "0.75rem", textAlign: "center" }}>
                    Date création
                  </th>
                  <th style={{ padding: "0.75rem", textAlign: "center" }}>
                    Priorité
                  </th>
                </tr>
              </thead>
              <tbody>
                {urgences.map((urgence, index) => (
                  <tr
                    key={index}
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}
                  >
                    <td style={{ padding: "0.75rem" }}>{urgence.titre}</td>
                    <td style={{ padding: "0.75rem" }}>
                      👤 {urgence.locataire_nom}
                    </td>
                    <td style={{ padding: "0.75rem", textAlign: "center" }}>
                      {new Date(urgence.date_creation).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "0.75rem", textAlign: "center" }}>
                      <span
                        style={{
                          background:
                            urgence.priorite === "haute"
                              ? "var(--red)"
                              : urgence.priorite === "moyenne"
                                ? "var(--orange)"
                                : "var(--blue)",
                          color: "white",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontWeight: "600",
                        }}
                      >
                        {urgence.priorite === "haute"
                          ? "🔴 Haute"
                          : urgence.priorite === "moyenne"
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
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            ← Retour au hub DEMO
          </button>
        </div>
    </DemoLayout>
  );
}

export default withDemoAccess(DemoRegieDashboard);
