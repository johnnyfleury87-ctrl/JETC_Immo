export default function Button({
  children,
  onClick,
  className = "",
  type = "button",
  style = {},
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn hover-bounce click-scale ${className}`}
      style={{
        backgroundColor: "var(--primary)",
        color: "white",
        padding: "0.75rem 1.5rem",
        borderRadius: "8px",
        fontWeight: "600",
        border: "none",
        cursor: "pointer",
        boxShadow: "var(--shadow)",
        transition: "all 0.2s ease",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
