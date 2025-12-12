import { useState } from "react";
import DemoLayout from "../../../components/demo/DemoLayout";

export default function DemoLocataireLogement() {
  const [logement] = useState({
    reference: "A101",
    adresse: "12 Rue des Lilas, 75012 Paris",
    type: "T3",
    surface: 65,
    loyer: 890,
    charges: 150,
    date_entree: "01/06/2023",
    regie: "Régie Horizon",
    contact_regie: "contact@regie-horizon.fr",
    telephone_regie: "01 23 45 67 89"
  });

  const [documents] = useState([
    { nom: "Contrat de location", date: "01/06/2023", type: "PDF" },
    { nom: "État des lieux entrée", date: "01/06/2023", type: "PDF" },
    { nom: "Quittance Novembre 2025", date: "01/11/2025", type: "PDF" },
    { nom: "Quittance Décembre 2025", date: "01/12/2025", type: "PDF" }
  ]);

  return (
    <DemoLayout role="locataire" activePage="/demo/locataire/logement">
      <h1 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>🔑 Mon Logement</h1>

      <div style={{
        backgroundColor: "#fff3cd",
        padding: "1rem",
        borderRadius: "5px",
        marginBottom: "1.5rem",
        borderLeft: "4px solid #ffc107"
      }}>
        <strong>ℹ️ Mode Démo :</strong> Informations fictives.
      </div>

      <div style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        marginBottom: "1.5rem"
      }}>
        <h2 style={{ marginTop: 0, color: "#2c3e50", borderBottom: "2px solid #3498db", paddingBottom: "0.5rem" }}>
          🏠 Informations du Logement
        </h2>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginTop: "1.5rem"
        }}>
          <div>
            <div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.25rem" }}>Référence</div>
            <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#2c3e50" }}>{logement.reference}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.25rem" }}>Type</div>
            <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#2c3e50" }}>{logement.type}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.25rem" }}>Surface</div>
            <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#2c3e50" }}>{logement.surface} m²</div>
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.25rem" }}>Date d entrée</div>
            <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#2c3e50" }}>{logement.date_entree}</div>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.25rem" }}>Adresse</div>
          <div style={{ fontSize: "1.1rem", color: "#2c3e50" }}>📍 {logement.adresse}</div>
        </div>
      </div>

      <div style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        marginBottom: "1.5rem"
      }}>
        <h2 style={{ marginTop: 0, color: "#2c3e50", borderBottom: "2px solid #3498db", paddingBottom: "0.5rem" }}>
          💶 Informations Financières
        </h2>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.5rem",
          marginTop: "1.5rem"
        }}>
          <div style={{
            padding: "1.5rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.5rem" }}>Loyer mensuel</div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#27ae60" }}>{logement.loyer} €</div>
          </div>
          <div style={{
            padding: "1.5rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.5rem" }}>Charges mensuelles</div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3498db" }}>{logement.charges} €</div>
          </div>
          <div style={{
            padding: "1.5rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.5rem" }}>Total mensuel</div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#2c3e50" }}>{logement.loyer + logement.charges} €</div>
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        marginBottom: "1.5rem"
      }}>
        <h2 style={{ marginTop: 0, color: "#2c3e50", borderBottom: "2px solid #3498db", paddingBottom: "0.5rem" }}>
          🏢 Contact Régie
        </h2>
        
        <div style={{ marginTop: "1.5rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.25rem" }}>Nom de la régie</div>
            <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#2c3e50" }}>{logement.regie}</div>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.25rem" }}>Email</div>
            <div style={{ fontSize: "1.1rem", color: "#2c3e50" }}>📧 {logement.contact_regie}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.25rem" }}>Téléphone</div>
            <div style={{ fontSize: "1.1rem", color: "#2c3e50" }}>📞 {logement.telephone_regie}</div>
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ marginTop: 0, color: "#2c3e50", borderBottom: "2px solid #3498db", paddingBottom: "0.5rem" }}>
          📄 Documents
        </h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1.5rem" }}>
          {documents.map((doc, idx) => (
            <div key={idx} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem",
              backgroundColor: "#f8f9fa",
              borderRadius: "5px"
            }}>
              <div>
                <div style={{ fontWeight: "bold", color: "#2c3e50" }}>{doc.nom}</div>
                <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.25rem" }}>
                  {doc.type} • {doc.date}
                </div>
              </div>
              <button style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#3498db",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "not-allowed",
                fontSize: "0.85rem",
                opacity: 0.6
              }}
              title="Disponible en version PRO">
                📥 Télécharger
              </button>
            </div>
          ))}
        </div>
      </div>
    </DemoLayout>
  );
}
