import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import { apiFetch } from "../lib/api";

export default function PricingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les plans
        const plansData = await apiFetch("/billing/plans");
        setPlans(plansData.plans || []);

        // Vérifier si l'utilisateur est connecté
        try {
          const userData = await apiFetch("/me");
          setUser(userData);
        } catch {
          // Pas connecté, c'est OK
          setUser(null);
        }
      } catch (error) {
        console.error("Erreur chargement plans", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleChoosePlan = (planId) => {
    if (!user) {
      // Non connecté → redirection inscription
      router.push("/register");
    } else if (user.role === "regie" || user.role === "entreprise") {
      // Connecté et rôle compatible → onboarding plan
      router.push(`/onboarding/plan?planId=${planId}`);
    } else {
      alert("Ce plan est réservé aux régies et entreprises.");
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "var(--background)" 
      }}>
        <Card>
          <p style={{ padding: "2rem" }}>Chargement des plans...</p>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "var(--background)",
      color: "var(--text)"
    }}>
      {/* Header */}
      <header style={{ 
        padding: "1.5rem 2rem", 
        background: "var(--primary)",
        color: "white",
        boxShadow: "var(--shadow)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h1 
          style={{ margin: 0, fontSize: "1.5rem", cursor: "pointer" }}
          onClick={() => router.push("/")}
        >
          🏢 JETC IMMO
        </h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          {!user ? (
            <>
              <Button 
                onClick={() => router.push("/login")}
                style={{ background: "transparent", border: "2px solid white" }}
              >
                🔐 Connexion
              </Button>
              <Button 
                onClick={() => router.push("/register")}
                style={{ background: "white", color: "var(--primary)" }}
              >
                📝 Inscription
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => router.push(`/${user.role}/dashboard`)}
              style={{ background: "white", color: "var(--primary)" }}
            >
              📊 Mon Dashboard
            </Button>
          )}
        </div>
      </header>

      {/* Hero Pricing */}
      <section style={{ 
        textAlign: "center", 
        padding: "3rem 2rem",
        background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
        color: "white"
      }}>
        <h1 style={{ fontSize: "2.5rem", margin: "0 0 1rem 0" }}>
          💰 Tarifs JETC IMMO
        </h1>
        <p style={{ fontSize: "1.2rem", opacity: 0.95, maxWidth: "600px", margin: "0 auto" }}>
          Choisissez le plan adapté à vos besoins. Commencez gratuitement en mode DEMO.
        </p>
      </section>

      {/* Plans */}
      <section style={{ 
        padding: "4rem 2rem",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem"
        }}>
          {plans.map((plan) => {
            const isDemo = plan.nom_plan.toLowerCase().includes("demo");
            const isPro = plan.nom_plan.toLowerCase().includes("pro");

            return (
              <Card 
                key={plan.id}
                className="hover-glow"
                style={{ 
                  padding: "2rem",
                  textAlign: "center",
                  border: isPro ? "3px solid var(--accent)" : "1px solid rgba(0,0,0,0.1)",
                  position: "relative"
                }}
              >
                {isPro && (
                  <div style={{
                    position: "absolute",
                    top: "-15px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--accent)",
                    color: "white",
                    padding: "0.25rem 1rem",
                    borderRadius: "20px",
                    fontSize: "0.85rem",
                    fontWeight: "700"
                  }}>
                    ⭐ RECOMMANDÉ
                  </div>
                )}

                <h3 style={{ 
                  fontSize: "1.8rem", 
                  margin: "0 0 1rem 0",
                  color: isDemo ? "var(--orange)" : "var(--primary)"
                }}>
                  {plan.nom_plan}
                </h3>

                <div style={{ margin: "1.5rem 0" }}>
                  <span style={{ 
                    fontSize: "3rem", 
                    fontWeight: "700",
                    color: "var(--primary)"
                  }}>
                    {plan.prix_mensuel === 0 ? "Gratuit" : `${plan.prix_mensuel}€`}
                  </span>
                  {plan.prix_mensuel > 0 && (
                    <span style={{ fontSize: "1rem", opacity: 0.7 }}> / mois</span>
                  )}
                </div>

                <div style={{ 
                  textAlign: "left", 
                  margin: "2rem 0",
                  minHeight: "200px"
                }}>
                  {/* Features statiques selon le type de plan */}
                  {isDemo && (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                      <li style={{ padding: "0.5rem 0" }}>✅ Accès limité à toutes les fonctionnalités</li>
                      <li style={{ padding: "0.5rem 0" }}>✅ Mode démo (lecture seule pour certaines actions)</li>
                      <li style={{ padding: "0.5rem 0" }}>✅ 1 utilisateur</li>
                      <li style={{ padding: "0.5rem 0" }}>✅ Support communautaire</li>
                      <li style={{ padding: "0.5rem 0", opacity: 0.5 }}>❌ Pas de facturation</li>
                      <li style={{ padding: "0.5rem 0", opacity: 0.5 }}>❌ Données de test uniquement</li>
                    </ul>
                  )}

                  {plan.nom_plan.toLowerCase().includes("régie") && isPro && (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                      <li style={{ padding: "0.5rem 0" }}>✅ Gestion complète du parc immobilier</li>
                      <li style={{ padding: "0.5rem 0" }}>✅ Diffusion illimitée de tickets</li>
                      <li style={{ padding: "0.5rem 0" }}>✅ Dashboard analytique avancé</li>
                      <li style={{ padding: "0.5rem 0" }}>✅ Suivi des interventions en temps réel</li>
                      <li style={{ padding: "0.5rem 0" }}>✅ Jusqu'à 10 utilisateurs</li>
                      <li style={{ padding: "0.5rem 0" }}>✅ Support prioritaire</li>
                      <li style={{ padding: "0.5rem 0" }}>✅ Exports et rapports</li>
                    </ul>
                  )}

                  {plan.nom_plan.toLowerCase().includes("entreprise") && isPro && (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                      <li style={{ padding: "0.5rem 0" }}>✅ Réception de tickets multi-régies</li>
                      <li style={{ padding: "0.5rem 0" }}>✅ Gestion d'équipe de techniciens</li>
                      <li style={{ padding: "0.5rem 0" }}>✅ Planification avancée des missions</li>
                      <li style={{ padding: "0.5rem 0" }}>✅ Facturation automatisée</li>
                      <li style={{ padding: "0.5rem 0" }}>✅ Jusqu'à 20 techniciens</li>
                      <li style={{ padding: "0.5rem 0" }}>✅ Support prioritaire</li>
                      <li style={{ padding: "0.5rem 0" }}>✅ API access</li>
                    </ul>
                  )}
                </div>

                <Button
                  onClick={() => handleChoosePlan(plan.id)}
                  style={{ 
                    width: "100%",
                    padding: "1rem",
                    fontSize: "1.1rem",
                    fontWeight: "700",
                    background: isDemo ? "var(--orange)" : isPro ? "var(--accent)" : "var(--primary)"
                  }}
                  className="hover-bounce"
                >
                  {isDemo ? "🚀 Commencer gratuitement" : "⭐ Choisir ce plan"}
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        textAlign: "center", 
        padding: "2rem",
        background: "var(--card-bg)",
        marginTop: "4rem",
        borderTop: "1px solid rgba(0,0,0,0.1)"
      }}>
        <p style={{ margin: 0, opacity: 0.7 }}>
          © 2025 JETC IMMO - Tous droits réservés
        </p>
      </footer>
    </div>
  );
}
