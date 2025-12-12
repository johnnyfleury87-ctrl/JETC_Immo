import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { register } from "../lib/auth";
import { saveSession, saveProfile, isDemoMode } from "../lib/session";
import { getProfile } from "../lib/api";
import { useDemoMode } from "../context/DemoModeContext";

export default function Register() {
  const router = useRouter();
  const { demoMode } = useDemoMode();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("locataire");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // BLOQUER /register en MODE DEMO
  useEffect(() => {
    if (isDemoMode()) {
      console.log("⛔ MODE DEMO détecté - Accès /register bloqué");
      router.push("/demo-hub");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        nom,
        prenom,
        email,
        telephone,
        password,
        role,
      };

      // Appel du register (géré automatiquement en mode DEMO dans lib/auth.js)
      const session = await register(payload);

      // Sauvegarde du token et rôle dans localStorage
      saveSession(session);

      // MODE DEMO : utiliser les données simulées
      if (demoMode) {
        // Sauvegarde du profil simulé (déjà dans session.user)
        saveProfile(
          session.user || {
            id: "demo_user_" + Date.now(),
            email: email,
            nom: nom,
            prenom: prenom,
            telephone: telephone,
          }
        );

        // Afficher un message de confirmation
        alert(
          "🎭 Compte créé en mode DEMO\nAucune donnée réelle enregistrée\nRôle : " +
            role
        );

        // Redirection vers l'onboarding
        router.push("/onboarding/role");
        return;
      }

      // PRODUCTION : Récupération et sauvegarde du profil réel
      const profile = await getProfile();
      saveProfile(profile);

      // Redirection vers l'onboarding pour choisir le rôle
      router.push("/onboarding/role");
    } catch (err) {
      setError(err.message || "Erreur lors de la création du compte");
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="card fade-in">
        <h1 className="page-title">Créer un compte</h1>

        {error && (
          <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <label>Nom</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
          />

          <label>Prénom</label>
          <input
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Téléphone</label>
          <input
            type="text"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            required
          />

          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>Rôle</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="locataire">Locataire</option>
            <option value="regie">Régie</option>
            <option value="entreprise">Entreprise</option>
            <option value="technicien">Technicien</option>
          </select>

          <button
            type="submit"
            className="btn hover-glow click-scale"
            disabled={loading}
          >
            {loading ? "Création..." : "Créer un compte"}
          </button>
        </form>

        <Link href="/login">Déjà un compte ? Connexion</Link>
      </div>
    </Layout>
  );
}
