import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import StatusBadge from "../../components/UI/StatusBadge";
import { getProfileLocal } from "../../lib/session";

export default function LocataireDashboard() {
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

    // Rediriger si pas locataire
    if (localProfile?.role !== "locataire") {
      router.push("/");
    }
  }, [router]);

  // Données DEMO mockées
  const demoLogement = {
    id: "LOGEMENT_DEMO_001",
    adresse: "12 Rue de la Paix",
    complement_adresse: "Appartement 3B",
    code_postal: "75008",
    ville: "Paris",
    type: "Appartement",
    superficie: "65 m²",
    regie_nom: "Régie Démo Perritie",
    regie_telephone: "+33 1 42 86 82 00",
  };

  const demoTickets = [
    {
      id: "TICKET_DEMO_001",
      titre: "Fuite d'eau salle de bain",
      description: "Fuite sous le lavabo, urgence modérée",
      categorie: "plomberie",
      statut: "en_cours",
      urgence: "modérée",
      date_creation: "2025-12-10T14:30:00",
      entreprise_assignee: "Maintenance Démo Pro",
      technicien_nom: "Jean Dupont",
    },
    {
      id: "TICKET_DEMO_002",
      titre: "Chauffage ne fonctionne plus",
      description: "Radiateur froid depuis 2 jours",
      categorie: "chauffage",
      statut: "ouvert",
      urgence: "haute",
      date_creation: "2025-12-08T09:15:00",
      entreprise_assignee: null,
      technicien_nom: null,
    },
  ];

  const handleCreateTicket = () => {
    router.push("/locataire/tickets");
  };

  const handleViewTicket = (ticketId) => {
    router.push(`/locataire/ticket/${ticketId}`);
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
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              padding: "1rem",
              borderRadius: "12px",
              marginBottom: "1.5rem",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
            }}
          >
            <div style={{ fontSize: "1.1rem", fontWeight: "600" }}>
              🎭 MODE DÉMONSTRATION
            </div>
            <div style={{ fontSize: "0.9rem", marginTop: "0.3rem", opacity: 0.95 }}>
              Vous explorez l'interface locataire avec des données fictives.
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
            }}
          >
            <h1 className="page-title">🏠 Mon espace locataire</h1>
            <Button onClick={handleCreateTicket}>➕ Créer un ticket</Button>
          </div>

          {/* Section : Mon logement */}
          <div style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontSize: "1.3rem",
                fontWeight: "600",
                marginBottom: "1rem",
                color: "var(--primary)",
              }}
            >
              📍 Mon logement
            </h2>

            <div
              style={{
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                padding: "1.5rem",
                borderRadius: "12px",
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      opacity: 0.7,
                      marginBottom: "0.3rem",
                    }}
                  >
                    Adresse
                  </div>
                  <div style={{ fontSize: "1.05rem", fontWeight: "600" }}>
                    {demoLogement.adresse}
                  </div>
                  {demoLogement.complement_adresse && (
                    <div style={{ fontSize: "0.95rem", opacity: 0.8 }}>
                      {demoLogement.complement_adresse}
                    </div>
                  )}
                  <div style={{ fontSize: "0.95rem", marginTop: "0.2rem" }}>
                    {demoLogement.code_postal} {demoLogement.ville}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      opacity: 0.7,
                      marginBottom: "0.3rem",
                    }}
                  >
                    Type de logement
                  </div>
                  <div style={{ fontSize: "1.05rem", fontWeight: "600" }}>
                    {demoLogement.type}
                  </div>
                  <div style={{ fontSize: "0.95rem", opacity: 0.8 }}>
                    {demoLogement.superficie}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      opacity: 0.7,
                      marginBottom: "0.3rem",
                    }}
                  >
                    Géré par
                  </div>
                  <div style={{ fontSize: "1.05rem", fontWeight: "600" }}>
                    {demoLogement.regie_nom}
                  </div>
                  <div style={{ fontSize: "0.95rem", opacity: 0.8 }}>
                    {demoLogement.regie_telephone}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section : Mes tickets */}
          <div>
            <h2
              style={{
                fontSize: "1.3rem",
                fontWeight: "600",
                marginBottom: "1rem",
                color: "var(--primary)",
              }}
            >
              🎫 Mes tickets en cours
            </h2>

            {demoTickets.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem 1rem",
                  opacity: 0.6,
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                <div style={{ fontSize: "1.1rem" }}>
                  Aucun ticket en cours
                </div>
                <div style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                  Tout va bien dans votre logement !
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "1rem",
                }}
              >
                {demoTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    style={{
                      background: "white",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      padding: "1.5rem",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                    }}
                    onClick={() => handleViewTicket(ticket.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--primary)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(0,0,0,0.1)";
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
                        marginBottom: "0.8rem",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "1.1rem",
                            fontWeight: "600",
                            marginBottom: "0.3rem",
                          }}
                        >
                          {ticket.titre}
                        </div>
                        <div
                          style={{
                            fontSize: "0.9rem",
                            opacity: 0.7,
                            marginBottom: "0.5rem",
                          }}
                        >
                          {ticket.description}
                        </div>
                      </div>
                      <div style={{ marginLeft: "1rem" }}>
                        <StatusBadge status={ticket.statut} />
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "1.5rem",
                        fontSize: "0.85rem",
                        opacity: 0.7,
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <strong>Catégorie:</strong>{" "}
                        {ticket.categorie.charAt(0).toUpperCase() +
                          ticket.categorie.slice(1)}
                      </div>
                      <div>
                        <strong>Urgence:</strong>{" "}
                        <span
                          style={{
                            color:
                              ticket.urgence === "haute"
                                ? "#ef4444"
                                : ticket.urgence === "modérée"
                                ? "#f59e0b"
                                : "#10b981",
                            fontWeight: "600",
                          }}
                        >
                          {ticket.urgence.charAt(0).toUpperCase() +
                            ticket.urgence.slice(1)}
                        </span>
                      </div>
                      <div>
                        <strong>Date:</strong>{" "}
                        {new Date(ticket.date_creation).toLocaleDateString(
                          "fr-FR"
                        )}
                      </div>
                    </div>

                    {ticket.entreprise_assignee && (
                      <div
                        style={{
                          marginTop: "1rem",
                          paddingTop: "1rem",
                          borderTop: "1px solid #e5e7eb",
                          fontSize: "0.9rem",
                        }}
                      >
                        <strong>Entreprise assignée:</strong>{" "}
                        {ticket.entreprise_assignee}
                        {ticket.technicien_nom && (
                          <span style={{ marginLeft: "1rem" }}>
                            • <strong>Technicien:</strong> {ticket.technicien_nom}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Aide rapide */}
          <div
            style={{
              marginTop: "2rem",
              padding: "1.5rem",
              background: "#f0f9ff",
              borderRadius: "12px",
              border: "1px solid #bfdbfe",
            }}
          >
            <div
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                marginBottom: "0.5rem",
                color: "#1e40af",
              }}
            >
              💡 Besoin d'aide ?
            </div>
            <div style={{ fontSize: "0.9rem", color: "#1e40af" }}>
              Vous pouvez créer un ticket pour tout problème dans votre
              logement. Votre régie et les entreprises partenaires seront
              notifiées automatiquement.
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
