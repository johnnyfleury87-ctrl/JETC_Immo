import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import StatusBadge from "../../components/UI/StatusBadge";
import { requireRole } from "../../lib/roleGuard";
import { getProfile, apiFetch } from "../../lib/api";
import { saveProfile } from "../../lib/session";

export default function TechnicienMissions() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        saveProfile(profile);
      } catch (error) {
        console.error("Erreur chargement profil", error);
      }
    };
    loadProfile();
    requireRole(["technicien"]);

    const loadMissions = async () => {
      try {
        const data = await apiFetch("/technicien/missions");
        setMissions(data.missions || []);
      } catch (error) {
        console.error("Erreur chargement missions", error);
      } finally {
        setLoading(false);
      }
    };
    loadMissions();
  }, []);
  return (
    <Layout>
      <Card>
        <h1 className="page-title">⚙️ Mes missions</h1>
        
        {loading ? (
          <p style={{ textAlign: "center", padding: "2rem" }}>Chargement...</p>
        ) : (
          <div>
            {missions.length === 0 ? (
              <p style={{ textAlign: "center", padding: "2rem", opacity: 0.6 }}>Aucune mission assignée</p>
            ) : (
              <div style={{ display: "grid", gap: "1rem" }}>
                {missions.map((mission) => (
                  <Card key={mission.id} className="hover-glow">
                    <div style={{ marginBottom: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.75rem" }}>
                        <div>
                          <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--primary)" }}>
                            ⚙️ Mission #{mission.id}
                          </h3>
                          <StatusBadge status={mission.statut} />
                        </div>
                        <span style={{ fontSize: "1.5rem" }}>👤</span>
                      </div>
                      
                      <div style={{ marginTop: "1rem", fontSize: "0.95rem", color: "var(--text)" }}>
                        <p style={{ margin: "0.25rem 0" }}>
                          <strong>👤 Locataire :</strong> {mission.locataire_nom || "Non défini"}
                        </p>
                        <p style={{ margin: "0.25rem 0" }}>
                          <strong>📍 Adresse :</strong> {mission.adresse || "Non définie"}
                        </p>
                      </div>
                    </div>
                    
                    <Button style={{ width: "100%" }}>Voir les détails</Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </Layout>
  );
}
