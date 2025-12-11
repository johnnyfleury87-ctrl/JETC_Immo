import { useEffect } from "react";
import Layout from "../../components/Layout";
import { requireRole } from "../../lib/roleGuard";
import { getProfile } from "../../lib/api";
import { saveProfile } from "../../lib/session";

export default function RegieLogements() {
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
  }, []);
  return (
    <Layout>
      <div className="card fade-in">
        <h1 className="page-title">Gestion des logements</h1>
      </div>
    </Layout>
  );
}
