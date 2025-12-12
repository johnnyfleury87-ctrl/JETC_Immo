export default function HeatmapImmeubles({ data }) {
  if (!data || data.length === 0) {
    return (
      <p style={{ textAlign: "center", opacity: 0.6, padding: "2rem" }}>
        Aucune donnée disponible
      </p>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.interventions_count || 0));

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "0.75rem",
      }}
    >
      {data.map((immeuble, index) => {
        const count = immeuble.interventions_count || 0;
        const intensity = maxCount > 0 ? count / maxCount : 0;

        // Calcul de la couleur selon l'intensité (vert si peu, orange si moyen, rouge si beaucoup)
        let backgroundColor;
        if (intensity < 0.3) {
          backgroundColor = `rgba(76, 175, 80, ${0.3 + intensity})`;
        } else if (intensity < 0.7) {
          backgroundColor = `rgba(255, 152, 0, ${0.3 + intensity})`;
        } else {
          backgroundColor = `rgba(244, 67, 54, ${0.4 + intensity * 0.6})`;
        }

        const textColor = intensity > 0.5 ? "white" : "var(--text)";

        return (
          <div
            key={index}
            className="hover-glow"
            style={{
              padding: "1rem",
              borderRadius: "8px",
              backgroundColor,
              color: textColor,
              textAlign: "center",
              fontWeight: "600",
              transition: "transform 0.2s",
              cursor: "pointer",
            }}
            title={`${immeuble.nom_immeuble}: ${count} intervention(s)`}
          >
            <div style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
              {immeuble.nom_immeuble || "N/A"}
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: "700" }}>{count}</div>
            <div
              style={{
                fontSize: "0.75rem",
                opacity: 0.8,
                marginTop: "0.25rem",
              }}
            >
              {count > 1 ? "interventions" : "intervention"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
