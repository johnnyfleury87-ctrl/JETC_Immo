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
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Vérifier mode DEMO
    const demoMode = typeof window !== "undefined" && localStorage.getItem("jetc_demo_mode") === "true";
    setIsDemoMode(demoMode);

    console.log("🔧 TECHNICIEN MISSIONS - Mode DEMO =", demoMode);

    // EN MODE DEMO : charger données mockées, AUCUN appel API
    if (demoMode) {
      const demoMissions = [
        {
          id: "MISSION_DEMO_001",
          titre: "Réparation fuite d'eau",
          description: "Fuite sous le lavabo, urgence modérée",
          categorie: "plomberie",
          statut: "en_cours",
          urgence: "modérée",
          adresse: "12 Rue de la Paix, Paris 75008",
          date_creation: "2025-12-10T14:30:00",
        },
        {
          id: "MISSION_DEMO_004",
          titre: "Installation thermostat",
          description: "Installation d'un thermostat programmable",
          categorie: "chauffage",
          statut: "planifiee",
          urgence: "basse",
          adresse: "89 Boulevard Saint-Germain, Paris 75006",
          date_creation: "2025-12-09T11:20:00",
        },
      ];
      setMissions(demoMissions);
      setLoading(false);
      console.log("✅ Données DEMO chargées:", demoMissions.length, "missions");
      return; // STOP : ne pas exécuter le code PRODUCTION
    }

    // EN MODE PRODUCTION : comportement normal
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
        {/* Badge MODE DEMO */}
        {isDemoMode && (
          <div
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
              padding: "0.8rem 1.2rem",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              textAlign: "center",
              fontSize: "0.9rem",
              fontWeight: "600",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
            }}
          >
            🎭 MODE DÉMONSTRATION • Utilisez le dashboard pour voir les données DEMO complètes
          </div>
        )}

        <h1 className="page-title">⚙️ Mes missions</h1>

        {loading ? (
          <p style={{ textAlign: "center", padding: "2rem" }}>Chargement...</p>
        ) : (
          <div>
            {missions.length === 0 ? (
              <p style={{ textAlign: "center", padding: "2rem", opacity: 0.6 }}>
                Aucune mission assignée
              </p>
            ) : (
              <div style={{ display: "grid", gap: "1rem" }}>
                {missions.map((mission) => (
                  <Card key={mission.id} className="hover-glow">
                    <div style={{ marginBottom: "1rem" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <div>
                          <h3
                            style={{
                              margin: "0 0 0.5rem 0",
                              color: "var(--primary)",
                            }}
                          >
                            ⚙️ Mission #{mission.id}
                          </h3>
                          <StatusBadge status={mission.statut} />
                        </div>
                        <span style={{ fontSize: "1.5rem" }}>👤</span>
                      </div>

                      <div
                        style={{
                          marginTop: "1rem",
                          fontSize: "0.95rem",
                          color: "var(--text)",
                        }}
                      >
                        <p style={{ margin: "0.25rem 0" }}>
                          <strong>👤 Locataire :</strong>{" "}
                          {mission.locataire_nom || "Non défini"}
                        </p>
                        <p style={{ margin: "0.25rem 0" }}>
                          <strong>📍 Adresse :</strong>{" "}
                          {mission.adresse || "Non définie"}
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
