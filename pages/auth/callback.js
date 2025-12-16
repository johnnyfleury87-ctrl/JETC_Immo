import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../src/lib/supabaseClient";
import { adminLog } from "../../lib/adminAuth";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Traitement de l'authentification...");
  const [error, setError] = useState(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        adminLog(5, "Callback loaded", { 
          url: window.location.href,
          params: router.query 
        });

        // Supabase gère automatiquement l'échange du code
        // Il suffit de récupérer la session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          adminLog(6, "Session FAIL", { 
            error: sessionError.message,
            code: sessionError.code,
            status: sessionError.status 
          });
          setError(sessionError.message);
          setStatus("Échec de l'authentification");
          setTimeout(() => router.push("/login"), 3000);
          return;
        }

        if (!session) {
          adminLog(6, "Session FAIL - No session found");
          setError("Aucune session trouvée");
          setStatus("Échec de l'authentification");
          setTimeout(() => router.push("/login"), 3000);
          return;
        }

        adminLog(6, "Session OK", { 
          userId: session.user.id,
          email: session.user.email 
        });

        // Fetch profile pour vérifier le rôle
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, email, role")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          adminLog(7, "Profile fetch FAIL", { 
            error: profileError.message,
            code: profileError.code 
          });
          setError(profileError.message);
          setStatus("Erreur lors de la récupération du profil");
          setTimeout(() => router.push("/login"), 3000);
          return;
        }

        adminLog(7, "Profile fetch OK", { 
          role: profile.role,
          email: profile.email 
        });

        const next = router.query.next || "/";

        if (profile.role === "admin_jtec") {
          adminLog(8, "Role OK -> redirect", { destination: next });
          setStatus(`Accès admin autorisé. Redirection vers ${next}...`);
          setTimeout(() => router.push(next), 1000);
        } else {
          adminLog(8, "Role NOT admin -> redirect denied", { 
            role: profile.role,
            expected: "admin_jtec" 
          });
          setError(`Accès refusé. Rôle requis: admin_jtec (actuel: ${profile.role})`);
          setStatus("Accès refusé");
          setTimeout(() => router.push("/"), 3000);
        }
      } catch (err) {
        adminLog("ERROR", "Unexpected error in callback", {
          message: err.message,
          stack: err.stack,
        });
        setError(err.message);
        setStatus("Erreur inattendue");
        setTimeout(() => router.push("/login"), 3000);
      }
    }

    if (router.isReady) {
      handleCallback();
    }
  }, [router.isReady, router.query]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "2rem",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "3rem",
          borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          maxWidth: "500px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "1.5rem", color: "#333" }}>
          {error ? "❌" : "🔐"} Authentification Admin
        </h1>
        
        <div
          style={{
            marginBottom: "2rem",
            padding: "1rem",
            borderRadius: "8px",
            background: error ? "#fee" : "#f0f9ff",
            border: `2px solid ${error ? "#fcc" : "#bfdbfe"}`,
          }}
        >
          <p style={{ margin: 0, color: error ? "#c00" : "#1e40af", fontWeight: "500" }}>
            {status}
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "1rem",
              borderRadius: "8px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              marginBottom: "1rem",
            }}
          >
            <p style={{ margin: 0, color: "#991b1b", fontSize: "0.9rem" }}>
              <strong>Erreur:</strong> {error}
            </p>
          </div>
        )}

        <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "2rem" }}>
          <p style={{ margin: "0.5rem 0" }}>
            🔍 Consultez la console pour les logs détaillés
          </p>
          <p style={{ margin: "0.5rem 0" }}>
            Recherchez: <code>[ADMIN-AUTH]</code>
          </p>
        </div>

        {!error && (
          <div
            style={{
              marginTop: "2rem",
              display: "inline-block",
              width: "40px",
              height: "40px",
              border: "4px solid #e5e7eb",
              borderTop: "4px solid #667eea",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
