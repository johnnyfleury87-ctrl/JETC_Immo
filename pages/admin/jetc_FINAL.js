import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import StatusBadge from "../../components/UI/StatusBadge";
import { supabase } from "../../lib/supabase";

/**
 * Page Admin JETC - Gestion des demandes d'adhésion
 * 
 * LOGIQUE D'AUTORISATION UNIQUE :
 * - Source de vérité : public.profiles.role === 'admin_jtec'
 * - 3 états possibles : loading, forbidden (redirect), admin (UI)
 * - Aucun blocage infini autorisé
 */
export default function AdminJetcPage() {
  const router = useRouter();
  
  // États
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ========================================
  // AUTORISATION (exécution unique)
  // ========================================
  useEffect(() => {
    async function checkAuth() {
      try {
        // 1. Vérifier session Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.warn('[Admin] Session invalide');
          router.replace("/login");
          return;
        }

        // 2. Récupérer profile depuis public.profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // 3. Gérer erreur explicitement (jamais de null silencieux)
        if (profileError) {
          console.error('[Admin] Erreur récupération profile:', profileError.message);
          router.replace("/login");
          return;
        }

        // 4. Vérifier autorisation admin
        if (!profileData || profileData.role !== "admin_jtec") {
          console.warn('[Admin] Accès refusé, role:', profileData?.role);
          router.replace("/login");
          return;
        }

        // 5. Autorisation OK - Charger le profile
        setProfile(profileData);
        setLoading(false);
        
        // Cache pour Layout (optionnel)
        try {
          sessionStorage.setItem('jetc_profile', JSON.stringify(profileData));
        } catch (e) {
          // Ignore sessionStorage errors
        }
        
      } catch (error) {
        console.error('[Admin] Exception:', error);
        router.replace("/login");
      }
    }

    checkAuth();
  }, []); // Exécution unique - AUCUNE dépendance

  // ========================================
  // CHARGEMENT DES DEMANDES
  // ========================================
  useEffect(() => {
    if (!profile) return;

    async function loadRequests() {
      try {
        let query = supabase
          .from("adhesion_requests_summary")
          .select("*")
          .order("created_at", { ascending: false });

        if (filter !== "all") {
          query = query.eq("status", filter);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error('[Admin] Erreur chargement demandes:', error);
          return;
        }
        
        setRequests(data || []);
      } catch (error) {
        console.error('[Admin] Exception chargement demandes:', error);
      }
    }

    loadRequests();
  }, [profile, filter]);

  // ========================================
  // ACTIONS
  // ========================================
  const handleValidate = async (requestId) => {
    if (!profile?.id) {
      alert("Erreur: profil non chargé");
      return;
    }

    if (!confirm("Confirmer la validation de cette demande ?")) {
      return;
    }

    setActionLoading(true);

    try {
      const response = await fetch("/api/admin/validate-adhesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, adminId: profile.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur validation");
      }

      alert("✅ Demande validée avec succès !");
      
      // Recharger
      const { data } = await supabase
        .from('adhesion_requests_summary')
        .select('*')
        .order('created_at', { ascending: false });
      setRequests(data || []);
      
    } catch (error) {
      console.error('[Admin] Erreur validation:', error);
      alert("❌ Erreur : " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    if (!profile?.id) {
      alert("Erreur: profil non chargé");
      return;
    }

    const reason = prompt("Raison du rejet (optionnel) :");
    if (reason === null) return;

    setActionLoading(true);

    try {
      const response = await fetch("/api/admin/reject-adhesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, adminId: profile.id, reason }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur rejet");
      }

      alert("✅ Demande rejetée.");
      
      // Recharger
      const { data } = await supabase
        .from('adhesion_requests_summary')
        .select('*')
        .order('created_at', { ascending: false });
      setRequests(data || []);
      
    } catch (error) {
      console.error('[Admin] Erreur rejet:', error);
      alert("❌ Erreur : " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ========================================
  // RENDER (3 états possibles)
  // ========================================
  
  // État 1: Loading (vérification auth en cours)
  if (loading) {
    return (
      <Layout>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p>Chargement...</p>
        </div>
      </Layout>
    );
  }

  // État 2: Erreur critique (ne devrait jamais arriver)
  if (!profile) {
    return (
      <Layout>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ color: "#ef4444" }}>
            Erreur de chargement. Veuillez vous reconnecter.
          </p>
        </div>
      </Layout>
    );
  }

  // État 3: Admin autorisé - Afficher UI
  return (
    <Layout>
      <div style={{ padding: "2rem", minHeight: "80vh" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
              👨‍💼 Administration JETC
            </h1>
            <p style={{ color: "#64748b" }}>
              Gestion des demandes d'adhésion - Connecté en tant que <strong>{profile.email}</strong>
            </p>
          </div>

          {/* Filtres */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
            {[
              { value: "pending", label: "En attente", color: "#f59e0b" },
              { value: "approved", label: "Validées", color: "#10b981" },
              { value: "rejected", label: "Rejetées", color: "#ef4444" },
              { value: "all", label: "Toutes", color: "#6b7280" },
            ].map((f) => (
              <Button
                key={f.value}
                onClick={() => setFilter(f.value)}
                style={{
                  background: filter === f.value ? f.color : "#f1f5f9",
                  color: filter === f.value ? "white" : "#1e293b",
                  border: filter === f.value ? "none" : "1px solid #cbd5e1",
                  padding: "0.5rem 1.5rem",
                }}
              >
                {f.label} ({requests.filter((r) => f.value === "all" || r.status === f.value).length})
              </Button>
            ))}
          </div>

          {/* Liste */}
          {requests.length === 0 ? (
            <Card style={{ padding: "3rem", textAlign: "center" }}>
              <p style={{ fontSize: "1.2rem", color: "#64748b" }}>
                Aucune demande {filter !== "all" ? `en statut "${filter}"` : ""}.
              </p>
            </Card>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ 
                width: "100%", 
                borderCollapse: "collapse", 
                background: "white", 
                borderRadius: "8px", 
                overflow: "hidden", 
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)" 
              }}>
                <thead style={{ background: "#f8fafc" }}>
                  <tr>
                    <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>Date</th>
                    <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>Régie</th>
                    <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>Ville</th>
                    <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>Plan</th>
                    <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>Contact</th>
                    <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>Logements</th>
                    <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>Statut</th>
                    <th style={{ padding: "1rem", textAlign: "center", borderBottom: "2px solid #e2e8f0" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "1rem" }}>
                        {req.created_at ? new Date(req.created_at).toLocaleDateString("fr-FR") : '-'}
                      </td>
                      <td style={{ padding: "1rem", fontWeight: "600" }}>
                        {req.regie_name || '-'}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        {req.city || '-'}, {req.country || '-'}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "12px",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          background: req.plan_requested === "Essentiel" ? "#d1fae5" : req.plan_requested === "Pro" ? "#dbeafe" : "#fef3c7",
                          color: req.plan_requested === "Essentiel" ? "#065f46" : req.plan_requested === "Pro" ? "#1e40af" : "#92400e",
                        }}>
                          {req.plan_requested || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: "1rem", fontSize: "0.9rem" }}>
                        <div>{req.owner_name || '-'}</div>
                        <div style={{ color: "#64748b", fontSize: "0.85rem" }}>
                          {req.owner_email || '-'}
                        </div>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{ 
                          fontWeight: req.over_logements_limit ? "700" : "normal", 
                          color: req.over_logements_limit ? "#ef4444" : "inherit" 
                        }}>
                          {req.logements_estimes || '0'}
                        </span>
                        {req.over_logements_limit ? <span style={{ color: "#ef4444", marginLeft: "0.25rem" }}>⚠️</span> : null}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <StatusBadge
                          status={req.status === "pending" ? "en_attente" : req.status === "approved" ? "termine" : req.status === "rejected" ? "annule" : "en_cours"}
                          text={req.status === "pending" ? "En attente" : req.status === "approved" ? "Validée" : req.status === "rejected" ? "Rejetée" : req.status}
                        />
                      </td>
                      <td style={{ padding: "1rem", textAlign: "center" }}>
                        {req.status === "pending" ? (
                          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                            <Button
                              onClick={() => handleValidate(req.id)}
                              disabled={actionLoading}
                              style={{
                                background: "#10b981",
                                color: "white",
                                padding: "0.4rem 0.8rem",
                                fontSize: "0.85rem",
                              }}
                            >
                              ✅ Valider
                            </Button>
                            <Button
                              onClick={() => handleReject(req.id)}
                              disabled={actionLoading}
                              style={{
                                background: "#ef4444",
                                color: "white",
                                padding: "0.4rem 0.8rem",
                                fontSize: "0.85rem",
                              }}
                            >
                              ❌ Rejeter
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => setSelectedRequest(req)}
                            style={{
                              background: "#f1f5f9",
                              color: "#1e293b",
                              padding: "0.4rem 0.8rem",
                              fontSize: "0.85rem",
                            }}
                          >
                            👁️ Détails
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal détails */}
          {selectedRequest ? (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: "2rem",
              }}
              onClick={() => setSelectedRequest(null)}
            >
              <Card
                style={{ maxWidth: "600px", padding: "2rem", maxHeight: "80vh", overflowY: "auto" }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 style={{ marginBottom: "1.5rem" }}>Détails de la demande</h2>

                <div style={{ marginBottom: "1rem" }}>
                  <strong>Régie:</strong> {selectedRequest.regie_name || '-'}
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <strong>Ville:</strong> {selectedRequest.city || '-'}, {selectedRequest.country || '-'}
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <strong>Plan demandé:</strong> {selectedRequest.plan_requested || '-'} ({selectedRequest.plan_prix || '0'} CHF/mois)
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <strong>Logements estimés:</strong> {selectedRequest.logements_estimes || '0'}
                  {selectedRequest.over_logements_limit ? (
                    <span style={{ color: "#ef4444", marginLeft: "0.5rem" }}>
                      (dépasse limite: {selectedRequest.plan_max_logements || 'N/A'})
                    </span>
                  ) : null}
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <strong>Contact:</strong> {selectedRequest.owner_name || '-'}
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <strong>Email:</strong> {selectedRequest.owner_email || '-'}
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <strong>Téléphone:</strong> {selectedRequest.owner_phone || '-'}
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <strong>Statut:</strong>{" "}
                  <StatusBadge
                    status={selectedRequest.status === "pending" ? "en_attente" : selectedRequest.status === "approved" ? "termine" : "annule"}
                    text={selectedRequest.status === "pending" ? "En attente" : selectedRequest.status === "approved" ? "Validée" : selectedRequest.status === "rejected" ? "Rejetée" : String(selectedRequest.status || 'Inconnu')}
                  />
                </div>
                {selectedRequest.rejection_reason ? (
                  <div style={{ marginBottom: "1rem", padding: "1rem", background: "#fef2f2", borderRadius: "6px" }}>
                    <strong style={{ color: "#ef4444" }}>Raison du rejet:</strong>
                    <p style={{ margin: "0.5rem 0 0 0" }}>{String(selectedRequest.rejection_reason)}</p>
                  </div>
                ) : null}
                {selectedRequest.validated_by_name && selectedRequest.validated_at ? (
                  <div style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "#64748b" }}>
                    Traité par {selectedRequest.validated_by_name} le{" "}
                    {new Date(selectedRequest.validated_at).toLocaleString("fr-FR")}
                  </div>
                ) : null}

                <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
                  <Button onClick={() => setSelectedRequest(null)}>Fermer</Button>
                </div>
              </Card>
            </div>
          ) : null}
        </div>
      </div>
    </Layout>
  );
}
