import { useState } from "react";
import DemoLayout from "../../../components/demo/DemoLayout";

export default function DemoTechnicienHistorique() {
  const [missions] = useState([
    { id: 1, ref: "MIS-2398", type: "Ventilation", adresse: "23 Rue de la Paix", regie: "Régie Horizon", date: "2025-12-10", note: 5, montant: 280 },
    { id: 2, ref: "MIS-2395", type: "Plomberie", adresse: "45 Avenue Foch", regie: "Gestion Plus", date: "2025-12-08", note: 5, montant: 350 },
    { id: 3, ref: "MIS-2390", type: "Électricité", adresse: "12 Boulevard Voltaire", regie: "Régie Central", date: "2025-12-05", note: 4, montant: 420 },
    { id: 4, ref: "MIS-2385", type: "Chauffage", adresse: "67 Rue du Commerce", regie: "Régie Horizon", date: "2025-12-03", note: 5, montant: 520 },
    { id: 5, ref: "MIS-2380", type: "Plomberie", adresse: "89 Avenue des Champs", regie: "Gestion Plus", date: "2025-12-01", note: 5, montant: 390 }
  ]);

  return (
    <DemoLayout role="technicien" activePage="/demo/technicien/historique">
      <h1 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>📚 Historique des Missions</h1>

      <div style={{
        backgroundColor: "#fff3cd",
        padding: "1rem",
        borderRadius: "5px",
        marginBottom: "1.5rem",
        borderLeft: "4px solid #ffc107"
      }}>
        <strong>ℹ️ Mode Démo :</strong> Historique fictif des missions complétées.
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#27ae60" }}>38</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>Missions complétées</div>
        </div>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#e67e22" }}>⭐ 4.8</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>Note moyenne</div>
        </div>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3498db" }}>94%</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>Taux de réussite</div>
        </div>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#27ae60" }}>10800 €</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>CA généré</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {missions.map((mission) => (
          <div key={mission.id} style={{
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            borderLeft: "4px solid #27ae60"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 0.5rem 0", color: "#2c3e50" }}>
                  {mission.ref} - {mission.type}
                </h3>
                <p style={{ margin: "0.25rem 0", fontSize: "0.9rem", color: "#666" }}>
                  📍 {mission.adresse}
                </p>
                <p style={{ margin: "0.25rem 0", fontSize: "0.9rem", color: "#666" }}>
                  🏢 {mission.regie} • 📅 {mission.date}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.75rem", color: "#999" }}>Note</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#e67e22" }}>
                    ⭐ {mission.note}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.75rem", color: "#999" }}>Montant</div>
                  <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#27ae60" }}>
                    {mission.montant} €
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DemoLayout>
  );
}
