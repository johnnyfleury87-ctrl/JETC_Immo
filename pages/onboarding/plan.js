import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import { apiFetch, getProfile } from "../../lib/api";

export default function OnboardingPlan() {
  const router = useRouter();
  const { planId } = router.query;
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const profile = await getProfile();
        setUserRole(profile.role);

        const plansData = await apiFetch("/billing/plans");
        const allPlans = plansData.plans || [];

        // Filtrer selon le rôle
        let filteredPlans = allPlans;
        if (profile.role === "regie") {
          filteredPlans = allPlans.filter(p => 
            p.nom_plan.toLowerCase().includes("régie") || 
            p.nom_plan.toLowerCase().includes("regie") ||
            p.nom_plan.toLowerCase().includes("demo")
          );
        } else if (profile.role === "entreprise") {
          filteredPlans = allPlans.filter(p => 
            p.nom_plan.toLowerCase().includes("entreprise") ||
            p.nom_plan.toLowerCase().includes("demo")
          );
        }

        setPlans(filteredPlans);
      } catch (error) {
        console.error("Erreur chargement plans", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleChoosePlan = async (selectedPlanId) => {
    const plan = plans.find(p => p.id === selectedPlanId);
    
    // Si plan DEMO, pas de checkout
    if (plan && plan.prix_mensuel === 0) {
      alert("Mode DEMO activé ! Vous pouvez maintenant accéder à votre tableau de bord.");
      router.push(`/${userRole}/dashboard`);
      return;
    }

    setCheckoutLoading(true);
    try {
      const res = await apiFetch("/billing/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ planId: selectedPlanId })
      });

      if (res.url) {
        // Redirection vers Stripe Checkout
        window.location.href = res.url;
      } else {
        alert("Erreur lors de la création de la session de paiement.");
        setCheckoutLoading(false);
      }
    } catch (error) {
      console.error("Erreur création checkout", error);
      alert("Erreur lors de la création de la session de paiement.");
      setCheckoutLoading(false);
    }
  };

  useEffect(() => {
    // Si un planId est passé en query, on peut le présélectionner
    if (planId && plans.length > 0) {
      const targetPlan = plans.find(p => p.id === parseInt(planId));
      if (targetPlan) {
        // Optionnel : scroll vers ce plan
        console.log("Plan présélectionné:", targetPlan.nom_plan);
      }
    }
  }, [planId, plans]);

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
      padding: "2rem"
    }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <Card style={{ padding: "2rem", marginBottom: "2rem" }}>
          <h1 style={{ 
            textAlign: "center", 
            fontSize: "2rem", 
            margin: "0 0 1rem 0",
            color: "var(--primary)"
          }}>
            💳 Choisissez votre plan
          </h1>
          <p style={{ 
            textAlign: "center", 
            fontSize: "1.1rem", 
            opacity: 0.8,
            marginBottom: 0
          }}>
            Vous pouvez commencer gratuitement en mode DEMO ou souscrire directement à un plan PRO.
          </p>
        </Card>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem"
        }}>
          {plans.map((plan) => {
            const isDemo = plan.prix_mensuel === 0;
            const isPro = plan.prix_mensuel > 0;
            const isPreselected = planId && plan.id === parseInt(planId);

            return (
              <Card 
                key={plan.id}
                className="hover-glow"
                style={{ 
                  padding: "2rem",
                  textAlign: "center",
                  border: isPreselected ? "3px solid var(--accent)" : isPro ? "2px solid var(--primary)" : "1px solid rgba(0,0,0,0.1)",
                  position: "relative"
                }}
              >
                {isPreselected && (
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
                  fontSize: "1.5rem", 
                  margin: "0 0 1rem 0",
                  color: isDemo ? "var(--orange)" : "var(--primary)"
                }}>
                  {plan.nom_plan}
                </h3>

                <div style={{ margin: "1.5rem 0" }}>
                  <span style={{ 
                    fontSize: "2.5rem", 
                    fontWeight: "700",
                    color: "var(--primary)"
                  }}>
                    {isDemo ? "Gratuit" : `${plan.prix_mensuel}€`}
                  </span>
                  {isPro && (
                    <span style={{ fontSize: "1rem", opacity: 0.7 }}> / mois</span>
                  )}
                </div>

                <div style={{ 
                  textAlign: "left", 
                  margin: "2rem 0",
                  minHeight: "150px"
                }}>
                  {isDemo && (
                    <ul style={{ listStyle: "none", padding: 0, fontSize: "0.9rem" }}>
                      <li style={{ padding: "0.4rem 0" }}>✅ Accès limité</li>
                      <li style={{ padding: "0.4rem 0" }}>✅ Mode lecture seule</li>
                      <li style={{ padding: "0.4rem 0" }}>✅ Données de test</li>
                      <li style={{ padding: "0.4rem 0" }}>✅ 1 utilisateur</li>
                    </ul>
                  )}

                  {plan.nom_plan.toLowerCase().includes("régie") && isPro && (
                    <ul style={{ listStyle: "none", padding: 0, fontSize: "0.9rem" }}>
                      <li style={{ padding: "0.4rem 0" }}>✅ Gestion complète</li>
                      <li style={{ padding: "0.4rem 0" }}>✅ Diffusion illimitée</li>
                      <li style={{ padding: "0.4rem 0" }}>✅ Analytics avancés</li>
                      <li style={{ padding: "0.4rem 0" }}>✅ 10 utilisateurs</li>
                      <li style={{ padding: "0.4rem 0" }}>✅ Support prioritaire</li>
                    </ul>
                  )}

                  {plan.nom_plan.toLowerCase().includes("entreprise") && isPro && (
                    <ul style={{ listStyle: "none", padding: 0, fontSize: "0.9rem" }}>
                      <li style={{ padding: "0.4rem 0" }}>✅ Multi-régies</li>
                      <li style={{ padding: "0.4rem 0" }}>✅ 20 techniciens</li>
                      <li style={{ padding: "0.4rem 0" }}>✅ Facturation auto</li>
                      <li style={{ padding: "0.4rem 0" }}>✅ Planning avancé</li>
                      <li style={{ padding: "0.4rem 0" }}>✅ Support prioritaire</li>
                    </ul>
                  )}
                </div>

                <Button
                  onClick={() => handleChoosePlan(plan.id)}
                  disabled={checkoutLoading}
                  style={{ 
                    width: "100%",
                    padding: "1rem",
                    fontSize: "1.1rem",
                    fontWeight: "700",
                    background: isDemo ? "var(--orange)" : "var(--accent)",
                    opacity: checkoutLoading ? 0.6 : 1,
                    cursor: checkoutLoading ? "not-allowed" : "pointer"
                  }}
                  className="hover-bounce"
                >
                  {isDemo ? "🚀 Commencer en DEMO" : "⭐ Passer en PRO"}
                </Button>
              </Card>
            );
          })}
        </div>

        {checkoutLoading && (
          <Card style={{ marginTop: "2rem", padding: "2rem", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "1.1rem", color: "var(--primary)" }}>
              ⏳ Redirection vers le paiement sécurisé...
            </p>
          </Card>
        )}

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Button 
            onClick={() => router.push(`/${userRole}/dashboard`)}
            style={{ 
              background: "transparent", 
              color: "var(--text)",
              border: "1px solid rgba(0,0,0,0.2)"
            }}
          >
            ⏭️ Passer cette étape (rester en DEMO)
          </Button>
        </div>
      </div>
    </div>
  );
}
