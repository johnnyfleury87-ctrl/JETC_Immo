import { useState } from "react";
import DemoLayout from "../../../components/demo/DemoLayout";

export default function DemoRegieParametres() {
  const [settings] = useState({
    nomRegie: "Régie Immobilière Démo",
    email: "contact@regie-demo.fr",
    telephone: "01 23 45 67 89",
    adresse: "15 Avenue de la République, 75011 Paris",
    siret: "123 456 789 00012",
    notifications: {
      nouveauTicket: true,
      validationMission: true,
      retardPaiement: false,
      rapportHebdomadaire: true
    },
    diffusion: {
      autoValidation: false,
      maxEntreprises: 3,
      delaiReponse: 24
    }
  });

  return (
    <DemoLayout role="regie" activePage="/demo/regie/parametres">
      <h1 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>⚙️ Paramètres de la Régie</h1>

      <div style={{
        backgroundColor: "#fff3cd",
        padding: "1rem",
        borderRadius: "5px",
        marginBottom: "1.5rem",
        borderLeft: "4px solid #ffc107"
      }}>
        <strong>ℹ️ Mode Démo :</strong> Les modifications ne sont pas enregistrées. Fonctionnalités simulées uniquement.
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
              Nom de la régie
            </label>
            <input
              type="text"
              value={settings.nomRegie}
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
                {key === "nouveauTicket" && "Recevoir une notification lors d'un nouveau ticket"}
                {key === "validationMission" && "Notification de validation de mission"}
                {key === "retardPaiement" && "Alertes de retard de paiement"}
                {key === "rapportHebdomadaire" && "Rapport hebdomadaire d'activité"}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Paramètres de diffusion */}
      <div style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        marginBottom: "1.5rem"
      }}>
        <h2 style={{ marginTop: 0, color: "#2c3e50", borderBottom: "2px solid #3498db", paddingBottom: "0.5rem" }}>
          📤 Paramètres de Diffusion
        </h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginTop: "1.5rem" }}>
          <div>
            <label style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
              <input
                type="checkbox"
                checked={settings.diffusion.autoValidation}
                disabled
                style={{ marginRight: "0.75rem", transform: "scale(1.2)" }}
              />
              <span style={{ fontWeight: "bold", color: "#555" }}>Auto-validation des missions</span>
            </label>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#666", paddingLeft: "2rem" }}>
              Valider automatiquement les missions si une seule entreprise répond
            </p>
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "#555" }}>
              Nombre maximum d'entreprises contactées
            </label>
            <input
              type="number"
              value={settings.diffusion.maxEntreprises}
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
              Délai de réponse (heures)
            </label>
            <input
              type="number"
              value={settings.diffusion.delaiReponse}
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
