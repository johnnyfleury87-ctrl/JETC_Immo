import Link from "next/link";
import { useState } from "react";
import Layout from "../components/Layout";
import { login, redirectByRole } from "../lib/auth";
import { saveSession, saveProfile } from "../lib/session";
import { getProfile } from "../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      // Appel du login réel via API backend
      const session = await login(email, password);
      
      // Sauvegarde du token et rôle dans localStorage
      saveSession(session);
      
      // Récupération et sauvegarde du profil
      const profile = await getProfile();
      saveProfile(profile);
      
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

        {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}

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
