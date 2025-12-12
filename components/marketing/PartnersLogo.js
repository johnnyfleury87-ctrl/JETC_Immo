export default function PartnersLogo() {
  return (
    <div
      style={{
        textAlign: "center",
        marginBottom: "2rem",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "0.75rem",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "800",
            background: "linear-gradient(135deg, #fff 0%, #e0e0e0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: 0,
          }}
        >
          🏢 JETC IMMO
        </h1>
      </div>

      <div
        style={{
          display: "inline-block",
          background: "rgba(255, 255, 255, 0.15)",
          padding: "0.4rem 1rem",
          borderRadius: "20px",
          fontSize: "0.85rem",
          fontWeight: "600",
          color: "rgba(255, 255, 255, 0.9)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        ⚡ Propulsé par Perritie
      </div>
    </div>
  );
}
