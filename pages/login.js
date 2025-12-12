import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { login, redirectByRole } from "../lib/auth";
import { saveSession, saveProfile, isDemoMode } from "../lib/session";
import { getProfile } from "../lib/api";
import { useDemoMode } from "../context/DemoModeContext";
import { transitionDemoToProd } from "../lib/demoAccess";

export default function Login() {
  const router = useRouter();
  const { demoMode } = useDemoMode();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Appel du login (géré automatiquement en mode DEMO dans lib/auth.js)
      const session = await login(email, password);

      // Sauvegarde du token et rôle dans localStorage
      saveSession(session);

      // MODE DEMO : utiliser les données simulées
      if (demoMode) {
        // Sauvegarde du profil simulé (déjà dans session.user)
        saveProfile(
          session.user || {
            id: "demo_user",
            email: email,
            nom: "Demo",
            prenom: "User",
          }
        );

        // Afficher un message de confirmation
        alert(
          "🎭 Connexion simulée en mode DEMO\nAucune donnée réelle utilisée"
        );

        // Redirection selon le rôle
        redirectByRole(session.role);
        return;
      }

      // PRODUCTION : Récupération et sauvegarde du profil réel
      const profile = await getProfile();
      saveProfile(profile);

      // TRANSITION DEMO → PROD : Nettoyer toutes les données DEMO
      transitionDemoToProd(profile);

      // Redirection selon le rôle
      redirectByRole(session.role);
    } catch (err) {
      setError(err.message || "Identifiants incorrects");
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="card fade-in">
        <h1 className="page-title">Connexion</h1>

        {error && (
          <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Mot de passe</label>
          <input
            type="password"
            placeholder="mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>Thème</label>
          <select>
            <option value="speciale">Spéciale</option>
            <option value="jardin">Jardin</option>
            <option value="zen">Zen</option>
          </select>

          <button
            type="submit"
            className="btn hover-glow click-scale"
            disabled={loading}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <Link href="/register">Créer un compte</Link>
      </div>
    </Layout>
  );
}
