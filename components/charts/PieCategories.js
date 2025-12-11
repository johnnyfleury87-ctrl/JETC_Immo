export default function PieCategories({ data }) {
  if (!data || data.length === 0) {
    return (
      <p style={{ textAlign: "center", opacity: 0.6, padding: "2rem" }}>
        Aucune donnée disponible
      </p>
    );
  }

  const total = data.reduce((sum, item) => sum + (item.count || 0), 0);
  
  const colors = [
    "var(--primary)",
    "var(--secondary)", 
    "var(--accent)",
    "var(--green)",
    "var(--orange)",
    "var(--red)",
    "var(--blue)"
  ];

  return (
    <div>
      {/* Barre horizontale empilée */}
      <div style={{ 
        display: "flex", 
        height: "50px", 
        borderRadius: "8px", 
        overflow: "hidden", 
        marginBottom: "1.5rem",
        boxShadow: "var(--shadow)"
      }}>
        {data.map((cat, index) => {
          const percentage = total > 0 ? (cat.count / total) * 100 : 0;
          return percentage > 0 ? (
            <div 
              key={index}
              style={{
                width: `${percentage}%`,
                backgroundColor: colors[index % colors.length],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "0.9rem",
                fontWeight: "700",
                transition: "all 0.3s"
              }}
              title={`${cat.categorie}: ${cat.count} tickets (${Math.round(percentage)}%)`}
            >
              {percentage > 12 && `${Math.round(percentage)}%`}
            </div>
          ) : null;
        })}
      </div>

      {/* Légende avec détails */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
        gap: "0.75rem" 
      }}>
        {data.map((cat, index) => {
          const percentage = total > 0 ? (cat.count / total) * 100 : 0;
          return (
            <div 
              key={index}
              className="hover-glow"
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "0.75rem",
                padding: "0.5rem",
                borderRadius: "6px",
                background: "var(--background)",
                transition: "transform 0.2s"
              }}
            >
              <div style={{ 
                width: "16px", 
                height: "16px", 
                borderRadius: "4px", 
                backgroundColor: colors[index % colors.length],
                flexShrink: 0
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>
                  {cat.categorie || "N/A"}
                </div>
                <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                  {cat.count} tickets ({Math.round(percentage)}%)
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
