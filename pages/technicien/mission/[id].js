import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout";
import SignaturePad from "../../../components/SignaturePad";
import { requireRole } from "../../../lib/roleGuard";
import { getProfile, apiFetch, uploadFile } from "../../../lib/api";
import { saveProfile } from "../../../lib/session";

export default function TechnicienMissionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
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
    requireRole(["technicien"]);

    if (id) {
      loadMission();
      loadFiles();
    }
  }, [id]);

  const loadMission = async () => {
    try {
      const data = await apiFetch(`/technicien/mission/${id}`);
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

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile) return;
    try {
      await uploadFile("/technicien/mission/upload", selectedFile);
      alert("Photo envoyée");
      setSelectedFile(null);
      loadFiles();
    } catch (error) {
      console.error("Erreur upload photo", error);
      alert("Erreur lors de l'envoi");
    }
  };

  const handleSaveSignature = async (blob) => {
    try {
      const file = new File([blob], "signature.png", { type: "image/png" });
      await uploadFile("/technicien/mission/signature", file);
      alert("Signature enregistrée");
      loadFiles();
    } catch (error) {
      console.error("Erreur signature", error);
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handleStart = async () => {
    try {
      await apiFetch("/technicien/mission/start", {
        method: "POST",
        body: JSON.stringify({ mission_id: id }),
      });
      alert("Mission commencée");
      loadMission();
    } catch (error) {
      console.error("Erreur démarrage", error);
      alert("Erreur lors du démarrage");
    }
  };

  const handleEnd = async () => {
    try {
      await apiFetch("/technicien/mission/end", {
        method: "POST",
        body: JSON.stringify({ mission_id: id }),
      });
      alert("Mission terminée");
      loadMission();
    } catch (error) {
      console.error("Erreur fin", error);
      alert("Erreur lors de la fin");
    }
  };

  const handleCancel = async () => {
    try {
      await apiFetch("/technicien/mission/cancel", {
        method: "POST",
        body: JSON.stringify({ mission_id: id }),
      });
      alert("Mission annulée");
      loadMission();
    } catch (error) {
      console.error("Erreur annulation", error);
      alert("Erreur lors de l'annulation");
    }
  };

  return (
    <Layout>
      <div className="card fade-in">
        <h1 className="page-title">Détail de ma mission</h1>

        {loading ? (
          <p>Chargement...</p>
        ) : mission ? (
          <div>
            <h2>Mission #{mission.id}</h2>
            <p>
              <strong>Statut :</strong> {mission.statut}
            </p>
            <p>
              <strong>Locataire :</strong> {mission.locataire_nom || "N/A"}
            </p>
            <p>
              <strong>Adresse :</strong> {mission.adresse || "N/A"}
            </p>
            <p>
              <strong>Description :</strong> {mission.description}
            </p>

            <div style={{ marginTop: "2rem" }}>
              <h3>Ajouter une photo</h3>
              <input type="file" onChange={handleFileChange} accept="image/*" />
              <button
                className="btn hover-glow"
                onClick={handleUploadPhoto}
                style={{ marginLeft: "0.5rem" }}
              >
                Envoyer photo
              </button>
            </div>

            {files.length > 0 && (
              <div style={{ marginTop: "2rem" }}>
                <h3>Photos/Fichiers</h3>
                {files.map((file, index) => (
                  <div key={index} style={{ marginBottom: "1rem" }}>
                    {file.url ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        style={{ maxWidth: "400px" }}
                      />
                    ) : (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {file.name}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            <SignaturePad onSave={handleSaveSignature} />

            <div style={{ marginTop: "2rem" }}>
              {mission.statut === "planifiee" && (
                <button
                  className="btn hover-glow"
                  onClick={handleStart}
                  style={{ marginRight: "0.5rem" }}
                >
                  Commencer
                </button>
              )}

              {mission.statut === "en_cours" && (
                <button
                  className="btn hover-glow"
                  onClick={handleEnd}
                  style={{ marginRight: "0.5rem" }}
                >
                  Terminer
                </button>
              )}

              <button className="btn hover-glow" onClick={handleCancel}>
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <p>Mission introuvable</p>
        )}
      </div>
    </Layout>
  );
}
