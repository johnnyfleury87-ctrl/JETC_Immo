import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout";
import { requireRole } from "../../../lib/roleGuard";
import { getProfile, apiFetch } from "../../../lib/api";
import { saveProfile } from "../../../lib/session";

export default function MissionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [mission, setMission] = useState(null);
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
    requireRole(["entreprise"]);

    if (id) {
      loadMission();
      loadFiles();
    }
  }, [id]);

  const loadMission = async () => {
    try {
      const data = await apiFetch(`/entreprise/mission/${id}`);
      setMission(data.mission);
    } catch (error) {
      console.error("Erreur chargement mission", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async () => {
    try {
      const data = await apiFetch(`/files/list?missionId=${id}`);
      setFiles(data.files || []);
    } catch (error) {
      console.error("Erreur chargement fichiers", error);
    }
  };

  const handleAccept = async () => {
    try {
      await apiFetch("/entreprise/mission/accept", {
        method: "POST",
        body: JSON.stringify({ mission_id: id }),
      });
      alert("Mission acceptée");
      loadMission();
    } catch (error) {
      console.error("Erreur acceptation", error);
      alert("Erreur lors de l'acceptation");
    }
  };

  return (
    <Layout>
      <div className="card fade-in">
        <h1 className="page-title">Détail de la mission</h1>
        
        {loading ? (
          <p>Chargement...</p>
        ) : mission ? (
          <div>
            <h2>{mission.titre}</h2>
            <p><strong>Statut :</strong> {mission.statut}</p>
            <p><strong>Description :</strong> {mission.description}</p>
            <p><strong>Date souhaitée :</strong> {mission.date_souhaitee_intervention ? new Date(mission.date_souhaitee_intervention).toLocaleDateString() : "Non définie"}</p>
            
            {files.length > 0 && (
              <div style={{ marginTop: "2rem" }}>
                <h3>Photos/Fichiers</h3>
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
            
            {mission.statut === "en_attente" && (
              <button 
                className="btn hover-glow click-scale" 
                onClick={handleAccept}
                style={{ marginTop: "1rem" }}
              >
                Accepter la mission
              </button>
            )}
          </div>
        ) : (
          <p>Mission introuvable</p>
        )}
      </div>
    </Layout>
  );
}
