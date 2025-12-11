import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import StatusBadge from "../../components/UI/StatusBadge";
import { requireRole } from "../../lib/roleGuard";
import { getProfile, apiFetch, uploadFile } from "../../lib/api";
import { saveProfile } from "../../lib/session";

export default function LocataireTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [categorie, setCategorie] = useState("plomberie");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");

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

    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const data = await apiFetch("/tickets/mine");
      setTickets(data.tickets || []);
    } catch (error) {
      console.error("Erreur chargement tickets", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const ticketData = await apiFetch("/tickets/create", {
        method: "POST",
        body: JSON.stringify({ titre, description, categorie }),
      });

      // Upload photo si un fichier est sélectionné
      if (selectedFile && ticketData.ticket && ticketData.ticket.id) {
        try {
          const uploadData = await uploadFile("/tickets/upload", selectedFile);
          setUploadedFileName(uploadData.fileName || "Photo envoyée");
        } catch (error) {
          console.error("Erreur upload photo", error);
        }
      }

      setTitre("");
      setDescription("");
      setCategorie("plomberie");
      setSelectedFile(null);
      setUploadedFileName("");
      setShowForm(false);
      loadTickets();
    } catch (error) {
      console.error("Erreur création ticket", error);
    }
  };

  return (
    <Layout>
      <Card>
        <h1 className="page-title">🎫 Mes tickets</h1>
        
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Annuler" : "➕ Créer un ticket"}
        </Button>

        {showForm && (
          <form onSubmit={handleCreateTicket} style={{ 
            marginTop: "1.5rem", 
            padding: "1.5rem", 
            background: "var(--background)",
            borderRadius: "8px"
          }}>
            <label style={{ fontWeight: "600", marginBottom: "0.5rem", display: "block" }}>Titre</label>
            <input 
              className="input"
              type="text" 
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              required
            />
            
            <label style={{ fontWeight: "600", marginBottom: "0.5rem", display: "block" }}>Description</label>
            <textarea 
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              required
            />
            
            <label style={{ fontWeight: "600", marginBottom: "0.5rem", display: "block" }}>Catégorie</label>
            <select className="input" value={categorie} onChange={(e) => setCategorie(e.target.value)}>
              <option value="plomberie">🚰 Plomberie</option>
              <option value="electricite">⚡ Électricité</option>
              <option value="chauffage">🔥 Chauffage</option>
              <option value="autre">📋 Autre</option>
            </select>

            <label style={{ fontWeight: "600", marginBottom: "0.5rem", display: "block" }}>Photo (optionnelle)</label>
            <input 
              type="file" 
              onChange={handleFileChange}
              accept="image/*"
              style={{ marginBottom: "1rem" }}
            />
            {uploadedFileName && <p style={{ color: "var(--green)", fontWeight: "600" }}>✅ {uploadedFileName}</p>}

            <Button type="submit">Créer le ticket</Button>
          </form>
        )}
        
        {loading ? (
          <p style={{ textAlign: "center", padding: "2rem" }}>Chargement...</p>
        ) : (
          <div style={{ marginTop: "2rem" }}>
            {tickets.length === 0 ? (
              <p style={{ textAlign: "center", padding: "2rem", color: "var(--text)", opacity: 0.6 }}>
                Aucun ticket pour le moment
              </p>
            ) : (
              <div style={{ display: "grid", gap: "1rem" }}>
                {tickets.map((ticket) => (
                  <Card key={ticket.id} className="hover-glow" style={{ cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div>
                        <h3 style={{ marginBottom: "0.5rem", color: "var(--primary)" }}>
                          🎫 {ticket.titre}
                        </h3>
                        <StatusBadge status={ticket.statut} />
                      </div>
                      <span style={{ fontSize: "0.85rem", color: "var(--text)", opacity: 0.7 }}>
                        {new Date(ticket.date_creation).toLocaleDateString()}
                      </span>
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
