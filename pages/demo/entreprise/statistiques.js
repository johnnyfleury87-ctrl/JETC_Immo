import { useState } from "react";
import DemoLayout from "../../../components/demo/DemoLayout";
import withDemoAccess from "../../../lib/withDemoAccess";

function DemoEntrepriseStatistiques() {
  const [stats] = useState({
    ca_mois: 12500,
    ca_mois_precedent: 11200,
    missions_completees: 42,
    missions_en_cours: 6,
    taux_reussite: 94,
    note_moyenne: 4.7,
    temps_moyen_intervention: 2.3
  });

  const [missionsParMois] = useState([
    { mois: "Juin", completees: 35, annulees: 2 },
    { mois: "Juillet", completees: 38, annulees: 1 },
    { mois: "Août", completees: 32, annulees: 3 },
    { mois: "Septembre", completees: 40, annulees: 2 },
    { mois: "Octobre", completees: 45, annulees: 1 },
    { mois: "Novembre", completees: 42, annulees: 2 }
  ]);

  const [missionsParType] = useState([
    { type: "Plomberie", count: 18, montant: 8100 },
    { type: "Électricité", count: 12, montant: 4560 },
    { type: "Chauffage", count: 8, montant: 4160 },
    { type: "Ventilation", count: 3, montant: 840 },
    { type: "Serrurerie", count: 1, montant: 200 }
  ]);

  const [performanceTechniciens] = useState([
    { nom: "Jean Dupont", missions: 24, note: 4.8, ca: 10800 },
    { nom: "Marc Legrand", missions: 18, note: 4.9, ca: 6840 },
    { nom: "Sophie Martin", missions: 16, note: 4.6, ca: 8320 },
    { nom: "Pierre Durand", missions: 12, note: 4.5, ca: 2400 },
    { nom: "Luc Bernard", missions: 20, note: 4.7, ca: 7000 }
  ]);

  const evolution = ((stats.ca_mois - stats.ca_mois_precedent) / stats.ca_mois_precedent * 100).toFixed(1);

  return (
    <DemoLayout role="entreprise" activePage="/demo/entreprise/statistiques">
      <h1 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>📈 Statistiques & Performances</h1>

      <div style={{
        backgroundColor: "#fff3cd",
        padding: "1rem",
        borderRadius: "5px",
        marginBottom: "1.5rem",
        borderLeft: "4px solid #ffc107"
      }}>
        <strong>ℹ️ Mode Démo :</strong> Statistiques fictives à titre d'illustration.
      </div>

      {/* KPIs principaux */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem"
      }}>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "0.85rem", color: "#999", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            CA ce mois
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#27ae60" }}>
            {stats.ca_mois.toLocaleString()} €
          </div>
          <div style={{
            fontSize: "0.85rem",
            color: evolution > 0 ? "#27ae60" : "#e74c3c",
            marginTop: "0.5rem"
          }}>
            {evolution > 0 ? "↗" : "↘"} {Math.abs(evolution)}% vs mois dernier
          </div>
        </div>

        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "0.85rem", color: "#999", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Missions complétées
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3498db" }}>
            {stats.missions_completees}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>
            +6 en cours
          </div>
        </div>

        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "0.85rem", color: "#999", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Taux de réussite
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#f39c12" }}>
            {stats.taux_reussite}%
          </div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>
            Sur 6 derniers mois
          </div>
        </div>

        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "0.85rem", color: "#999", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Note moyenne
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#e67e22" }}>
            ⭐ {stats.note_moyenne}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>
            /5.0
          </div>
        </div>
      </div>

      {/* Missions par mois */}
      <div style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        marginBottom: "1.5rem"
      }}>
        <h2 style={{ marginTop: 0, color: "#2c3e50", borderBottom: "2px solid #3498db", paddingBottom: "0.5rem" }}>
          📊 Évolution des Missions (6 derniers mois)
        </h2>
        <div style={{ display: "flex", alignItems: "end", gap: "1rem", marginTop: "1.5rem", height: "200px" }}>
          {missionsParMois.map((m, idx) => (
            <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: "100%",
                backgroundColor: "#3498db",
                borderRadius: "5px 5px 0 0",
                height: `${(m.completees / 50) * 100}%`,
                minHeight: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: "0.9rem"
              }}>
                {m.completees}
              </div>
              <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", fontWeight: "bold", color: "#666" }}>
                {m.mois}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Missions par type */}
      <div style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        marginBottom: "1.5rem"
      }}>
        <h2 style={{ marginTop: 0, color: "#2c3e50", borderBottom: "2px solid #3498db", paddingBottom: "0.5rem" }}>
          🔧 Missions par Type (ce mois)
        </h2>
        <table style={{ width: "100%", marginTop: "1.5rem", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #dee2e6" }}>
              <th style={{ padding: "1rem", textAlign: "left" }}>Type</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>Nombre</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>CA généré</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>Prix moyen</th>
            </tr>
          </thead>
          <tbody>
            {missionsParType.map((m, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #dee2e6" }}>
                <td style={{ padding: "1rem" }}><strong>{m.type}</strong></td>
                <td style={{ padding: "1rem", textAlign: "center" }}>{m.count}</td>
                <td style={{ padding: "1rem", textAlign: "center", color: "#27ae60", fontWeight: "bold" }}>
                  {m.montant.toLocaleString()} €
                </td>
                <td style={{ padding: "1rem", textAlign: "center", color: "#666" }}>
                  {(m.montant / m.count).toFixed(0)} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Performance techniciens */}
      <div style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ marginTop: 0, color: "#2c3e50", borderBottom: "2px solid #3498db", paddingBottom: "0.5rem" }}>
          👷 Performance par Technicien
        </h2>
        <table style={{ width: "100%", marginTop: "1.5rem", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #dee2e6" }}>
              <th style={{ padding: "1rem", textAlign: "left" }}>Technicien</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>Missions</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>Note moyenne</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>CA généré</th>
            </tr>
          </thead>
          <tbody>
            {performanceTechniciens.map((t, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #dee2e6" }}>
                <td style={{ padding: "1rem" }}><strong>{t.nom}</strong></td>
                <td style={{ padding: "1rem", textAlign: "center" }}>{t.missions}</td>
                <td style={{ padding: "1rem", textAlign: "center" }}>⭐ {t.note}</td>
                <td style={{ padding: "1rem", textAlign: "center", color: "#27ae60", fontWeight: "bold" }}>
                  {t.ca.toLocaleString()} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DemoLayout>
  );
}

export default withDemoAccess(DemoEntrepriseStatistiques);
