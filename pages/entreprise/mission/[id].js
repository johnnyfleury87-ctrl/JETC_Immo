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
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Vérifier mode DEMO
    const demoMode = typeof window !== "undefined" && localStorage.getItem("jetc_demo_mode") === "true";
    setIsDemoMode(demoMode);

    console.log("🏗️ ENTREPRISE MISSION DETAIL - Mode DEMO =", demoMode, "ID =", id);

    // EN MODE DEMO : charger données mockées, AUCUN appel API
    if (demoMode && id) {
      const demoMission = {
        id: id,
        titre: "Réparation fuite d'eau",
        description: "Fuite sous lavabo - 12 Rue de la Paix. Intervention urgente requise.",
        categorie: "plomberie",
        statut: "en_cours",
        urgence: "modérée",
        date_creation: "2025-12-10T14:30:00",
        date_souhaitee_intervention: "2025-12-11T10:00:00",
        regie_nom: "Régie Démo Perritie",
        adresse: "12 Rue de la Paix, Paris 75008",
        locataire_nom: "Mme. Dupuis",
        locataire_telephone: "+33 6 98 76 54 32",
      };
      const demoFiles = [
        { id: 1, name: "photo_probleme.jpg", url: "/demo/photo1.jpg" },
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
    // EN MODE DEMO : simuler acceptation
    if (isDemoMode) {
      console.log("🎭 MODE DEMO : acceptation mission simulée", id);
      alert("✅ Mode DEMO : Mission acceptée (simulation uniquement)");
      return;
    }

    // EN MODE PRODUCTION : acceptation réelle
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
            <p>
              <strong>Statut :</strong> {mission.statut}
            </p>
            <p>
              <strong>Description :</strong> {mission.description}
            </p>
            <p>
              <strong>Date souhaitée :</strong>{" "}
              {mission.date_souhaitee_intervention
                ? new Date(
                    mission.date_souhaitee_intervention
                  ).toLocaleDateString()
                : "Non définie"}
            </p>

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
