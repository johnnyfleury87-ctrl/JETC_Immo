import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import StatusBadge from "../../components/UI/StatusBadge";
import { getProfile } from "../../lib/api";
import { saveProfile } from "../../lib/session";
import { requireRole } from "../../lib/roleGuard";

export default function EntrepriseDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        saveProfile(profile);
        setProfile(profile);
        requireRole(["entreprise"]);
      } catch (error) {
        console.error("Erreur chargement profil", error);
      }
    };
    loadProfile();
  }, [router]);

  // Données DEMO mockées
  const demoKPIs = {
    missions_en_cours: 5,
    missions_terminees: 18,
    missions_ce_mois: 8,
    techniciens_actifs: 3,
    taux_completion: 92,
    temps_moyen_intervention: "2.3h",
  };

  const demoMissions = [
    {
      id: "MISSION_DEMO_001",
      titre: "Réparation fuite d'eau",
      description: "Fuite sous lavabo - 12 Rue de la Paix",
      categorie: "plomberie",
      statut: "en_cours",
      urgence: "modérée",
      date_creation: "2025-12-10T14:30:00",
      date_intervention: "2025-12-11T10:00:00",
      technicien_id: "TECH_DEMO_001",
      technicien_nom: "Jean Dupont",
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
      date_intervention: "2025-12-12T14:00:00",
      technicien_id: "TECH_DEMO_002",
      technicien_nom: "Marie Martin",
      regie_nom: "Régie Démo Perritie",
      adresse: "45 Avenue des Champs, Paris 75016",
    },
    {
      id: "MISSION_DEMO_003",
      titre: "Maintenance électrique",
      description: "Vérification tableau électrique",
      categorie: "électricité",
      statut: "planifiee",
      urgence: "basse",
      date_creation: "2025-12-09T16:20:00",
      date_intervention: "2025-12-13T09:00:00",
      technicien_id: "TECH_DEMO_003",
      technicien_nom: "Pierre Dubois",
      regie_nom: "Régie Démo Perritie",
      adresse: "78 Boulevard Haussmann, Paris 75008",
    },
  ];

  const demoTechniciens = [
    {
      id: "TECH_DEMO_001",
      nom: "Jean Dupont",
      prenom: "Jean",
      specialite: "Plomberie",
      telephone: "+33 6 12 34 56 01",
      missions_actives: 2,
      missions_terminees: 8,
      statut: "disponible",
      note_moyenne: 4.8,
    },
    {
      id: "TECH_DEMO_002",
      nom: "Marie Martin",
      prenom: "Marie",
      specialite: "Chauffage",
      telephone: "+33 6 12 34 56 02",
      missions_actives: 1,
      missions_terminees: 6,
      statut: "en_intervention",
      note_moyenne: 4.9,
    },
    {
      id: "TECH_DEMO_003",
      nom: "Pierre Dubois",
      prenom: "Pierre",
      specialite: "Électricité",
      telephone: "+33 6 12 34 56 03",
      missions_actives: 2,
      missions_terminees: 4,
      statut: "disponible",
      note_moyenne: 4.7,
    },
  ];

  const handleViewMission = (missionId) => {
    router.push(`/entreprise/mission/${missionId}`);
  };

  const handleViewAllMissions = () => {
    router.push("/entreprise/missions");
  };

  const handleManageTechniciens = () => {
    router.push("/entreprise/techniciens");
  };

  if (!profile) {
    return (
      <Layout>
        <Card>
          <p style={{ textAlign: "center", padding: "2rem" }}>Chargement...</p>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <h1 className="page-title">🔧 Dashboard Entreprise</h1>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Button onClick={handleViewAllMissions}>📋 Toutes les missions</Button>
              <Button onClick={handleManageTechniciens}>👷 Techniciens</Button>
            </div>
          </div>

          {/* KPIs */}
          <div style={{ marginBottom: "2.5rem" }}>
            <h2
              style={{
                fontSize: "1.3rem",
                fontWeight: "600",
                marginBottom: "1rem",
                color: "var(--primary)",
              }}
            >
              📊 Indicateurs clés
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  color: "white",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                }}
              >
                <div style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "0.5rem" }}>
                  Missions en cours
                </div>
                <div style={{ fontSize: "2.5rem", fontWeight: "700" }}>
                  {demoKPIs.missions_en_cours}
                </div>
              </div>

              <div
                style={{
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "white",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                }}
              >
                <div style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "0.5rem" }}>
                  Missions terminées
                </div>
                <div style={{ fontSize: "2.5rem", fontWeight: "700" }}>
                  {demoKPIs.missions_terminees}
                </div>
              </div>

              <div
                style={{
                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  color: "white",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
                }}
              >
                <div style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "0.5rem" }}>
                  Ce mois-ci
                </div>
                <div style={{ fontSize: "2.5rem", fontWeight: "700" }}>
                  {demoKPIs.missions_ce_mois}
                </div>
              </div>

              <div
                style={{
                  background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                  color: "white",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
                }}
              >
                <div style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "0.5rem" }}>
                  Techniciens actifs
                </div>
                <div style={{ fontSize: "2.5rem", fontWeight: "700" }}>
                  {demoKPIs.techniciens_actifs}
                </div>
              </div>

              <div
                style={{
                  background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
                  color: "white",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(236, 72, 153, 0.3)",
                }}
              >
                <div style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "0.5rem" }}>
                  Taux de complétion
                </div>
                <div style={{ fontSize: "2.5rem", fontWeight: "700" }}>
                  {demoKPIs.taux_completion}%
                </div>
              </div>

              <div
                style={{
                  background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                  color: "white",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(6, 182, 212, 0.3)",
                }}
              >
                <div style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "0.5rem" }}>
                  Temps moyen
                </div>
                <div style={{ fontSize: "2.5rem", fontWeight: "700" }}>
                  {demoKPIs.temps_moyen_intervention}
                </div>
              </div>
            </div>
          </div>

          {/* Missions en cours */}
          <div style={{ marginBottom: "2.5rem" }}>
            <h2
              style={{
                fontSize: "1.3rem",
                fontWeight: "600",
                marginBottom: "1rem",
                color: "var(--primary)",
              }}
            >
              🚀 Missions en cours
            </h2>

            <div
              style={{
                display: "grid",
                gap: "1rem",
              }}
            >
              {demoMissions.map((mission) => (
                <div
                  key={mission.id}
                  style={{
                    background: "white",
                    border: "2px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                  }}
                  onClick={() => handleViewMission(mission.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#f97316";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(249, 115, 22, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "1rem",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "1.15rem",
                          fontWeight: "600",
                          marginBottom: "0.3rem",
                        }}
                      >
                        {mission.titre}
                      </div>
                      <div
                        style={{
                          fontSize: "0.9rem",
                          opacity: 0.7,
                          marginBottom: "0.5rem",
                        }}
                      >
                        {mission.description}
                      </div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          opacity: 0.6,
                        }}
                      >
                        📍 {mission.adresse}
                      </div>
                    </div>
                    <div style={{ marginLeft: "1rem" }}>
                      <StatusBadge status={mission.statut} />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "1rem",
                      fontSize: "0.85rem",
                      opacity: 0.7,
                    }}
                  >
                    <div>
                      <strong>Catégorie:</strong>{" "}
                      {mission.categorie.charAt(0).toUpperCase() + mission.categorie.slice(1)}
                    </div>
                    <div>
                      <strong>Urgence:</strong>{" "}
                      <span
                        style={{
                          color:
                            mission.urgence === "haute"
                              ? "#ef4444"
                              : mission.urgence === "modérée"
                              ? "#f59e0b"
                              : "#10b981",
                          fontWeight: "600",
                        }}
                      >
                        {mission.urgence.charAt(0).toUpperCase() + mission.urgence.slice(1)}
                      </span>
                    </div>
                    <div>
                      <strong>Intervention:</strong>{" "}
                      {new Date(mission.date_intervention).toLocaleDateString("fr-FR")} à{" "}
                      {new Date(mission.date_intervention).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "1rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid #e5e7eb",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ fontSize: "0.9rem" }}>
                      <strong>👷 Technicien:</strong> {mission.technicien_nom}
                    </div>
                    <div style={{ fontSize: "0.85rem", opacity: 0.6 }}>
                      Client: {mission.regie_nom}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Équipe de techniciens */}
          <div>
            <h2
              style={{
                fontSize: "1.3rem",
                fontWeight: "600",
                marginBottom: "1rem",
                color: "var(--primary)",
              }}
            >
              👷 Équipe de techniciens
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1rem",
              }}
            >
              {demoTechniciens.map((tech) => (
                <div
                  key={tech.id}
                  style={{
                    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "1rem",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                        {tech.prenom} {tech.nom}
                      </div>
                      <div style={{ fontSize: "0.9rem", opacity: 0.7, marginTop: "0.2rem" }}>
                        {tech.specialite}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.3rem 0.8rem",
                        borderRadius: "20px",
                        background:
                          tech.statut === "disponible"
                            ? "#10b981"
                            : tech.statut === "en_intervention"
                            ? "#f59e0b"
                            : "#94a3b8",
                        color: "white",
                        fontWeight: "600",
                      }}
                    >
                      {tech.statut === "disponible"
                        ? "Disponible"
                        : tech.statut === "en_intervention"
                        ? "En intervention"
                        : "Indisponible"}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gap: "0.5rem",
                      fontSize: "0.85rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div>
                      <strong>📞</strong> {tech.telephone}
                    </div>
                    <div>
                      <strong>🔧 Missions actives:</strong> {tech.missions_actives}
                    </div>
                    <div>
                      <strong>✅ Missions terminées:</strong> {tech.missions_terminees}
                    </div>
                  </div>

                  <div
                    style={{
                      paddingTop: "1rem",
                      borderTop: "1px solid #cbd5e1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ fontSize: "0.85rem" }}>
                      <strong>Note moyenne:</strong>
                    </div>
                    <div
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "700",
                        color: "#f59e0b",
                      }}
                    >
                      ⭐ {tech.note_moyenne}/5
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message informatif */}
          <div
            style={{
              marginTop: "2rem",
              padding: "1.5rem",
              background: "#fff7ed",
              borderRadius: "12px",
              border: "1px solid #fed7aa",
            }}
          >
            <div
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                marginBottom: "0.5rem",
                color: "#ea580c",
              }}
            >
              💡 Information MODE DEMO
            </div>
            <div style={{ fontSize: "0.9rem", color: "#9a3412" }}>
              Toutes les données affichées sont fictives. En mode production, ce
              dashboard se synchronise en temps réel avec vos missions et techniciens
              via l'API Supabase.
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
