import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout";
import { requireRole } from "../../../lib/roleGuard";
import { getProfile, apiFetch } from "../../../lib/api";
import { saveProfile } from "../../../lib/session";

export default function TicketDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);

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
    requireRole(["locataire"]);

    if (id) {
      loadTicket();
      loadFiles();
    }
  }, [id]);

  const loadTicket = async () => {
    try {
      const data = await apiFetch(`/tickets/${id}`);
      setTicket(data.ticket);
    } catch (error) {
      console.error("Erreur chargement ticket", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async () => {
    try {
      const data = await apiFetch(`/files/list?ticketId=${id}`);
      setFiles(data.files || []);
    } catch (error) {
      console.error("Erreur chargement fichiers", error);
    }
  };

  return (
    <Layout>
      <div className="card fade-in">
        <h1 className="page-title">Détail du ticket</h1>
        
        {loading ? (
          <p>Chargement...</p>
        ) : ticket ? (
          <div>
            <h2>{ticket.titre}</h2>
            <p><strong>Statut :</strong> {ticket.statut}</p>
            <p><strong>Catégorie :</strong> {ticket.categorie}</p>
            <p><strong>Description :</strong> {ticket.description}</p>
            <p><strong>Date création :</strong> {new Date(ticket.date_creation).toLocaleDateString()}</p>
            
            {files.length > 0 && (
              <div style={{ marginTop: "2rem" }}>
                <h3>Photos</h3>
                {files.map((file, index) => (
                  <div key={index} style={{ marginBottom: "1rem" }}>
                    {file.url ? (
                      <img src={file.url} alt={file.name} style={{ maxWidth: "400px" }} />
                    ) : (
                      <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {ticket.historique && ticket.historique.length > 0 && (
              <div style={{ marginTop: "2rem" }}>
                <h3>Historique</h3>
                <ul>
                  {ticket.historique.map((event, index) => (
                    <li key={index}>{event}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p>Ticket introuvable</p>
        )}
      </div>
    </Layout>
  );
}

  return (
    <Layout>
      <div className="card fade-in">
        <h1 className="page-title">Détail du ticket</h1>
        
        {loading ? (
          <p>Chargement...</p>
        ) : ticket ? (
          <div>
            <h2>{ticket.titre}</h2>
            <p><strong>Statut :</strong> {ticket.statut}</p>
            <p><strong>Catégorie :</strong> {ticket.categorie}</p>
            <p><strong>Description :</strong> {ticket.description}</p>
            <p><strong>Date création :</strong> {new Date(ticket.date_creation).toLocaleDateString()}</p>
            
            {ticket.historique && ticket.historique.length > 0 && (
              <div style={{ marginTop: "2rem" }}>
                <h3>Historique</h3>
                <ul>
                  {ticket.historique.map((event, index) => (
                    <li key={index}>{event}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p>Ticket introuvable</p>
        )}
      </div>
    </Layout>
  );
}
