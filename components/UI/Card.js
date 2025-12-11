export default function Card({ children, className = "" }) {
  return (
    <div 
      className={`card fade-in ${className}`}
      style={{
        backgroundColor: "white",
        padding: "1.5rem",
        borderRadius: "12px",
        boxShadow: "var(--shadow)",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        marginBottom: "1rem"
      }}
    >
      {children}
    </div>
  );
}
