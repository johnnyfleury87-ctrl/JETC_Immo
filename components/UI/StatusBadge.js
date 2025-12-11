export default function StatusBadge({ status }) {
  // Normaliser le statut pour correspondre aux classes CSS
  const statusClass = `status-${status}`;
  
  // Mapper les statuts pour affichage lisible
  const statusLabels = {
    "nouveau": "Nouveau",
    "diffuse": "Diffusé",
    "accepte": "Accepté",
    "planifiee": "Planifiée",
    "en_cours": "En cours",
    "termine": "Terminé",
    "annule": "Annulé"
  };

  const label = statusLabels[status] || status;

  return (
    <span className={statusClass}>
      {label}
    </span>
  );
}
