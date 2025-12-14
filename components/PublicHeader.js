import Link from "next/link";

export default function PublicHeader() {
  return (
    <header
      style={{
        background: "var(--primary)",
        color: "white",
        padding: "1rem 2rem",
        boxShadow: "var(--shadow)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              transition: "transform 0.2s ease, opacity 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.opacity = "0.9";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.opacity = "1";
            }}
          >
            <img
              src="/branding/jetc/logo.png"
              alt="JETC IMMO"
              style={{
                height: "clamp(40px, 8vw, 56px)",
                width: "auto",
                objectFit: "contain",
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <h1
              style={{
                display: "none",
                margin: 0,
                fontSize: "1.5rem",
                color: "var(--accent)",
              }}
            >
              🏢 JETC IMMO
            </h1>
          </div>
        </Link>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link
            href="/pricing"
            style={{
              color: "white",
              textDecoration: "none",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              transition: "all 0.2s ease",
              fontWeight: "500",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            Tarifs
          </Link>
          <Link
            href="/login"
            style={{
              color: "white",
              textDecoration: "none",
              padding: "0.5rem 1.25rem",
              borderRadius: "6px",
              background: "rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              transition: "all 0.2s ease",
              fontWeight: "500",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
            }}
          >
            Connexion
          </Link>
        </div>
      </div>
    </header>
  );
}
