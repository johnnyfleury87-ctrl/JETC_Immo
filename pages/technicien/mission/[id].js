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
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Vérifier mode DEMO
    const demoMode = typeof window !== "undefined" && localStorage.getItem("jetc_demo_mode") === "true";
    setIsDemoMode(demoMode);

    console.log("🔧 TECHNICIEN MISSION DETAIL - Mode DEMO =", demoMode, "ID =", id);

    // EN MODE DEMO : charger données mockées, AUCUN appel API
    if (demoMode && id) {
      const demoMission = {
        id: id,
        titre: "Réparation fuite d'eau",
        description: "Fuite sous le lavabo, urgence modérée. Matériel requis: Joint de lavabo, ruban téflon.",
        categorie: "plomberie",
        statut: "en_cours",
        urgence: "modérée",
        date_creation: "2025-12-10T14:30:00",
        date_intervention: "2025-12-11T10:00:00",
        adresse: "12 Rue de la Paix",
        ville: "Paris 75008",
        client_nom: "Régie Démo Perritie",
        locataire_nom: "Mme. Dupuis",
        temps_estime: "2h",
        instructions: "Accès par code 1234A. Appartement 3B au 2ème étage.",
      };
      const demoFiles = [
        { id: 1, name: "photo_avant.jpg", url: "/demo/photo1.jpg" },
        { id: 2, name: "photo_travaux.jpg", url: "/demo/photo2.jpg" },
      ];
      setMission(demoMission);
      setFiles(demoFiles);
      setLoading(false);
      console.log("✅ Données DEMO chargées:", demoMission);
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

    // EN MODE DEMO : simuler upload
    if (isDemoMode) {
      console.log("🎭 MODE DEMO : upload photo simulé", selectedFile.name);
      alert("✅ Mode DEMO : Photo envoyée (simulation uniquement)");
      setSelectedFile(null);
      return;
    }

    // EN MODE PRODUCTION : upload réel
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
    // EN MODE DEMO : simuler signature
    if (isDemoMode) {
      console.log("🎭 MODE DEMO : signature simulée");
      alert("✅ Mode DEMO : Signature enregistrée (simulation uniquement)");
      return;
    }

    // EN MODE PRODUCTION : signature réelle
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
    // EN MODE DEMO : simuler démarrage
    if (isDemoMode) {
      console.log("🎭 MODE DEMO : démarrage mission simulé", id);
      alert("✅ Mode DEMO : Mission commencée (simulation uniquement)");
      return;
    }

    // EN MODE PRODUCTION : démarrage réel
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
    // EN MODE DEMO : simuler fin
    if (isDemoMode) {
      console.log("🎭 MODE DEMO : fin mission simulée", id);
      alert("✅ Mode DEMO : Mission terminée (simulation uniquement)");
      return;
    }

    // EN MODE PRODUCTION : fin réelle
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
    // EN MODE DEMO : simuler annulation
    if (isDemoMode) {
      console.log("🎭 MODE DEMO : annulation mission simulée", id);
      alert("✅ Mode DEMO : Mission annulée (simulation uniquement)");
      return;
    }

    // EN MODE PRODUCTION : annulation réelle
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
