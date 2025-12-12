import { useState } from "react";
import DemoLayout from "../../../components/demo/DemoLayout";

export default function DemoEntrepriseTechniciens() {
  const [techniciens] = useState([
    {
      id: 1,
      nom: "Dupont",
      prenom: "Jean",
      specialite: "Plomberie",
      telephone: "06 12 34 56 78",
      email: "jean.dupont@email.fr",
      statut: "disponible",
      missions_en_cours: 2,
      missions_completees: 24,
      taux_reussite: 95,
      note_moyenne: 4.8
    },
    {
      id: 2,
      nom: "Martin",
      prenom: "Sophie",
      specialite: "Chauffage / Climatisation",
      telephone: "06 23 45 67 89",
      email: "sophie.martin@email.fr",
      statut: "en_mission",
      missions_en_cours: 1,
      missions_completees: 18,
      taux_reussite: 92,
      note_moyenne: 4.6
    },
    {
      id: 3,
      nom: "Legrand",
      prenom: "Marc",
      specialite: "Électricité",
      telephone: "06 34 56 78 90",
      email: "marc.legrand@email.fr",
      statut: "en_mission",
      missions_en_cours: 1,
      missions_completees: 31,
      taux_reussite: 97,
      note_moyenne: 4.9
    },
    {
      id: 4,
      nom: "Durand",
      prenom: "Pierre",
      specialite: "Serrurerie / Menuiserie",
      telephone: "06 45 67 89 01",
      email: "pierre.durand@email.fr",
      statut: "disponible",
      missions_en_cours: 0,
      missions_completees: 15,
      taux_reussite: 88,
      note_moyenne: 4.5
    },
    {
      id: 5,
      nom: "Bernard",
      prenom: "Luc",
      specialite: "Multi-compétences",
      telephone: "06 56 78 90 12",
      email: "luc.bernard@email.fr",
      statut: "conge",
      missions_en_cours: 0,
      missions_completees: 22,
      taux_reussite: 91,
      note_moyenne: 4.7
    }
  ]);

  const getStatutColor = (statut) => {
    switch (statut) {
      case "disponible": return { bg: "#d1e7dd", color: "#0a3622" };
      case "en_mission": return { bg: "#fff3cd", color: "#856404" };
      case "conge": return { bg: "#e2e3e5", color: "#41464b" };
      default: return { bg: "#f8d7da", color: "#721c24" };
    }
  };

  return (
    <DemoLayout role="entreprise" activePage="/demo/entreprise/techniciens">
      <h1 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>👷 Gestion des Techniciens</h1>

      <div style={{
        backgroundColor: "#fff3cd",
        padding: "1rem",
        borderRadius: "5px",
        marginBottom: "1.5rem",
        borderLeft: "4px solid #ffc107"
      }}>
        <strong>ℹ️ Mode Démo :</strong> Données fictives. Aucune modification n'est enregistrée.
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "1rem",
        marginBottom: "1.5rem"
      }}>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3498db" }}>5</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>Techniciens actifs</div>
        </div>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#27ae60" }}>2</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>Disponibles</div>
        </div>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#f39c12" }}>2</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>En mission</div>
        </div>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#e74c3c" }}>1</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>En congé</div>
        </div>
      </div>

      <div style={{
        display: "flex",
        gap: "1rem",
        marginBottom: "1.5rem"
      }}>
        <button style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: "#3498db",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "not-allowed",
          opacity: 0.6
        }}
        title="Disponible en version PRO">
          + Nouveau technicien
        </button>
        <select disabled style={{
          padding: "0.75rem",
          border: "1px solid #ddd",
          borderRadius: "5px",
          opacity: 0.6
        }}>
          <option>Tous les statuts</option>
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {techniciens.map((tech) => {
          const statutStyle = getStatutColor(tech.statut);
          
          return (
            <div key={tech.id} style={{
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                    <h3 style={{ margin: 0, color: "#2c3e50" }}>
                      {tech.prenom} {tech.nom}
                    </h3>
                    <span style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "12px",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      backgroundColor: statutStyle.bg,
                      color: statutStyle.color
                    }}>
                      {tech.statut.toUpperCase().replace("_", " ")}
                    </span>
                  </div>
                  
                  <p style={{ margin: "0.5rem 0", fontSize: "0.9rem", color: "#666", fontWeight: "bold" }}>
                    🔧 {tech.specialite}
                  </p>
                  
                  <p style={{ margin: "0.5rem 0", fontSize: "0.9rem", color: "#666" }}>
                    📞 {tech.telephone} • 📧 {tech.email}
                  </p>
                  
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "1rem",
                    marginTop: "1rem",
                    padding: "1rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "5px"
                  }}>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "#999", textTransform: "uppercase" }}>Missions en cours</div>
                      <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#3498db" }}>{tech.missions_en_cours}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "#999", textTransform: "uppercase" }}>Complétées</div>
                      <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#27ae60" }}>{tech.missions_completees}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "#999", textTransform: "uppercase" }}>Taux réussite</div>
                      <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#f39c12" }}>{tech.taux_reussite}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "#999", textTransform: "uppercase" }}>Note moyenne</div>
                      <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#e67e22" }}>⭐ {tech.note_moyenne}</div>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginLeft: "1rem" }}>
                  <button style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#3498db",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "not-allowed",
                    fontSize: "0.85rem",
                    opacity: 0.6,
                    whiteSpace: "nowrap"
                  }}
                  title="Disponible en version PRO">
                    Voir profil
                  </button>
                  <button style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "not-allowed",
                    fontSize: "0.85rem",
                    opacity: 0.6,
                    whiteSpace: "nowrap"
                  }}
                  title="Disponible en version PRO">
                    Assigner mission
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DemoLayout>
  );
}
