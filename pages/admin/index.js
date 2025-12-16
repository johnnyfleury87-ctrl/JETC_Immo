import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import Card from "../../components/UI/Card";
import TicketsPerMonth from "../../components/charts/TicketsPerMonth";
import MissionsPerMonth from "../../components/charts/MissionsPerMonth";
import { apiFetch } from "../../lib/api";
import { checkAdminRole } from "../../lib/adminAuth";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [denialReason, setDenialReason] = useState("");
  const [stats, setStats] = useState({
    regies: 0,
    entreprises: 0,
    locataires: 0,
    techniciens: 0,
    ticketsActifs: 0,
    missionsEnCours: 0,
  });
  const [statsMonthly, setStatsMonthly] = useState({
    crees: 0,
    resolus: 0,
    ratio: 0,
  });
  const [topEntreprises, setTopEntreprises] = useState([]);
  const [topRegies, setTopRegies] = useState([]);
  const [ticketsParMois, setTicketsParMois] = useState([]);
  const [missionsParMois, setMissionsParMois] = useState([]);

  useEffect(() => {
    async function checkAdminAndLoadStats() {
      try {
        // Note: Les steps 1-3 sont déjà loggés dans sendAdminMagicLink
        // Les steps 4-8 sont déjà loggés dans /auth/callback
        // Ici on n'a plus besoin de logger, juste vérifier l'accès

        // Vérification du rôle admin via Supabase
        const { isAdmin, profile, error } = await checkAdminRole();

        if (error) {
          console.warn("[ADMIN][BLOCKED] No session");
          setAccessDenied(true);
          setDenialReason("Session invalide ou expirée");
          setLoading(false);
          setTimeout(() => router.push("/login"), 3000);
          return;
        }

        if (!isAdmin) {
          console.warn("[ADMIN][BLOCKED] Role is not admin", { 
            role: profile?.role || "unknown" 
          });
          setAccessDenied(true);
          setDenialReason(`Rôle requis: admin_jtec (actuel: ${profile?.role || "aucun"})`);
          setLoading(false);
          setTimeout(() => router.push("/"), 3000);
          return;
        }

        // Vérification supplémentaire via API backend
        const profileData = await apiFetch("/me");
        if (profileData.role !== "admin_jtec") {
          console.warn("[ADMIN][BLOCKED] Backend role verification failed", { 
            backendRole: profileData.role 
          });
          setAccessDenied(true);
          setDenialReason("Rôle admin non confirmé par le backend");
          setLoading(false);
          setTimeout(() => router.push("/login"), 3000);
          return;
        }

        // Chargement des KPIs
        const [
          regiesData,
          entreprisesData,
          locatairesData,
          techniciensData,
          ticketsActifsData,
          missionsEnCoursData,
          ticketsMensuelsData,
          topEntreprisesData,
          topRegiesData,
          ticketsAnalyticsData,
          missionsAnalyticsData,
        ] = await Promise.all([
          apiFetch("/admin/stats/regies"),
          apiFetch("/admin/stats/entreprises"),
          apiFetch("/admin/stats/locataires"),
          apiFetch("/admin/stats/techniciens"),
          apiFetch("/admin/stats/tickets_actifs"),
          apiFetch("/admin/stats/missions_encours"),
          apiFetch("/admin/stats/tickets_mensuels"),
          apiFetch("/admin/stats/top_entreprises"),
          apiFetch("/admin/stats/top_regies"),
          apiFetch("/admin/analytics/tickets_par_mois"),
          apiFetch("/admin/analytics/missions_par_mois"),
        ]);

        setStats({
          regies: regiesData.count || 0,
          entreprises: entreprisesData.count || 0,
          locataires: locatairesData.count || 0,
          techniciens: techniciensData.count || 0,
          ticketsActifs: ticketsActifsData.count || 0,
          missionsEnCours: missionsEnCoursData.count || 0,
        });

        setStatsMonthly({
          crees: ticketsMensuelsData.crees || 0,
          resolus: ticketsMensuelsData.resolus || 0,
          ratio: ticketsMensuelsData.ratio || 0,
        });

        setTopEntreprises(topEntreprisesData.entreprises || []);
        setTopRegies(topRegiesData.regies || []);
        setTicketsParMois(ticketsAnalyticsData.data || []);
        setMissionsParMois(missionsAnalyticsData.data || []);
      } catch (error) {
        console.error("Erreur chargement dashboard admin", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    checkAdminAndLoadStats();
  }, []);

  if (loading) {
    return (
      <Layout>
        <Card>
          <p style={{ textAlign: "center", padding: "2rem" }}>
            Vérification des accès admin...
          </p>
        </Card>
      </Layout>
    );
  }

  if (accessDenied) {
    return (
      <Layout>
        <Card>
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <h1 style={{ color: "#c00", marginBottom: "1rem" }}>
              ❌ Accès refusé
            </h1>
            <p style={{ color: "#666", fontSize: "1.1rem", marginBottom: "2rem" }}>
              {denialReason}
            </p>
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "2rem",
              }}
            >
              <p style={{ margin: 0, color: "#991b1b", fontSize: "0.9rem" }}>
                <strong>Rôle requis:</strong> admin_jtec
              </p>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#999" }}>
              Redirection automatique dans 3 secondes...
            </p>
            <p style={{ fontSize: "0.85rem", color: "#999", marginTop: "1rem" }}>
              🔍 Consultez la console pour les logs détaillés ([ADMIN-AUTH])
            </p>
          </div>
        </Card>
      </Layout>
    );
  }

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
        <h1 className="page-title">🎯 Dashboard JTEC</h1>

        {/* KPIs Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <Card
            className="hover-glow"
            style={{
              background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
              color: "white",
              textAlign: "center",
            }}
          >
            <h2 style={{ fontSize: "2.5rem", margin: 0 }}>{stats.regies}</h2>
            <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>🏢 Régies</p>
          </Card>

          <Card
            className="hover-glow"
            style={{
              background: "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
              color: "white",
              textAlign: "center",
            }}
          >
            <h2 style={{ fontSize: "2.5rem", margin: 0 }}>
              {stats.entreprises}
            </h2>
            <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>
              🔧 Entreprises
            </p>
          </Card>

          <Card
            className="hover-glow"
            style={{
              background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
              color: "white",
              textAlign: "center",
            }}
          >
            <h2 style={{ fontSize: "2.5rem", margin: 0 }}>
              {stats.locataires}
            </h2>
            <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>
              👤 Locataires
            </p>
          </Card>

          <Card
            className="hover-glow"
            style={{
              background: "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)",
              color: "white",
              textAlign: "center",
            }}
          >
            <h2 style={{ fontSize: "2.5rem", margin: 0 }}>
              {stats.techniciens}
            </h2>
            <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>
              ⚙️ Techniciens
            </p>
          </Card>

          <Card
            className="hover-glow"
            style={{
              background: "linear-gradient(135deg, #F44336 0%, #D32F2F 100%)",
              color: "white",
              textAlign: "center",
            }}
          >
            <h2 style={{ fontSize: "2.5rem", margin: 0 }}>
              {stats.ticketsActifs}
            </h2>
            <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>
              🎫 Tickets actifs
            </p>
          </Card>

          <Card
            className="hover-glow"
            style={{
              background: "linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)",
              color: "white",
              textAlign: "center",
            }}
          >
            <h2 style={{ fontSize: "2.5rem", margin: 0 }}>
              {stats.missionsEnCours}
            </h2>
            <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>
              🚀 Missions en cours
            </p>
          </Card>
        </div>

        {/* Utilisation générale */}
        <Card style={{ marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>📊 Utilisation ce mois-ci</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            <div
              style={{
                textAlign: "center",
                padding: "1rem",
                background: "var(--background)",
                borderRadius: "8px",
              }}
            >
              <h3
                style={{ fontSize: "2rem", margin: 0, color: "var(--primary)" }}
              >
                {statsMonthly.crees}
              </h3>
              <p style={{ margin: "0.5rem 0 0 0", opacity: 0.7 }}>
                Tickets créés
              </p>
            </div>
            <div
              style={{
                textAlign: "center",
                padding: "1rem",
                background: "var(--background)",
                borderRadius: "8px",
              }}
            >
              <h3
                style={{ fontSize: "2rem", margin: 0, color: "var(--green)" }}
              >
                {statsMonthly.resolus}
              </h3>
              <p style={{ margin: "0.5rem 0 0 0", opacity: 0.7 }}>
                Tickets résolus
              </p>
            </div>
            <div
              style={{
                textAlign: "center",
                padding: "1rem",
                background: "var(--background)",
                borderRadius: "8px",
              }}
            >
              <h3
                style={{ fontSize: "2rem", margin: 0, color: "var(--accent)" }}
              >
                {statsMonthly.ratio}%
              </h3>
              <p style={{ margin: "0.5rem 0 0 0", opacity: 0.7 }}>
                Taux de résolution
              </p>
            </div>
          </div>
        </Card>

        {/* Graphiques Analytics */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <Card>
            <TicketsPerMonth data={ticketsParMois} />
          </Card>
          <Card>
            <MissionsPerMonth data={missionsParMois} />
          </Card>
        </div>

        {/* Top Entreprises */}
        <Card style={{ marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>🏆 Top Entreprises</h2>
          {topEntreprises.length === 0 ? (
            <p style={{ textAlign: "center", opacity: 0.6 }}>
              Aucune donnée disponible
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      background: "var(--background)",
                      borderBottom: "2px solid var(--primary)",
                    }}
                  >
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>
                      Entreprise
                    </th>
                    <th style={{ padding: "0.75rem", textAlign: "center" }}>
                      Missions traitées
                    </th>
                    <th style={{ padding: "0.75rem", textAlign: "center" }}>
                      Taux de réussite
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topEntreprises.map((entreprise, index) => (
                    <tr
                      key={index}
                      style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}
                    >
                      <td style={{ padding: "0.75rem" }}>
                        {entreprise.nom || "N/A"}
                      </td>
                      <td style={{ padding: "0.75rem", textAlign: "center" }}>
                        {entreprise.missions_traitees || 0}
                      </td>
                      <td style={{ padding: "0.75rem", textAlign: "center" }}>
                        <span
                          style={{
                            background:
                              entreprise.taux_reussite >= 80
                                ? "var(--green)"
                                : "var(--orange)",
                            color: "white",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            fontWeight: "600",
                          }}
                        >
                          {entreprise.taux_reussite || 0}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Top Régies */}
        <Card>
          <h2 style={{ marginBottom: "1rem" }}>🏅 Top Régies</h2>
          {topRegies.length === 0 ? (
            <p style={{ textAlign: "center", opacity: 0.6 }}>
              Aucune donnée disponible
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      background: "var(--background)",
                      borderBottom: "2px solid var(--primary)",
                    }}
                  >
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>
                      Régie
                    </th>
                    <th style={{ padding: "0.75rem", textAlign: "center" }}>
                      Tickets créés
                    </th>
                    <th style={{ padding: "0.75rem", textAlign: "center" }}>
                      Taux résolu
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topRegies.map((regie, index) => (
                    <tr
                      key={index}
                      style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}
                    >
                      <td style={{ padding: "0.75rem" }}>
                        {regie.nom || "N/A"}
                      </td>
                      <td style={{ padding: "0.75rem", textAlign: "center" }}>
                        {regie.tickets_crees || 0}
                      </td>
                      <td style={{ padding: "0.75rem", textAlign: "center" }}>
                        <span
                          style={{
                            background:
                              regie.taux_resolu >= 80
                                ? "var(--green)"
                                : "var(--orange)",
                            color: "white",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            fontWeight: "600",
                          }}
                        >
                          {regie.taux_resolu || 0}%
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
