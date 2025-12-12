import { useRouter } from "next/router";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";

export default function HomePage() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        color: "var(--text)",
      }}
    >
      {/* Header simple */}
      <header
        style={{
          padding: "1.5rem 2rem",
          background: "var(--primary)",
          color: "white",
          boxShadow: "var(--shadow)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>🏢 JETC IMMO</h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Button
            onClick={() => router.push("/pricing")}
            style={{ background: "transparent", border: "2px solid white" }}
          >
            💰 Tarifs
          </Button>
          <Button
            onClick={() => router.push("/login")}
            style={{ background: "white", color: "var(--primary)" }}
          >
            🔐 Connexion
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          textAlign: "center",
          padding: "4rem 2rem",
          background:
            "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
          color: "white",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            margin: "0 0 1rem 0",
            fontWeight: "700",
          }}
        >
          La plateforme collaborative pour la gestion immobilière
        </h1>
        <p
          style={{
            fontSize: "1.3rem",
            margin: "0 auto 2rem auto",
            maxWidth: "700px",
            opacity: 0.95,
          }}
        >
          Gérez vos immeubles, tickets et interventions en toute simplicité.
          Connectez régies, entreprises et techniciens sur une seule plateforme.
        </p>
        <Button
          onClick={() => router.push("/register")}
          style={{
            fontSize: "1.2rem",
            padding: "1rem 2.5rem",
            background: "white",
            color: "var(--primary)",
            fontWeight: "700",
          }}
          className="hover-bounce"
        >
          🚀 Commencer en mode DEMO
        </Button>
      </section>

      {/* 3 blocs : Régies, Entreprises, Techniciens */}
      <section
        style={{
          padding: "4rem 2rem",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "2rem",
            marginBottom: "3rem",
            color: "var(--primary)",
          }}
        >
          Une solution pour tous les acteurs
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
          }}
        >
          <Card
            className="hover-glow"
            style={{ textAlign: "center", padding: "2rem" }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🏢</div>
            <h3
              style={{
                fontSize: "1.5rem",
                margin: "0 0 1rem 0",
                color: "var(--primary)",
              }}
            >
              Régies Immobilières
            </h3>
            <p style={{ opacity: 0.8, lineHeight: "1.6" }}>
              Gérez vos immeubles, logements et locataires. Diffusez les tickets
              aux entreprises partenaires. Suivez les interventions en temps
              réel.
            </p>
            <ul
              style={{
                textAlign: "left",
                padding: "0 1rem",
                marginTop: "1.5rem",
                listStyle: "none",
              }}
            >
              <li>✅ Dashboard analytique</li>
              <li>✅ Gestion du parc immobilier</li>
              <li>✅ Diffusion des tickets</li>
              <li>✅ Suivi des missions</li>
            </ul>
          </Card>

          <Card
            className="hover-glow"
            style={{ textAlign: "center", padding: "2rem" }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🏗️</div>
            <h3
              style={{
                fontSize: "1.5rem",
                margin: "0 0 1rem 0",
                color: "var(--primary)",
              }}
            >
              Entreprises de Maintenance
            </h3>
            <p style={{ opacity: 0.8, lineHeight: "1.6" }}>
              Recevez les tickets des régies partenaires. Assignez vos
              techniciens. Gérez les factures et les reportings.
            </p>
            <ul
              style={{
                textAlign: "left",
                padding: "0 1rem",
                marginTop: "1.5rem",
                listStyle: "none",
              }}
            >
              <li>✅ Réception de tickets</li>
              <li>✅ Gestion des techniciens</li>
              <li>✅ Planification des missions</li>
              <li>✅ Facturation automatisée</li>
            </ul>
          </Card>

          <Card
            className="hover-glow"
            style={{ textAlign: "center", padding: "2rem" }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>👨‍🔧</div>
            <h3
              style={{
                fontSize: "1.5rem",
                margin: "0 0 1rem 0",
                color: "var(--primary)",
              }}
            >
              Techniciens
            </h3>
            <p style={{ opacity: 0.8, lineHeight: "1.6" }}>
              Consultez vos missions du jour. Ajoutez des photos et signatures.
              Validez l'intervention directement sur place.
            </p>
            <ul
              style={{
                textAlign: "left",
                padding: "0 1rem",
                marginTop: "1.5rem",
                listStyle: "none",
              }}
            >
              <li>✅ Planning missions</li>
              <li>✅ Upload photos</li>
              <li>✅ Signature électronique</li>
              <li>✅ Clôture rapide</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Footer simple */}
      <footer
        style={{
          textAlign: "center",
          padding: "2rem",
          background: "var(--card-bg)",
          marginTop: "4rem",
          borderTop: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <p style={{ margin: 0, opacity: 0.7 }}>
          © 2025 JETC IMMO - Plateforme de gestion immobilière collaborative
        </p>
        <div style={{ marginTop: "1rem" }}>
          <a
            href="/pricing"
            style={{
              margin: "0 1rem",
              color: "var(--primary)",
              textDecoration: "none",
            }}
          >
            Tarifs
          </a>
          <a
            href="/login"
            style={{
              margin: "0 1rem",
              color: "var(--primary)",
              textDecoration: "none",
            }}
          >
            Connexion
          </a>
          <a
            href="/register"
            style={{
              margin: "0 1rem",
              color: "var(--primary)",
              textDecoration: "none",
            }}
          >
            Inscription
          </a>
        </div>
      </footer>
    </div>
  );
}
