import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import StatusBadge from "../../components/UI/StatusBadge";
import { getProfileLocal } from "../../lib/session";

export default function TechnicienDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Vérifier mode DEMO
    const demoMode = localStorage.getItem("jetc_demo_mode") === "true";
    setIsDemoMode(demoMode);

    // Charger profil local
    const localProfile = getProfileLocal();
    setProfile(localProfile);

    // Rediriger si pas technicien
    if (localProfile?.role !== "technicien") {
      router.push("/");
    }
  }, [router]);

  // Données DEMO mockées
  const demoTechnicien = {
    id: "TECH_DEMO_001",
    nom: "Dupont",
    prenom: "Jean",
    specialite: "Plomberie & Chauffage",
    telephone: "+33 6 12 34 56 01",
    entreprise: "Maintenance Démo Pro",
    missions_actives: 2,
    missions_terminees: 8,
    missions_ce_mois: 5,
    note_moyenne: 4.8,
    statut: "disponible",
    certifications: ["Plomberie", "Gaz", "Chauffage"],
  };

  const demoMissions = [
    {
      id: "MISSION_DEMO_001",
      titre: "Réparation fuite d'eau",
      description: "Fuite sous le lavabo, urgence modérée",
      categorie: "plomberie",
      statut: "en_cours",
      urgence: "modérée",
      date_creation: "2025-12-10T14:30:00",
      date_intervention: "2025-12-11T10:00:00",
      adresse: "12 Rue de la Paix",
      ville: "Paris 75008",
      client_nom: "Régie Démo Perritie",
      client_telephone: "+33 1 42 86 82 00",
      locataire_nom: "Mme. Dupuis",
      temps_estime: "2h",
      materiel_requis: ["Joint de lavabo", "Ruban téflon", "Clé à molette"],
      instructions: "Accès par code 1234A. Appartement 3B au 2ème étage.",
    },
    {
      id: "MISSION_DEMO_004",
      titre: "Installation thermostat",
      description: "Installation d'un thermostat programmable",
      categorie: "chauffage",
      statut: "planifiee",
      urgence: "basse",
      date_creation: "2025-12-09T11:20:00",
      date_intervention: "2025-12-13T14:00:00",
      adresse: "89 Rue du Commerce",
      ville: "Paris 75015",
      client_nom: "Régie Démo Perritie",
      client_telephone: "+33 1 42 86 82 00",
      locataire_nom: "M. Bernard",
      temps_estime: "1.5h",
      materiel_requis: ["Thermostat Netatmo", "Vis", "Chevilles"],
      instructions: "Sonner à l'interphone 'Bernard'. RDV confirmé.",
    },
  ];

  const demoHistorique = [
    {
      id: "MISSION_DEMO_H001",
      titre: "Débouchage canalisation",
      date: "2025-12-05",
      duree: "1.5h",
      statut: "terminee",
      note: 5,
    },
    {
      id: "MISSION_DEMO_H002",
      titre: "Réparation radiateur",
      date: "2025-12-03",
      duree: "2h",
      statut: "terminee",
      note: 4.5,
    },
    {
      id: "MISSION_DEMO_H003",
      titre: "Changement robinet",
      date: "2025-12-01",
      duree: "1h",
      statut: "terminee",
      note: 5,
    },
  ];

  const handleViewMission = (missionId) => {
    router.push(`/technicien/mission/${missionId}`);
  };

  const handleViewAllMissions = () => {
    router.push("/technicien/missions");
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
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Badge MODE DEMO */}
        {isDemoMode && (
          <div
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
              padding: "1rem",
              borderRadius: "12px",
              marginBottom: "1.5rem",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
            }}
          >
            <div style={{ fontSize: "1.1rem", fontWeight: "600" }}>
              🎭 MODE DÉMONSTRATION
            </div>
            <div style={{ fontSize: "0.9rem", marginTop: "0.3rem", opacity: 0.95 }}>
              Vous explorez l'interface technicien avec des données fictives.
              Aucune action réelle n'est effectuée.
            </div>
          </div>
        )}

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
            <h1 className="page-title">👷 Mon tableau de bord</h1>
            <Button onClick={handleViewAllMissions}>📋 Toutes mes missions</Button>
          </div>

          {/* Profil technicien */}
          <div style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontSize: "1.3rem",
                fontWeight: "600",
                marginBottom: "1rem",
                color: "var(--primary)",
              }}
            >
              👤 Mon profil
            </h2>

            <div
              style={{
                background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
                color: "white",
                padding: "2rem",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "0.3rem" }}>
                    Nom complet
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "700" }}>
                    {demoTechnicien.prenom} {demoTechnicien.nom}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "0.3rem" }}>
                    Spécialité
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                    {demoTechnicien.specialite}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "0.3rem" }}>
                    Entreprise
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                    {demoTechnicien.entreprise}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "0.3rem" }}>
                    Statut
                  </div>
                  <div
                    style={{
                      fontSize: "1rem",
                      fontWeight: "700",
                      display: "inline-block",
                      padding: "0.3rem 1rem",
                      borderRadius: "20px",
                      background: "rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    ✅ {demoTechnicien.statut === "disponible" ? "Disponible" : "En intervention"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: "1.5rem",
                  paddingTop: "1.5rem",
                  borderTop: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <div style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "0.5rem" }}>
                  Certifications
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {demoTechnicien.certifications.map((cert, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: "0.3rem 0.8rem",
                        background: "rgba(255, 255, 255, 0.3)",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                      }}
                    >
                      🏆 {cert}
                    </span>
                  ))}
                </div>
              </div>
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
              📊 Mes statistiques
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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
                  Missions actives
                </div>
                <div style={{ fontSize: "2.5rem", fontWeight: "700" }}>
                  {demoTechnicien.missions_actives}
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
                  {demoTechnicien.missions_terminees}
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
                  {demoTechnicien.missions_ce_mois}
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
                  Note moyenne
                </div>
                <div style={{ fontSize: "2.5rem", fontWeight: "700" }}>
                  ⭐ {demoTechnicien.note_moyenne}
                </div>
              </div>
            </div>
          </div>

          {/* Missions actives */}
          <div style={{ marginBottom: "2.5rem" }}>
            <h2
              style={{
                fontSize: "1.3rem",
                fontWeight: "600",
                marginBottom: "1rem",
                color: "var(--primary)",
              }}
            >
              🚀 Mes missions en cours
            </h2>

            {demoMissions.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem 1rem",
                  opacity: 0.6,
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                <div style={{ fontSize: "1.1rem" }}>Aucune mission active</div>
                <div style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                  Vous êtes disponible pour de nouvelles missions !
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "1rem" }}>
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
                      e.currentTarget.style.borderColor = "#10b981";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.2)";
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
                      </div>
                      <div style={{ marginLeft: "1rem" }}>
                        <StatusBadge status={mission.statut} />
                      </div>
                    </div>

                    <div
                      style={{
                        background: "#f0fdf4",
                        padding: "1rem",
                        borderRadius: "8px",
                        marginBottom: "1rem",
                      }}
                    >
                      <div style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                        <strong>📍 Adresse:</strong> {mission.adresse}, {mission.ville}
                      </div>
                      <div style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                        <strong>👤 Locataire:</strong> {mission.locataire_nom}
                      </div>
                      <div style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                        <strong>📞 Client:</strong> {mission.client_nom} - {mission.client_telephone}
                      </div>
                      <div style={{ fontSize: "0.9rem" }}>
                        <strong>💡 Instructions:</strong> {mission.instructions}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "1rem",
                        fontSize: "0.85rem",
                        marginBottom: "1rem",
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
                      <div>
                        <strong>Durée estimée:</strong> {mission.temps_estime}
                      </div>
                    </div>

                    <div
                      style={{
                        paddingTop: "1rem",
                        borderTop: "1px solid #e5e7eb",
                      }}
                    >
                      <div style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                        🧰 Matériel requis:
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {mission.materiel_requis.map((item, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: "0.3rem 0.8rem",
                              background: "#e0f2fe",
                              borderRadius: "20px",
                              fontSize: "0.8rem",
                              color: "#0369a1",
                            }}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historique récent */}
          <div>
            <h2
              style={{
                fontSize: "1.3rem",
                fontWeight: "600",
                marginBottom: "1rem",
                color: "var(--primary)",
              }}
            >
              📜 Missions récentes terminées
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1rem",
              }}
            >
              {demoHistorique.map((mission) => (
                <div
                  key={mission.id}
                  style={{
                    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                    padding: "1.2rem",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1rem",
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {mission.titre}
                  </div>
                  <div style={{ fontSize: "0.85rem", opacity: 0.7, marginBottom: "0.8rem" }}>
                    {new Date(mission.date).toLocaleDateString("fr-FR")} • {mission.duree}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "0.8rem",
                      borderTop: "1px solid #cbd5e1",
                    }}
                  >
                    <StatusBadge status={mission.statut} />
                    <div
                      style={{
                        fontSize: "1rem",
                        fontWeight: "700",
                        color: "#f59e0b",
                      }}
                    >
                      ⭐ {mission.note}/5
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
              background: "#ecfdf5",
              borderRadius: "12px",
              border: "1px solid #a7f3d0",
            }}
          >
            <div
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                marginBottom: "0.5rem",
                color: "#047857",
              }}
            >
              💡 Information MODE DEMO
            </div>
            <div style={{ fontSize: "0.9rem", color: "#065f46" }}>
              Toutes les données affichées sont fictives. En mode production, ce
              dashboard affiche vos missions réelles assignées par votre entreprise
              et synchronisées en temps réel.
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
