import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { requireRole } from "../../lib/roleGuard";
import { getProfile, apiFetch } from "../../lib/api";
import { saveProfile } from "../../lib/session";

export default function RegieTickets() {
  const [tickets, setTickets] = useState([]);
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
          entreprises: [] // Liste vide pour l'instant
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
                  <li key={ticket.id} style={{ marginBottom: "1rem", padding: "1rem", border: "1px solid #ddd" }}>
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
