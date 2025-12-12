import { useState } from "react";
import DemoLayout from "../../../components/demo/DemoLayout";

export default function DemoLocataireNouveauTicket() {
  const [formData, setFormData] = useState({
    categorie: "",
    priorite: "moyenne",
    titre: "",
    description: ""
  });

  return (
    <DemoLayout role="locataire" activePage="/demo/locataire/nouveau-ticket">
      <h1 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>➕ Créer un Nouveau Ticket</h1>

      <div style={{
        backgroundColor: "#fff3cd",
        padding: "1rem",
        borderRadius: "5px",
        marginBottom: "1.5rem",
        borderLeft: "4px solid #ffc107"
      }}>
        <strong>ℹ️ Mode Démo :</strong> Formulaire simulé. Aucune soumission réelle.
      </div>

      <div style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "#555" }}>
            Catégorie *
          </label>
          <select
            value={formData.categorie}
            disabled
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "5px",
              backgroundColor: "#f8f9fa"
            }}
          >
            <option value="">Sélectionnez une catégorie</option>
            <option value="plomberie">Plomberie</option>
            <option value="electricite">Électricité</option>
            <option value="chauffage">Chauffage</option>
            <option value="serrurerie">Serrurerie</option>
            <option value="ventilation">Ventilation</option>
            <option value="autre">Autre</option>
          </select>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "#555" }}>
            Priorité *
          </label>
          <div style={{ display: "flex", gap: "1rem" }}>
            {["basse", "moyenne", "haute"].map((p) => (
              <label key={p} style={{
                display: "flex",
                alignItems: "center",
                padding: "0.75rem 1rem",
                border: "2px solid #ddd",
                borderRadius: "5px",
                cursor: "not-allowed",
                backgroundColor: "#f8f9fa",
                flex: 1
              }}>
                <input
                  type="radio"
                  name="priorite"
                  value={p}
                  disabled
                  checked={formData.priorite === p}
                  style={{ marginRight: "0.5rem" }}
                />
                <span style={{ textTransform: "capitalize" }}>{p}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "#555" }}>
            Titre du problème *
          </label>
          <input
            type="text"
            value={formData.titre}
            disabled
            placeholder="Ex: Fuite d eau sous l évier"
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "5px",
              backgroundColor: "#f8f9fa"
            }}
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "#555" }}>
            Description détaillée *
          </label>
          <textarea
            value={formData.description}
            disabled
            placeholder="Décrivez le problème en détail..."
            rows={6}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "5px",
              backgroundColor: "#f8f9fa",
              fontFamily: "inherit",
              resize: "vertical"
            }}
          />
        </div>

        <div style={{
          padding: "1rem",
          backgroundColor: "#e7f3ff",
          borderRadius: "5px",
          marginBottom: "1.5rem",
          borderLeft: "4px solid #2196F3"
        }}>
          <strong>💡 Conseil :</strong> Plus vous êtes précis dans votre description, plus l intervention sera rapide et efficace.
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button style={{
            padding: "1rem 2rem",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontWeight: "bold",
            cursor: "not-allowed",
            opacity: 0.6
          }}
          title="Disponible en version PRO">
            📤 Soumettre le ticket
          </button>
          
          <button style={{
            padding: "1rem 2rem",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontWeight: "bold",
            cursor: "not-allowed",
            opacity: 0.6
          }}
          title="Disponible en version PRO">
            ↺ Réinitialiser
          </button>
        </div>
      </div>

      <div style={{
        marginTop: "1.5rem",
        padding: "1rem",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h3 style={{ marginTop: 0, color: "#2c3e50" }}>📋 Historique récent</h3>
        <p style={{ color: "#666", fontSize: "0.9rem" }}>
          Dernier ticket créé : <strong>11 décembre 2025</strong> - Ampoule grillée couloir
        </p>
        <p style={{ color: "#666", fontSize: "0.9rem", marginTop: "0.5rem" }}>
          Nombre total de tickets : <strong>11</strong>
        </p>
      </div>
    </DemoLayout>
  );
}
