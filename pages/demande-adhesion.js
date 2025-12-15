import { useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import { supabase } from "../lib/supabase";

// Client Supabase singleton

export default function DemandeAdhesionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    // Plan
    plan_requested: router.query.plan || "Pro",

    // Informations régie
    regie_name: "",
    city: "",
    country: "Suisse",
    siret: "",

    // Estimations
    logements_estimes: "",
    nb_admins_estimes: 1,
    nb_users_estimes: 2,
    nb_entreprises_estimees: 0,

    // Contact principal (futur owner)
    owner_firstname: "",
    owner_lastname: "",
    owner_email: "",
    owner_phone: "",

    // Mode gestion locataires
    locataires_import_mode: "later",

    // Motivation (optionnel)
    motivation: "",
  });

  const [errors, setErrors] = useState({});

  const plans = [
    {
      name: "Essentiel",
      price: "49 CHF/mois",
      maxLogements: 25,
      maxUsers: 2,
      maxAdmins: 1,
      maxEntreprises: 5,
      color: "#10b981",
      icon: "🌱",
    },
    {
      name: "Pro",
      price: "99 CHF/mois",
      maxLogements: 150,
      maxUsers: 5,
      maxAdmins: 1,
      maxEntreprises: "∞",
      color: "#4f46e5",
      icon: "⚡",
      badge: "Le plus populaire",
    },
    {
      name: "Premium",
      price: "199 CHF/mois",
      maxLogements: "∞",
      maxUsers: "∞",
      maxAdmins: "∞",
      maxEntreprises: "∞",
      color: "#8b5cf6",
      icon: "👑",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      if (!formData.regie_name.trim()) newErrors.regie_name = "Nom de régie requis";
      if (!formData.city.trim()) newErrors.city = "Ville requise";
      if (!formData.logements_estimes || formData.logements_estimes <= 0) {
        newErrors.logements_estimes = "Nombre de logements requis (min. 1)";
      }
    }

    if (stepNumber === 2) {
      if (!formData.owner_firstname.trim()) newErrors.owner_firstname = "Prénom requis";
      if (!formData.owner_lastname.trim()) newErrors.owner_lastname = "Nom requis";
      if (!formData.owner_email.trim()) {
        newErrors.owner_email = "Email requis";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.owner_email)) {
        newErrors.owner_email = "Email invalide";
      }
      if (!formData.owner_phone.trim()) newErrors.owner_phone = "Téléphone requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(step)) return;

    setLoading(true);

    try {
      // Insérer dans adhesion_requests (policy publique)
      const { data, error } = await supabase.from("adhesion_requests").insert([
        {
          plan_requested: formData.plan_requested,
          regie_name: formData.regie_name,
          city: formData.city,
          country: formData.country,
          siret: formData.siret || null,
          logements_estimes: parseInt(formData.logements_estimes),
          nb_admins_estimes: parseInt(formData.nb_admins_estimes),
          nb_users_estimes: parseInt(formData.nb_users_estimes),
          nb_entreprises_estimees: parseInt(formData.nb_entreprises_estimees),
          owner_firstname: formData.owner_firstname,
          owner_lastname: formData.owner_lastname,
          owner_email: formData.owner_email.toLowerCase(),
          owner_phone: formData.owner_phone,
          locataires_import_mode: formData.locataires_import_mode,
          motivation: formData.motivation || null,
          status: "pending",
        },
      ]);

      if (error) {
        console.error("Erreur insertion:", error);
        alert("Erreur lors de la soumission. Vérifiez que l'email n'est pas déjà utilisé.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Erreur:", err);
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <div
          style={{
            minHeight: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <Card style={{ maxWidth: "600px", textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
            <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#1e293b" }}>
              Demande envoyée avec succès !
            </h1>
            <p style={{ fontSize: "1.1rem", color: "#64748b", marginBottom: "2rem" }}>
              Merci <strong>{formData.owner_firstname}</strong> !<br />
              Votre demande d'adhésion au plan <strong>{formData.plan_requested}</strong> a bien été reçue.
            </p>

            <div
              style={{
                background: "#f1f5f9",
                padding: "1.5rem",
                borderRadius: "8px",
                marginBottom: "2rem",
                textAlign: "left",
              }}
            >
              <h3 style={{ marginBottom: "1rem", color: "#1e293b" }}>🕐 Prochaines étapes</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                <li style={{ marginBottom: "0.5rem", display: "flex", alignItems: "start" }}>
                  <span style={{ marginRight: "0.5rem" }}>1️⃣</span>
                  <span>Notre équipe JETC examine votre demande (sous 24-48h)</span>
                </li>
                <li style={{ marginBottom: "0.5rem", display: "flex", alignItems: "start" }}>
                  <span style={{ marginRight: "0.5rem" }}>2️⃣</span>
                  <span>Vous recevrez un email de confirmation à <strong>{formData.owner_email}</strong></span>
                </li>
                <li style={{ marginBottom: "0.5rem", display: "flex", alignItems: "start" }}>
                  <span style={{ marginRight: "0.5rem" }}>3️⃣</span>
                  <span>Après validation, vous pourrez créer votre mot de passe et accéder à votre espace</span>
                </li>
              </ul>
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <Button onClick={() => router.push("/")} variant="secondary">
                Retour à l'accueil
              </Button>
              <Button onClick={() => router.push("/demo-hub")} variant="secondary">
                Tester en mode DEMO
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "2rem 1rem",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", color: "white", marginBottom: "3rem" }}>
            <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
              Demande d'adhésion JETC IMMO
            </h1>
            <p style={{ fontSize: "1.1rem", opacity: 0.9 }}>
              Remplissez le formulaire ci-dessous. Notre équipe validera votre demande sous 24-48h.
            </p>
          </div>

          {/* Progress bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "2rem",
              padding: "0 2rem",
            }}
          >
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  textAlign: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: step >= s ? "#10b981" : "#cbd5e1",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    margin: "0 auto 0.5rem",
                  }}
                >
                  {s}
                </div>
                <div style={{ color: "white", fontSize: "0.9rem" }}>
                  {s === 1 && "Régie & Plan"}
                  {s === 2 && "Contact"}
                  {s === 3 && "Finalisation"}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <Card style={{ padding: "2rem" }}>
            <form onSubmit={handleSubmit}>
              {/* STEP 1 : Régie & Plan */}
              {step === 1 && (
                <>
                  <h2 style={{ marginBottom: "2rem", color: "#1e293b" }}>
                    📋 Informations régie et plan
                  </h2>

                  {/* Choix du plan */}
                  <div style={{ marginBottom: "2rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                      Plan souhaité *
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                      {plans.map((plan) => (
                        <div
                          key={plan.name}
                          onClick={() => setFormData((prev) => ({ ...prev, plan_requested: plan.name }))}
                          style={{
                            padding: "1rem",
                            border: formData.plan_requested === plan.name ? `3px solid ${plan.color}` : "2px solid #e2e8f0",
                            borderRadius: "8px",
                            cursor: "pointer",
                            position: "relative",
                            background: formData.plan_requested === plan.name ? `${plan.color}10` : "white",
                            transition: "all 0.2s",
                          }}
                        >
                          {plan.badge && (
                            <div
                              style={{
                                position: "absolute",
                                top: "-10px",
                                right: "10px",
                                background: plan.color,
                                color: "white",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "4px",
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                              }}
                            >
                              {plan.badge}
                            </div>
                          )}
                          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{plan.icon}</div>
                          <div style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>{plan.name}</div>
                          <div style={{ fontSize: "0.9rem", color: "#64748b" }}>{plan.price}</div>
                          <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "0.5rem" }}>
                            {plan.maxLogements} logements
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nom régie */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                      Nom de la régie *
                    </label>
                    <input
                      type="text"
                      name="regie_name"
                      value={formData.regie_name}
                      onChange={handleChange}
                      placeholder="Ex: Régie Immobilière Lausanne SA"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: errors.regie_name ? "2px solid #ef4444" : "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "1rem",
                      }}
                    />
                    {errors.regie_name && (
                      <div style={{ color: "#ef4444", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                        {errors.regie_name}
                      </div>
                    )}
                  </div>

                  {/* Ville + Pays */}
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                        Ville *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Lausanne"
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: errors.city ? "2px solid #ef4444" : "1px solid #cbd5e1",
                          borderRadius: "6px",
                          fontSize: "1rem",
                        }}
                      />
                      {errors.city && (
                        <div style={{ color: "#ef4444", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                          {errors.city}
                        </div>
                      )}
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                        Pays
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          fontSize: "1rem",
                        }}
                      />
                    </div>
                  </div>

                  {/* Nombre logements */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                      Nombre de logements à gérer *
                    </label>
                    <input
                      type="number"
                      name="logements_estimes"
                      value={formData.logements_estimes}
                      onChange={handleChange}
                      placeholder="50"
                      min="1"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: errors.logements_estimes ? "2px solid #ef4444" : "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "1rem",
                      }}
                    />
                    {errors.logements_estimes && (
                      <div style={{ color: "#ef4444", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                        {errors.logements_estimes}
                      </div>
                    )}
                  </div>

                  {/* SIRET (optionnel) */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                      SIRET (optionnel)
                    </label>
                    <input
                      type="text"
                      name="siret"
                      value={formData.siret}
                      onChange={handleChange}
                      placeholder="12345678901234"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "1rem",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                    <Button onClick={handleNext} type="button">
                      Suivant →
                    </Button>
                  </div>
                </>
              )}

              {/* STEP 2 : Contact */}
              {step === 2 && (
                <>
                  <h2 style={{ marginBottom: "2rem", color: "#1e293b" }}>
                    👤 Contact principal (Administrateur)
                  </h2>

                  {/* Prénom + Nom */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                        Prénom *
                      </label>
                      <input
                        type="text"
                        name="owner_firstname"
                        value={formData.owner_firstname}
                        onChange={handleChange}
                        placeholder="Jean"
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: errors.owner_firstname ? "2px solid #ef4444" : "1px solid #cbd5e1",
                          borderRadius: "6px",
                          fontSize: "1rem",
                        }}
                      />
                      {errors.owner_firstname && (
                        <div style={{ color: "#ef4444", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                          {errors.owner_firstname}
                        </div>
                      )}
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                        Nom *
                      </label>
                      <input
                        type="text"
                        name="owner_lastname"
                        value={formData.owner_lastname}
                        onChange={handleChange}
                        placeholder="Dupont"
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: errors.owner_lastname ? "2px solid #ef4444" : "1px solid #cbd5e1",
                          borderRadius: "6px",
                          fontSize: "1rem",
                        }}
                      />
                      {errors.owner_lastname && (
                        <div style={{ color: "#ef4444", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                          {errors.owner_lastname}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                      Email professionnel *
                    </label>
                    <input
                      type="email"
                      name="owner_email"
                      value={formData.owner_email}
                      onChange={handleChange}
                      placeholder="jean.dupont@regie-lausanne.ch"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: errors.owner_email ? "2px solid #ef4444" : "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "1rem",
                      }}
                    />
                    {errors.owner_email && (
                      <div style={{ color: "#ef4444", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                        {errors.owner_email}
                      </div>
                    )}
                  </div>

                  {/* Téléphone */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      name="owner_phone"
                      value={formData.owner_phone}
                      onChange={handleChange}
                      placeholder="+41 21 123 45 67"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: errors.owner_phone ? "2px solid #ef4444" : "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "1rem",
                      }}
                    />
                    {errors.owner_phone && (
                      <div style={{ color: "#ef4444", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                        {errors.owner_phone}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                    <Button onClick={() => setStep(1)} type="button" variant="secondary">
                      ← Retour
                    </Button>
                    <Button onClick={handleNext} type="button">
                      Suivant →
                    </Button>
                  </div>
                </>
              )}

              {/* STEP 3 : Finalisation */}
              {step === 3 && (
                <>
                  <h2 style={{ marginBottom: "2rem", color: "#1e293b" }}>
                    ⚙️ Finalisation
                  </h2>

                  {/* Mode gestion locataires */}
                  <div style={{ marginBottom: "2rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                      Comment souhaitez-vous gérer vos locataires ?
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {[
                        { value: "later", label: "Je les ajouterai manuellement plus tard", icon: "✋" },
                        { value: "csv", label: "J'ai un fichier CSV à importer", icon: "📄" },
                        { value: "assisted", label: "J'aimerais de l'assistance", icon: "🤝" },
                      ].map((mode) => (
                        <label
                          key={mode.value}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "1rem",
                            border: formData.locataires_import_mode === mode.value ? "2px solid #4f46e5" : "1px solid #cbd5e1",
                            borderRadius: "8px",
                            cursor: "pointer",
                            background: formData.locataires_import_mode === mode.value ? "#eef2ff" : "white",
                          }}
                        >
                          <input
                            type="radio"
                            name="locataires_import_mode"
                            value={mode.value}
                            checked={formData.locataires_import_mode === mode.value}
                            onChange={handleChange}
                            style={{ marginRight: "1rem" }}
                          />
                          <span style={{ fontSize: "1.5rem", marginRight: "0.75rem" }}>{mode.icon}</span>
                          <span>{mode.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Motivation (optionnel) */}
                  <div style={{ marginBottom: "2rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                      Message ou besoins spécifiques (optionnel)
                    </label>
                    <textarea
                      name="motivation"
                      value={formData.motivation}
                      onChange={handleChange}
                      placeholder="Décrivez vos besoins particuliers ou questions..."
                      rows={4}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "1rem",
                        fontFamily: "inherit",
                        resize: "vertical",
                      }}
                    />
                  </div>

                  {/* Récapitulatif */}
                  <div
                    style={{
                      background: "#f1f5f9",
                      padding: "1.5rem",
                      borderRadius: "8px",
                      marginBottom: "2rem",
                    }}
                  >
                    <h3 style={{ marginBottom: "1rem", color: "#1e293b" }}>📋 Récapitulatif</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.95rem" }}>
                      <div><strong>Plan:</strong> {formData.plan_requested}</div>
                      <div><strong>Régie:</strong> {formData.regie_name}</div>
                      <div><strong>Ville:</strong> {formData.city}</div>
                      <div><strong>Logements:</strong> {formData.logements_estimes}</div>
                      <div><strong>Contact:</strong> {formData.owner_firstname} {formData.owner_lastname}</div>
                      <div><strong>Email:</strong> {formData.owner_email}</div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#fef3c7",
                      border: "1px solid #fbbf24",
                      padding: "1rem",
                      borderRadius: "8px",
                      marginBottom: "2rem",
                      fontSize: "0.95rem",
                    }}
                  >
                    ⚠️ <strong>Important :</strong> En soumettant cette demande, vous acceptez que notre équipe JETC examine votre dossier. Vous recevrez un email de confirmation après validation (24-48h).
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                    <Button onClick={() => setStep(2)} type="button" variant="secondary" disabled={loading}>
                      ← Retour
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Envoi en cours..." : "✅ Soumettre ma demande"}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
