import { useState } from "react";
import DemoLayout from "../../../components/demo/DemoLayout";

export default function DemoEntrepriseParametres() {
  const [settings] = useState({
    nomEntreprise: "PlombiTech Pro - DEMO",
    email: "contact@plombitech-demo.fr",
    telephone: "01 34 56 78 90",
    adresse: "25 Rue du Commerce, 75015 Paris",
    siret: "987 654 321 00012",
    specialites: ["Plomberie", "Chauffage", "Électricité", "Ventilation"],
    notifications: {
      nouvelleMission: true,
      validationRegie: true,
      messageTechnicien: false,
      rapportHebdomadaire: true
    },
    disponibilites: {
      urgences24h: false,
      weekend: true,
      zoneIntervention: "Paris et petite couronne"
    }
  });

  return (
    <DemoLayout role="entreprise" activePage="/demo/entreprise/parametres">
      <h1 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>⚙️ Paramètres de l'Entreprise</h1>

      <div style={{
        backgroundColor: "#fff3cd",
        padding: "1rem",
        borderRadius: "5px",
        marginBottom: "1.5rem",
        borderLeft: "4px solid #ffc107"
      }}>
        <strong>ℹ️ Mode Démo :</strong> Les modifications ne sont pas enregistrées.
      </div>

      {/* Informations générales */}
      <div style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        marginBottom: "1.5rem"
      }}>
        <h2 style={{ marginTop: 0, color: "#2c3e50", borderBottom: "2px solid #3498db", paddingBottom: "0.5rem" }}>
          🏢 Informations Générales
        </h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginTop: "1.5rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "#555" }}>
              Nom de l'entreprise
            </label>
            <input
              type="text"
              value={settings.nomEntreprise}
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
              value={settings.email}
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
              value={settings.telephone}
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
              SIRET
            </label>
            <input
              type="text"
              value={settings.siret}
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
            Adresse
          </label>
          <textarea
            value={settings.adresse}
            disabled
            rows={2}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "5px",
              backgroundColor: "#f8f9fa",
              fontFamily: "inherit"
            }}
          />
        </div>
      </div>

      {/* Spécialités */}
      <div style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        marginBottom: "1.5rem"
      }}>
        <h2 style={{ marginTop: 0, color: "#2c3e50", borderBottom: "2px solid #3498db", paddingBottom: "0.5rem" }}>
          🔧 Domaines de Compétences
        </h2>
        
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.5rem" }}>
          {settings.specialites.map((spec, idx) => (
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
        
        <button style={{
          marginTop: "1.5rem",
          padding: "0.75rem 1.5rem",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "not-allowed",
          opacity: 0.6
        }}
        title="Disponible en version PRO">
          + Ajouter une spécialité
        </button>
      </div>

      {/* Notifications */}
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
          {Object.entries(settings.notifications).map(([key, value]) => (
            <label key={key} style={{
              display: "flex",
              alignItems: "center",
              padding: "1rem",
              backgroundColor: "#f8f9fa",
              borderRadius: "5px",
              cursor: "not-allowed"
            }}>
              <input
                type="checkbox"
                checked={value}
                disabled
                style={{ marginRight: "1rem", transform: "scale(1.2)" }}
              />
              <span style={{ color: "#555" }}>
                {key === "nouvelleMission" && "Recevoir une notification lors d'une nouvelle mission"}
                {key === "validationRegie" && "Notification de validation par la régie"}
                {key === "messageTechnicien" && "Messages des techniciens"}
                {key === "rapportHebdomadaire" && "Rapport hebdomadaire d'activité"}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Disponibilités */}
      <div style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        marginBottom: "1.5rem"
      }}>
        <h2 style={{ marginTop: 0, color: "#2c3e50", borderBottom: "2px solid #3498db", paddingBottom: "0.5rem" }}>
          📅 Disponibilités & Zone d'Intervention
        </h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1.5rem" }}>
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
              checked={settings.disponibilites.urgences24h}
              disabled
              style={{ marginRight: "1rem", transform: "scale(1.2)" }}
            />
            <div>
              <div style={{ fontWeight: "bold", color: "#555" }}>Urgences 24/7</div>
              <div style={{ fontSize: "0.85rem", color: "#999" }}>Disponible pour les interventions urgentes en dehors des horaires</div>
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
              checked={settings.disponibilites.weekend}
              disabled
              style={{ marginRight: "1rem", transform: "scale(1.2)" }}
            />
            <div>
              <div style={{ fontWeight: "bold", color: "#555" }}>Interventions weekend</div>
              <div style={{ fontSize: "0.85rem", color: "#999" }}>Disponible samedi et dimanche</div>
            </div>
          </label>
          
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "#555" }}>
              Zone d'intervention
            </label>
            <input
              type="text"
              value={settings.disponibilites.zoneIntervention}
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
          ↺ Réinitialiser
        </button>
      </div>
    </DemoLayout>
  );
}
