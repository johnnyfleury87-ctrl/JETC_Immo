import { useState } from "react";
import DemoLayout from "../../../components/demo/DemoLayout";

export default function DemoLocataireProfil() {
  const [profil] = useState({
    nom: "Dupont",
    prenom: "Marie",
    email: "marie.dupont@email.fr",
    telephone: "06 12 34 56 78",
    date_naissance: "15/03/1990",
    date_entree: "01/06/2023",
    logement: "A101 - 12 Rue des Lilas"
  });

  const [preferences, setPreferences] = useState({
    notifications_email: true,
    notifications_sms: false,
    newsletter: true
  });

  return (
    <DemoLayout role="locataire" activePage="/demo/locataire/profil">
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
              Date de naissance
            </label>
            <input
              type="text"
              value={profil.date_naissance}
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
              Date d entrée
            </label>
            <input
              type="text"
              value={profil.date_entree}
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
            Logement actuel
          </label>
          <input
            type="text"
            value={profil.logement}
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

      <div style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        marginBottom: "1.5rem"
      }}>
        <h2 style={{ marginTop: 0, color: "#2c3e50", borderBottom: "2px solid #3498db", paddingBottom: "0.5rem" }}>
          🔔 Préférences de Notifications
        </h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
          <label style={{
            display: "flex",
            alignItems: "center",
            padding: "1rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "5px",
            cursor: "not-allowed"
          }}>
            <input
              type="checkbox"
              checked={preferences.notifications_email}
              disabled
              style={{ marginRight: "1rem", transform: "scale(1.2)" }}
            />
            <div>
              <div style={{ fontWeight: "bold", color: "#555" }}>Notifications par email</div>
              <div style={{ fontSize: "0.85rem", color: "#999" }}>Recevoir des emails pour les nouveaux messages et tickets</div>
            </div>
          </label>
          
          <label style={{
            display: "flex",
            alignItems: "center",
            padding: "1rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "5px",
            cursor: "not-allowed"
          }}>
            <input
              type="checkbox"
              checked={preferences.notifications_sms}
              disabled
              style={{ marginRight: "1rem", transform: "scale(1.2)" }}
            />
            <div>
              <div style={{ fontWeight: "bold", color: "#555" }}>Notifications par SMS</div>
              <div style={{ fontSize: "0.85rem", color: "#999" }}>Recevoir des SMS pour les interventions urgentes</div>
            </div>
          </label>
          
          <label style={{
            display: "flex",
            alignItems: "center",
            padding: "1rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "5px",
            cursor: "not-allowed"
          }}>
            <input
              type="checkbox"
              checked={preferences.newsletter}
              disabled
              style={{ marginRight: "1rem", transform: "scale(1.2)" }}
            />
            <div>
              <div style={{ fontWeight: "bold", color: "#555" }}>Newsletter</div>
              <div style={{ fontSize: "0.85rem", color: "#999" }}>Recevoir les actualités et conseils de la régie</div>
            </div>
          </label>
        </div>
      </div>

      <div style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ marginTop: 0, color: "#2c3e50", borderBottom: "2px solid #3498db", paddingBottom: "0.5rem" }}>
          🔒 Sécurité
        </h2>
        
        <button style={{
          marginTop: "1.5rem",
          padding: "0.75rem 1.5rem",
          backgroundColor: "#3498db",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "not-allowed",
          opacity: 0.6,
          fontWeight: "bold"
        }}
        title="Disponible en version PRO">
          🔑 Modifier le mot de passe
        </button>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
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
          ↺ Annuler
        </button>
      </div>
    </DemoLayout>
  );
}
