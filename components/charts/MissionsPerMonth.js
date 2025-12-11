import { useEffect, useState } from "react";

export default function MissionsPerMonth({ data }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setChartData(data);
    }
  }, [data]);

  if (!chartData || chartData.length === 0) {
    return <p style={{ textAlign: "center", opacity: 0.6 }}>Aucune donnée disponible</p>;
  }

  const maxValue = Math.max(...chartData.map(d => d.count || 0));

  return (
    <div style={{ width: "100%", padding: "1rem" }}>
      <h3 style={{ marginBottom: "1rem", textAlign: "center" }}>🚀 Missions par mois</h3>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", height: "200px" }}>
        {chartData.map((item, index) => {
          const height = maxValue > 0 ? (item.count / maxValue) * 100 : 0;
          return (
            <div key={index} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: "100%",
                height: `${height}%`,
                background: "linear-gradient(180deg, var(--green) 0%, var(--dark-green) 100%)",
                borderRadius: "4px 4px 0 0",
                minHeight: "5px",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: "0.25rem",
                color: "white",
                fontSize: "0.8rem",
                fontWeight: "600"
              }}>
                {item.count}
              </div>
              <span style={{ 
                fontSize: "0.75rem", 
                marginTop: "0.5rem", 
                opacity: 0.7,
                whiteSpace: "nowrap"
              }}>
                {item.mois || `M${index + 1}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
