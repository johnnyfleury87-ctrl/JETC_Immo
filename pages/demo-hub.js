import { useDemoMode } from "../context/DemoModeContext";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import withDemoAccess from "../lib/withDemoAccess";

function DemoHub() {
  const { demoProfile } = useDemoMode();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
        padding: "6rem 2rem 4rem",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Hero Section */}
        <div
          style={{
            textAlign: "center",
            color: "white",
            marginBottom: "4rem",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎭</div>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              margin: "0 0 1rem 0",
              letterSpacing: "-0.5px",
            }}
          >
            Bienvenue en mode démonstration
          </h1>
          <p
            style={{
              fontSize: "1.2rem",
              opacity: 0.95,
              maxWidth: "700px",
              margin: "0 auto 1.5rem",
              lineHeight: "1.6",
            }}
          >
            Vous êtes connecté en tant que{" "}
            <strong>{demoProfile?.prenom} {demoProfile?.nom}</strong>
            <br />
            Explorez JETC IMMO librement avec des données simulées
          </p>

          <div
            style={{
              display: "inline-flex",
              gap: "1rem",
              background: "rgba(255, 255, 255, 0.1)",
              padding: "1rem 2rem",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>Email</div>
              <div style={{ fontSize: "1rem", fontWeight: "600" }}>
                {demoProfile?.email}
              </div>
            </div>
            <div
              style={{
                width: "1px",
                background: "rgba(255, 255, 255, 0.3)",
              }}
            />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>Régie</div>
              <div style={{ fontSize: "1rem", fontWeight: "600" }}>
                {demoProfile?.regie_nom || "Régie Démo"}
              </div>
            </div>
          </div>
        </div>

        {/* Guide rapide */}
        <Card
          style={{
            padding: "2rem",
            marginBottom: "3rem",
            background: "white",
            borderRadius: "16px",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              margin: "0 0 1.5rem 0",
              color: "var(--primary)",
            }}
          >
            🚀 Que faire en mode DEMO ?
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1.5rem",
            }}
          >
            <div>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                1️⃣
              </div>
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  margin: "0 0 0.5rem 0",
                }}
              >
                Choisissez un rôle
              </h3>
              <p style={{ margin: 0, fontSize: "0.95rem", opacity: 0.8 }}>
                Cliquez sur une carte ci-dessous pour explorer l'interface de ce profil
              </p>
            </div>
            <div>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                2️⃣
              </div>
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  margin: "0 0 0.5rem 0",
                }}
              >
                Testez les fonctionnalités
              </h3>
              <p style={{ margin: 0, fontSize: "0.95rem", opacity: 0.8 }}>
                Créez des tickets, gérez des missions, testez tout le cycle complet
              </p>
            </div>
            <div>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                3️⃣
              </div>
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  margin: "0 0 0.5rem 0",
                }}
              >
                Changez de perspective
              </h3>
              <p style={{ margin: 0, fontSize: "0.95rem", opacity: 0.8 }}>
                Utilisez le widget en bas à droite pour passer d'un rôle à l'autre
              </p>
            </div>
          </div>
        </Card>

        {/* Rôles disponibles */}
        <h2
          style={{
            fontSize: "1.8rem",
            fontWeight: "700",
            margin: "0 0 2rem 0",
            color: "white",
            textAlign: "center",
          }}
        >
          Choisissez un profil pour commencer
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            marginBottom: "3rem",
          }}
        >
          {/* RÉGIE */}
          <Card
            style={{
              padding: "2rem",
              cursor: "pointer",
              transition: "all 0.3s ease",
              borderLeft: "4px solid var(--primary)",
            }}
            className="hover-glow"
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.2)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "var(--shadow)";
            }}
            onClick={() => {
              localStorage.setItem("jetc_demo_mode", "true");
              localStorage.setItem("jetc_demo_role", "regie");
              window.location.href = "/demo/regie/dashboard";
            }}
          >
            <div
              style={{
                fontSize: "3rem",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              🏢
            </div>
            <h3
              style={{
                fontSize: "1.3rem",
                fontWeight: "700",
                margin: "0 0 0.5rem 0",
                color: "var(--primary)",
                textAlign: "center",
              }}
            >
              Régie Immobilière
            </h3>
            <p
              style={{
                fontSize: "0.95rem",
                opacity: 0.8,
                margin: "0 0 1.5rem 0",
                textAlign: "center",
                lineHeight: "1.5",
              }}
            >
              Gérez vos immeubles, logements et tickets de maintenance
            </p>
            <button
              style={{
                width: "100%",
                background: "var(--primary)",
                color: "white",
                padding: "0.75rem",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                localStorage.setItem("jetc_demo_mode", "true");
                localStorage.setItem("jetc_demo_role", "regie");
                window.location.href = "/demo/regie/dashboard";
              }}
            >
              Explorer ce rôle
            </button>
          </Card>

          {/* ENTREPRISE */}
          <Card
            style={{
              padding: "2rem",
              cursor: "pointer",
              transition: "all 0.3s ease",
              borderLeft: "4px solid var(--secondary)",
            }}
            className="hover-glow"
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.2)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "var(--shadow)";
            }}
            onClick={() => {
              localStorage.setItem("jetc_demo_mode", "true");
              localStorage.setItem("jetc_demo_role", "entreprise");
              window.location.href = "/demo/entreprise/dashboard";
            }}
          >
            <div
              style={{
                fontSize: "3rem",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              🏭
            </div>
            <h3
              style={{
                fontSize: "1.3rem",
                fontWeight: "700",
                margin: "0 0 0.5rem 0",
                color: "var(--secondary)",
                textAlign: "center",
              }}
            >
              Entreprise de Maintenance
            </h3>
            <p
              style={{
                fontSize: "0.95rem",
                opacity: 0.8,
                margin: "0 0 1.5rem 0",
                textAlign: "center",
                lineHeight: "1.5",
              }}
            >
              Gérez vos techniciens et missions pour les régies
            </p>
            <button
              style={{
                width: "100%",
                background: "var(--secondary)",
                color: "white",
                padding: "0.75rem",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                localStorage.setItem("jetc_demo_mode", "true");
                localStorage.setItem("jetc_demo_role", "entreprise");
                window.location.href = "/demo/entreprise/dashboard";
              }}
            >
              Explorer ce rôle
            </button>
          </Card>

          {/* TECHNICIEN */}
          <Card
            style={{
              padding: "2rem",
              cursor: "pointer",
              transition: "all 0.3s ease",
              borderLeft: "4px solid var(--green)",
            }}
            className="hover-glow"
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.2)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "var(--shadow)";
            }}
            onClick={() => {
              localStorage.setItem("jetc_demo_mode", "true");
              localStorage.setItem("jetc_demo_role", "technicien");
              window.location.href = "/demo/technicien/dashboard";
            }}
          >
            <div
              style={{
                fontSize: "3rem",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              🔧
            </div>
            <h3
              style={{
                fontSize: "1.3rem",
                fontWeight: "700",
                margin: "0 0 0.5rem 0",
                color: "var(--green)",
                textAlign: "center",
              }}
            >
              Technicien
            </h3>
            <p
              style={{
                fontSize: "0.95rem",
                opacity: 0.8,
                margin: "0 0 1.5rem 0",
                textAlign: "center",
                lineHeight: "1.5",
              }}
            >
              Consultez et gérez vos interventions sur le terrain
            </p>
            <button
              style={{
                width: "100%",
                background: "var(--green)",
                color: "white",
                padding: "0.75rem",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                localStorage.setItem("jetc_demo_mode", "true");
                localStorage.setItem("jetc_demo_role", "technicien");
                window.location.href = "/demo/technicien/dashboard";
              }}
            >
              Explorer ce rôle
            </button>
          </Card>

          {/* LOCATAIRE */}
          <Card
            style={{
              padding: "2rem",
              cursor: "pointer",
              transition: "all 0.3s ease",
              borderLeft: "4px solid var(--accent)",
            }}
            className="hover-glow"
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.2)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "var(--shadow)";
            }}
            onClick={() => {
              localStorage.setItem("jetc_demo_mode", "true");
              localStorage.setItem("jetc_demo_role", "locataire");
              window.location.href = "/demo/locataire/dashboard";
            }}
          >
            <div
              style={{
                fontSize: "3rem",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              🏠
            </div>
            <h3
              style={{
                fontSize: "1.3rem",
                fontWeight: "700",
                margin: "0 0 0.5rem 0",
                color: "var(--accent)",
                textAlign: "center",
              }}
            >
              Locataire
            </h3>
            <p
              style={{
                fontSize: "0.95rem",
                opacity: 0.8,
                margin: "0 0 1.5rem 0",
                textAlign: "center",
                lineHeight: "1.5",
              }}
            >
              Créez et suivez vos demandes d'intervention
            </p>
            <button
              style={{
                width: "100%",
                background: "var(--accent)",
                color: "white",
                padding: "0.75rem",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                localStorage.setItem("jetc_demo_mode", "true");
                localStorage.setItem("jetc_demo_role", "locataire");
                window.location.href = "/demo/locataire/dashboard";
              }}
            >
              Explorer ce rôle
            </button>
          </Card>
        </div>

        {/* Footer actions */}
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <p style={{ color: "white", margin: "0 0 1rem 0", fontSize: "1rem" }}>
            💡 <strong>Astuce :</strong> Toutes les données sont simulées. N'hésitez pas à
            tester toutes les fonctionnalités !
          </p>
          <Button
            onClick={() => window.location.href = "/"}
            style={{
              background: "transparent",
              border: "2px solid white",
              color: "white",
              padding: "0.75rem 2rem",
            }}
          >
            ← Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
}

export default withDemoAccess(DemoHub);
