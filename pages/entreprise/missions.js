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
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Vérifier mode DEMO
    const demoMode = typeof window !== "undefined" && localStorage.getItem("jetc_demo_mode") === "true";
    setIsDemoMode(demoMode);

    console.log("🏗️ ENTREPRISE MISSIONS - Mode DEMO =", demoMode);

    // EN MODE DEMO : charger données mockées, AUCUN appel API
    if (demoMode) {
      const demoMissions = [
        {
          id: "MISSION_DEMO_001",
          titre: "Réparation fuite d'eau",
          description: "Fuite sous lavabo - 12 Rue de la Paix",
          categorie: "plomberie",
          statut: "en_cours",
          urgence: "modérée",
          date_creation: "2025-12-10T14:30:00",
          regie_nom: "Régie Démo Perritie",
          adresse: "12 Rue de la Paix, Paris 75008",
        },
        {
          id: "MISSION_DEMO_002",
          titre: "Installation chauffage",
          description: "Remplacement radiateur défectueux",
          categorie: "chauffage",
          statut: "en_cours",
          urgence: "haute",
          date_creation: "2025-12-08T09:15:00",
          regie_nom: "Régie Démo Perritie",
          adresse: "45 Avenue des Champs, Paris 75016",
        },
        {
          id: "MISSION_DEMO_003",
          titre: "Maintenance électrique",
          description: "Vérification tableau électrique",
          categorie: "electricite",
          statut: "planifiee",
          urgence: "basse",
          date_creation: "2025-12-09T11:20:00",
          regie_nom: "Régie Démo Perritie",
          adresse: "23 Rue du Louvre, Paris 75001",
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
        {/* Badge MODE DEMO */}
        {isDemoMode && (
          <div
            style={{
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              color: "white",
              padding: "0.8rem 1.2rem",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              textAlign: "center",
              fontSize: "0.9rem",
              fontWeight: "600",
              boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
            }}
          >
            🎭 MODE DÉMONSTRATION • Utilisez le dashboard pour voir les données DEMO complètes
          </div>
        )}

        <h1 className="page-title">🔧 Missions disponibles</h1>

        {loading ? (
          <p style={{ textAlign: "center", padding: "2rem" }}>Chargement...</p>
        ) : (
          <div>
            {missions.length === 0 ? (
              <p style={{ textAlign: "center", padding: "2rem", opacity: 0.6 }}>
                Aucune mission disponible
              </p>
            ) : (
              <div style={{ display: "grid", gap: "1rem" }}>
                {missions.map((mission) => (
                  <Card
                    key={mission.id}
                    className="hover-glow"
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h3
                          style={{
                            marginBottom: "0.5rem",
                            color: "var(--primary)",
                          }}
                        >
                          🔧 {mission.titre || `Mission #${mission.id}`}
                        </h3>
                        <StatusBadge status={mission.statut} />
                        <p
                          style={{
                            marginTop: "0.5rem",
                            fontSize: "0.9rem",
                            opacity: 0.8,
                          }}
                        >
                          📅{" "}
                          {mission.date_souhaitee_intervention
                            ? new Date(
                                mission.date_souhaitee_intervention
                              ).toLocaleDateString()
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
