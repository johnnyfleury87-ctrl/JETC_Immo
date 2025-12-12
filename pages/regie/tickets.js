import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { requireRole } from "../../lib/roleGuard";
import { getProfile, apiFetch } from "../../lib/api";
import { saveProfile } from "../../lib/session";

export default function RegieTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Vérifier mode DEMO
    const demoMode = typeof window !== "undefined" && localStorage.getItem("jetc_demo_mode") === "true";
    setIsDemoMode(demoMode);

    console.log("🏢 REGIE TICKETS - Mode DEMO =", demoMode);

    // EN MODE DEMO : charger données mockées, AUCUN appel API
    if (demoMode) {
      const demoTickets = [
        {
          id: "TICKET_DEMO_001",
          titre: "Fuite d'eau salle de bain",
          statut: "en_cours",
          urgence: "modérée",
          categorie: "plomberie",
          locataire_nom: "Mme. Dupuis",
          adresse: "12 Rue de la Paix, Paris 75008",
          date_creation: "2025-12-10T14:30:00",
        },
        {
          id: "TICKET_DEMO_002",
          titre: "Chauffage défectueux",
          statut: "ouvert",
          urgence: "haute",
          categorie: "chauffage",
          locataire_nom: "M. Martin",
          adresse: "45 Avenue des Champs, Paris 75016",
          date_creation: "2025-12-08T09:15:00",
        },
        {
          id: "TICKET_DEMO_003",
          titre: "Problème électrique",
          statut: "attente_diffusion",
          urgence: "basse",
          categorie: "electricite",
          locataire_nom: "Mme. Bernard",
          adresse: "23 Rue du Louvre, Paris 75001",
          date_creation: "2025-12-11T16:20:00",
        },
      ];
      setTickets(demoTickets);
      setLoading(false);
      console.log("✅ Données DEMO chargées:", demoTickets.length, "tickets");
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
    requireRole(["regie"]);

    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const data = await apiFetch("/regie/tickets");
      setTickets(data.tickets || []);
    } catch (error) {
      console.error("Erreur chargement tickets", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDiffuseAll = async (ticketId) => {
    // EN MODE DEMO : simuler diffusion
    if (isDemoMode) {
      console.log("🎭 MODE DEMO : diffusion simulée", ticketId);
      alert("✅ Mode DEMO : Ticket diffusé (simulation uniquement)");
      return;
    }

    // EN MODE PRODUCTION : diffusion réelle
    try {
      await apiFetch("/regie/tickets/diffuse", {
        method: "POST",
        body: JSON.stringify({ ticket_id: ticketId }),
      });
      alert("Ticket diffusé à toutes les entreprises");
      loadTickets();
    } catch (error) {
      console.error("Erreur diffusion", error);
      alert("Erreur lors de la diffusion");
    }
  };

  const handleDiffuseRestricted = async (ticketId) => {
    try {
      await apiFetch("/regie/tickets/diffuse", {
        method: "POST",
        body: JSON.stringify({
          ticket_id: ticketId,
          entreprises: [], // Liste vide pour l'instant
        }),
      });
      alert("Diffusion restreinte effectuée");
      loadTickets();
    } catch (error) {
      console.error("Erreur diffusion", error);
      alert("Erreur lors de la diffusion");
    }
  };

  return (
    <Layout>
      <div className="card fade-in">
        <h1 className="page-title">Gestion des tickets</h1>

        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div>
            {tickets.length === 0 ? (
              <p>Aucun ticket</p>
            ) : (
              <ul>
                {tickets.map((ticket) => (
                  <li
                    key={ticket.id}
                    style={{
                      marginBottom: "1rem",
                      padding: "1rem",
                      border: "1px solid #ddd",
                    }}
                  >
                    <h3>{ticket.titre}</h3>
                    <p>Statut : {ticket.statut}</p>
                    <p>Catégorie : {ticket.categorie}</p>
                    <div style={{ marginTop: "0.5rem" }}>
                      <button
                        className="btn hover-glow"
                        onClick={() => handleDiffuseAll(ticket.id)}
                        style={{ marginRight: "0.5rem" }}
                      >
                        Diffuser à toutes les entreprises
                      </button>
                      <button
                        className="btn hover-glow"
                        onClick={() => handleDiffuseRestricted(ticket.id)}
                      >
                        Diffusion restreinte
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
