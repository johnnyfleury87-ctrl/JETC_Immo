import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../src/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Traitement de l'authentification...");
  const [error, setError] = useState(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        // STEP 4: Détecter callback Magic Link
        console.log("[ADMIN][STEP 4] Magic link callback detected");
        console.log("[ADMIN][STEP 4] Full URL:", window.location.href);
        
        // STEP 5: Parser les params URL
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        console.log("[ADMIN][STEP 5] URL params parsed", {
          queryParams: Object.fromEntries(urlParams),
          hashParams: Object.fromEntries(hashParams),
          routerQuery: router.query
        });

        // AUTH: Récupération session Supabase
        console.log("[AUTH] getSession start");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("[AUTH] getSession result = FAIL", { 
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
          console.error("[AUTH] getSession result = FAIL (no session)");
          setError("Aucune session trouvée");
          setStatus("Échec de l'authentification");
          setTimeout(() => router.push("/login"), 3000);
          return;
        }
        
        console.log("[AUTH] getSession result = OK");
        console.log("[AUTH] user.id =", session.user.id);
        console.log("[AUTH] user.email =", session.user.email);
        console.log("[AUTH] Session details:", {
          userId: session.user.id,
          email: session.user.email,
          role: session.user.role,
          aud: session.user.aud,
          expiresAt: new Date(session.expires_at * 1000).toISOString()
        });

        // STEP 6: Chargement profil
        console.log("[ADMIN][STEP 6] Loading profile for user.id", session.user.id);
        
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, email, role")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("[ADMIN][ERROR] Profile fetch failed", { 
            error: profileError.message,
            code: profileError.code,
            details: profileError.details,
            hint: profileError.hint
          });
          setError(profileError.message);
          setStatus("Erreur lors de la récupération du profil");
          setTimeout(() => router.push("/login"), 3000);
          return;
        }

        // STEP 7: Profil chargé
        console.log("[ADMIN][STEP 7] Profile loaded", profile);
        
        // STEP 8: Vérification rôle
        console.log("[ADMIN][STEP 8] role =", profile.role);
        console.log("[ADMIN][STEP 8] Expected: admin_jtec");
        console.log("[ADMIN][STEP 8] Match:", profile.role === "admin_jtec");

        const next = router.query.next || "/";

        // STEP 9: Décision finale
        if (profile.role === "admin_jtec") {
          console.log("[ADMIN][STEP 9] Access granted → redirect /admin");
          setStatus(`Accès admin autorisé. Redirection vers ${next}...`);
          setTimeout(() => {
            console.log("[ADMIN][STEP 9] Executing redirect to:", next);
            router.push(next);
          }, 1000);
        } else {
          console.warn("[ADMIN][BLOCKED] Role not admin → redirect /login", { 
            actualRole: profile.role,
            expectedRole: "admin_jtec"
          });
          setError(`Accès refusé. Rôle requis: admin_jtec (actuel: ${profile.role})`);
          setStatus("Accès refusé");
          setTimeout(() => router.push("/"), 3000);
        }
      } catch (err) {
        console.error("[ADMIN][ERROR] Unexpected error in callback", {
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
