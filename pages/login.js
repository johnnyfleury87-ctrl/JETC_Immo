import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { login, redirectByRole } from "../lib/auth";
import { saveSession, saveProfile } from "../lib/session";
import { getProfile } from "../lib/api";
import { transitionDemoToProd } from "../lib/demoAccess";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Vérifier si l'email correspond à un admin_jtec
  useEffect(() => {
    const checkIfAdmin = async () => {
      if (!email || !email.includes('@')) {
        setIsAdmin(false);
        return;
      }

      setCheckingRole(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('email', email)
          .single();

        if (data && data.role === 'admin_jtec') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setCheckingRole(false);
      }
    };

    // Debounce: attendre 500ms après la dernière frappe
    const timer = setTimeout(() => {
      checkIfAdmin();
    }, 500);

    return () => clearTimeout(timer);
  }, [email]);

  // Gérer le retour du magic link
  useEffect(() => {
    const handleMagicLinkCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (session?.user && !error) {
          // Récupérer le profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error("Erreur récupération profile:", profileError);
            return;
          }

          if (profile?.role) {
            // Sauvegarder la session
            saveSession({
              token: session.access_token,
              role: profile.role
            });

            // Sauvegarder le profil
            saveProfile(profile);

            // Transition demo si nécessaire
            transitionDemoToProd(profile);

            // Redirection immédiate pour admin
            if (profile.role === 'admin_jtec') {
              router.replace('/admin/jetc');
              return;
            }

            // Redirection selon le rôle pour les autres
            redirectByRole(profile.role);
          }
        }
      } catch (err) {
        console.error("Erreur handleMagicLinkCallback:", err);
      }
    };

    handleMagicLinkCallback();
  }, [router]);

  const handleMagicLinkSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setMagicLinkSent(false);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (error) throw error;

      setMagicLinkSent(true);
      setError("");
    } catch (err) {
      setError(err.message || "Erreur lors de l'envoi du lien de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Appel du login classique
      const session = await login(email, password);

      // Sauvegarde du token et rôle dans localStorage
      saveSession(session);

      // Récupération et sauvegarde du profil réel
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
          <div style={{ 
            color: "white",
            background: "var(--error, #dc2626)",
            padding: "1rem",
            borderRadius: "6px",
            marginBottom: "1rem"
          }}>
            {error}
          </div>
        )}

        {magicLinkSent && (
          <div style={{
            color: "white",
            background: "var(--success, #16a34a)",
            padding: "1rem",
            borderRadius: "6px",
            marginBottom: "1rem"
          }}>
            ✅ Un lien de connexion vous a été envoyé par email.<br/>
            Consultez votre boîte mail ({email})
          </div>
        )}

        <form onSubmit={isAdmin ? handleMagicLinkSubmit : handlePasswordSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {checkingRole && (
            <div style={{ 
              fontSize: "0.875rem", 
              color: "var(--text-muted)", 
              marginTop: "0.5rem" 
            }}>
              Vérification du compte...
            </div>
          )}

          {isAdmin && (
            <div style={{
              background: "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              padding: "0.75rem",
              borderRadius: "6px",
              marginTop: "1rem",
              marginBottom: "1rem",
              fontSize: "0.875rem"
            }}>
              🔐 <strong>Connexion administrateur</strong><br/>
              Un lien de connexion sécurisé vous sera envoyé par email
            </div>
          )}

          {!isAdmin && (
            <>
              <label>Mot de passe</label>
              <input
                type="password"
                placeholder="mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </>
          )}

          {!isAdmin && (
            <>
              <label>Thème</label>
              <select>
                <option value="speciale">Spéciale</option>
                <option value="jardin">Jardin</option>
                <option value="zen">Zen</option>
              </select>
            </>
          )}

          <button
            type="submit"
            className="btn hover-glow click-scale"
            disabled={loading || checkingRole}
            style={{
              marginTop: "1rem"
            }}
          >
            {loading ? (
              isAdmin ? "Envoi en cours..." : "Connexion..."
            ) : (
              isAdmin ? "📧 Recevoir un lien de connexion" : "Se connecter"
            )}
          </button>
        </form>

        {!isAdmin && (
          <Link href="/register">Créer un compte</Link>
        )}
      </div>
    </Layout>
  );
}
