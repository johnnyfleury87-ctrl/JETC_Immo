import { useState } from "react";
import DemoLayout from "../../../components/demo/DemoLayout";
import withDemoAccess from "../../../lib/withDemoAccess";

function DemoTechnicienProfil() {
  const [profil] = useState({
    nom: "Dupont",
    prenom: "Jean",
    email: "jean.dupont@plombitech.fr",
    telephone: "06 12 34 56 78",
    specialites: ["Plomberie", "Chauffage"],
    entreprise: "PlombiTech Pro",
    date_embauche: "15/03/2022"
  });

  const [stats] = useState({
    missions_completees: 38,
    note_moyenne: 4.8,
    taux_reussite: 94,
    ca_genere: 10800
  });

  return (
    <DemoLayout role="technicien" activePage="/demo/technicien/profil">
      <h1 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>👤 Mon Profil</h1>

      <div style={{
        backgroundColor: "#fff3cd",
        padding: "1rem",
        borderRadius: "5px",
        marginBottom: "1.5rem",
        borderLeft: "4px solid #ffc107"
      }}>
        <strong>ℹ️ Mode Démo :</strong> Profil fictif. Les modifications ne sont pas enregistrées.
      </div>

      <div style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        marginBottom: "1.5rem"
      }}>
        <h2 style={{ marginTop: 0, color: "#2c3e50", borderBottom: "2px solid #3498db", paddingBottom: "0.5rem" }}>
          📋 Informations Personnelles
        </h2>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginTop: "1.5rem"
        }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "#555" }}>
              Prénom
            </label>
            <input
              type="text"
              value={profil.prenom}
              disabled
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "5px",
                backgroundColor: "#f8f9fa"
              }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "#555" }}>
              Nom
            </label>
            <input
              type="text"
              value={profil.nom}
              disabled
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "5px",
                backgroundColor: "#f8f9fa"
              }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "#555" }}>
              Email
            </label>
            <input
              type="email"
              value={profil.email}
              disabled
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "5px",
                backgroundColor: "#f8f9fa"
              }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "#555" }}>
              Téléphone
            </label>
            <input
              type="tel"
              value={profil.telephone}
              disabled
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "5px",
                backgroundColor: "#f8f9fa"
              }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "#555" }}>
              Entreprise
            </label>
            <input
              type="text"
              value={profil.entreprise}
              disabled
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "5px",
                backgroundColor: "#f8f9fa"
              }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "#555" }}>
              Date d embauche
            </label>
            <input
              type="text"
              value={profil.date_embauche}
              disabled
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "5px",
                backgroundColor: "#f8f9fa"
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "#555" }}>
            Spécialités
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {profil.specialites.map((spec, idx) => (
              <span key={idx} style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#3498db",
                color: "white",
                borderRadius: "20px",
                fontWeight: "bold",
                fontSize: "0.9rem"
              }}>
                {spec}
              </span>
            ))}
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
          📊 Mes Statistiques
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
            <div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.5rem" }}>Missions complétées</div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#27ae60" }}>{stats.missions_completees}</div>
          </div>
          <div style={{
            padding: "1.5rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.5rem" }}>Note moyenne</div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#e67e22" }}>⭐ {stats.note_moyenne}</div>
          </div>
          <div style={{
            padding: "1.5rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.5rem" }}>Taux de réussite</div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3498db" }}>{stats.taux_reussite}%</div>
          </div>
          <div style={{
            padding: "1.5rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.5rem" }}>CA généré</div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#27ae60" }}>{stats.ca_genere} €</div>
          </div>
        </div>
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
          💾 Enregistrer les modifications
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
          🔑 Modifier mot de passe
        </button>
      </div>
    </DemoLayout>
  );
}

export default withDemoAccess(DemoTechnicienProfil);
