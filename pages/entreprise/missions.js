import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import Card from "../../components/UI/Card";
import StatusBadge from "../../components/UI/StatusBadge";
import { requireRole } from "../../lib/roleGuard";
import { getProfile, apiFetch } from "../../lib/api";
import { saveProfile } from "../../lib/session";

export default function EntrepriseMissions() {
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
    requireRole(["entreprise"]);

    const loadMissions = async () => {
      try {
        const data = await apiFetch("/entreprise/missions");
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
        <h1 className="page-title">🔧 Missions disponibles</h1>
        
        {loading ? (
          <p style={{ textAlign: "center", padding: "2rem" }}>Chargement...</p>
        ) : (
          <div>
            {missions.length === 0 ? (
              <p style={{ textAlign: "center", padding: "2rem", opacity: 0.6 }}>Aucune mission disponible</p>
            ) : (
              <div style={{ display: "grid", gap: "1rem" }}>
                {missions.map((mission) => (
                  <Card key={mission.id} className="hover-glow" style={{ cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ marginBottom: "0.5rem", color: "var(--primary)" }}>
                          🔧 {mission.titre || `Mission #${mission.id}`}
                        </h3>
                        <StatusBadge status={mission.statut} />
                        <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", opacity: 0.8 }}>
                          📅 {mission.date_souhaitee_intervention 
                            ? new Date(mission.date_souhaitee_intervention).toLocaleDateString() 
                            : "Date non définie"}
                        </p>
                      </div>
                      <span style={{ fontSize: "1.5rem" }}>🏭</span>
                    </div>
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
