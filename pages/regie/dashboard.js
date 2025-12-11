import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import Card from "../../components/UI/Card";
import HeatmapImmeubles from "../../components/charts/HeatmapImmeubles";
import PieCategories from "../../components/charts/PieCategories";
import { requireRole } from "../../lib/roleGuard";
import { getProfile, apiFetch } from "../../lib/api";
import { saveProfile } from "../../lib/session";

export default function RegieDashboard() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({
    ticketsOuverts: 0,
    ticketsAttenteDiffusion: 0,
    missionsEnCours: 0,
    logementsActifs: 0
  });
  const [interventionsImmeubles, setInterventionsImmeubles] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [categories, setCategories] = useState([]);
  const [delais, setDelais] = useState({ moyenne: 0, tendance: [] });
  const [urgences, setUrgences] = useState([]);

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

    const loadData = async () => {
      try {
        const [
          overviewData,
          interventionsData,
          techniciensData,
          categoriesData,
          delaisData,
          urgencesData
        ] = await Promise.all([
          apiFetch("/regie/stats/overview"),
          apiFetch("/regie/analytics/interventions_par_immeuble"),
          apiFetch("/regie/analytics/techniciens"),
          apiFetch("/regie/analytics/categories"),
          apiFetch("/regie/analytics/delais_resolution"),
          apiFetch("/regie/tickets/urgences")
        ]);

        setOverview({
          ticketsOuverts: overviewData.tickets_ouverts || 0,
          ticketsAttenteDiffusion: overviewData.tickets_attente_diffusion || 0,
          missionsEnCours: overviewData.missions_en_cours || 0,
          logementsActifs: overviewData.logements_actifs || 0
        });

        setInterventionsImmeubles(interventionsData.immeubles || []);
        setTechniciens(techniciensData.techniciens || []);
        setCategories(categoriesData.categories || []);
        setDelais({
          moyenne: delaisData.moyenne || 0,
          tendance: delaisData.tendance || []
        });
        setUrgences(urgencesData.urgences || []);
      } catch (error) {
        console.error("Erreur chargement données", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
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
      <Card>
        <h1 className="page-title">🏢 Dashboard Régie</h1>
        
        {/* SECTION A - Vue globale */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem" 
        }}>
          <Card className="hover-glow" style={{ 
            textAlign: "center",
            background: "linear-gradient(135deg, #F44336 0%, #D32F2F 100%)",
            color: "white"
          }}>
            <h2 style={{ fontSize: "2.5rem", margin: 0 }}>{overview.ticketsOuverts}</h2>
            <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>🎫 Tickets ouverts</p>
          </Card>
          
          <Card className="hover-glow" style={{ 
            textAlign: "center",
            background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
            color: "white"
          }}>
            <h2 style={{ fontSize: "2.5rem", margin: 0 }}>{overview.ticketsAttenteDiffusion}</h2>
            <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>⏳ En attente diffusion</p>
          </Card>

          <Card className="hover-glow" style={{ 
            textAlign: "center",
            background: "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
            color: "white"
          }}>
            <h2 style={{ fontSize: "2.5rem", margin: 0 }}>{overview.missionsEnCours}</h2>
            <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>🚀 Missions en cours</p>
          </Card>

          <Card className="hover-glow" style={{ 
            textAlign: "center",
            background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
            color: "white"
          }}>
            <h2 style={{ fontSize: "2.5rem", margin: 0 }}>{overview.logementsActifs}</h2>
            <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>🏠 Logements actifs</p>
          </Card>
        </div>

        {/* SECTION B - Heatmap interventions */}
        <Card style={{ marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>🗺️ Interventions par immeuble</h2>
          <HeatmapImmeubles data={interventionsImmeubles} />
        </Card>

        {/* SECTION C - Performance techniciens */}
        <Card style={{ marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>⚙️ Performance techniciens</h2>
          {techniciens.length === 0 ? (
            <p style={{ textAlign: "center", opacity: 0.6 }}>Aucune donnée disponible</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--background)", borderBottom: "2px solid var(--primary)" }}>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>Nom</th>
                    <th style={{ padding: "0.75rem", textAlign: "center" }}>Missions effectuées</th>
                    <th style={{ padding: "0.75rem", textAlign: "center" }}>Taux de réussite</th>
                    <th style={{ padding: "0.75rem", textAlign: "center" }}>Temps moyen</th>
                  </tr>
                </thead>
                <tbody>
                  {techniciens.map((tech, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                      <td style={{ padding: "0.75rem" }}>👨‍🔧 {tech.nom || "N/A"}</td>
                      <td style={{ padding: "0.75rem", textAlign: "center" }}>{tech.missions_effectuees || 0}</td>
                      <td style={{ padding: "0.75rem", textAlign: "center" }}>
                        <span style={{ 
                          background: tech.taux_reussite >= 80 ? "var(--green)" : "var(--orange)",
                          color: "white",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontWeight: "600"
                        }}>
                          {tech.taux_reussite || 0}%
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem", textAlign: "center" }}>
                        {tech.temps_moyen || 0} jours
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {/* SECTION D - Répartition catégories */}
          <Card>
            <h2 style={{ marginBottom: "1rem" }}>📊 Catégories de tickets</h2>
            <PieCategories data={categories} />
          </Card>

          {/* SECTION E - Délai moyen */}
          <Card>
            <h2 style={{ marginBottom: "1rem" }}>⏱️ Délai moyen de résolution</h2>
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <h3 style={{ fontSize: "3rem", margin: 0, color: "var(--primary)" }}>
                {delais.moyenne} <span style={{ fontSize: "1.5rem", opacity: 0.7 }}>jours</span>
              </h3>
              {delais.tendance && delais.tendance.length > 0 && (
                <div style={{ marginTop: "1rem", display: "flex", alignItems: "flex-end", gap: "0.25rem", height: "60px", justifyContent: "center" }}>
                  {delais.tendance.map((val, idx) => {
                    const maxVal = Math.max(...delais.tendance);
                    const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
                    return (
                      <div key={idx} style={{
                        width: "30px",
                        height: `${height}%`,
                        background: "var(--accent)",
                        borderRadius: "2px",
                        minHeight: "5px"
                      }} />
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* SECTION F - Liste urgences */}
        <Card>
          <h2 style={{ marginBottom: "1rem" }}>🚨 Urgences en cours</h2>
          {urgences.length === 0 ? (
            <p style={{ textAlign: "center", padding: "2rem", opacity: 0.6 }}>Aucune urgence</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--background)", borderBottom: "2px solid var(--primary)" }}>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>Titre</th>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>Locataire</th>
                    <th style={{ padding: "0.75rem", textAlign: "center" }}>Date création</th>
                    <th style={{ padding: "0.75rem", textAlign: "center" }}>Priorité</th>
                  </tr>
                </thead>
                <tbody>
                  {urgences.map((urgence, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                      <td style={{ padding: "0.75rem" }}>{urgence.titre || "N/A"}</td>
                      <td style={{ padding: "0.75rem" }}>👤 {urgence.locataire_nom || "N/A"}</td>
                      <td style={{ padding: "0.75rem", textAlign: "center" }}>
                        {urgence.date_creation ? new Date(urgence.date_creation).toLocaleDateString() : "N/A"}
                      </td>
                      <td style={{ padding: "0.75rem", textAlign: "center" }}>
                        <span style={{
                          background: urgence.priorite === "haute" ? "var(--red)" : urgence.priorite === "moyenne" ? "var(--orange)" : "var(--blue)",
                          color: "white",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontWeight: "600"
                        }}>
                          {urgence.priorite === "haute" ? "🔴 Haute" : urgence.priorite === "moyenne" ? "🟠 Moyenne" : "🔵 Normale"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </Card>
    </Layout>
  );
}
