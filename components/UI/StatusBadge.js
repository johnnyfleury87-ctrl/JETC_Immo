export default function StatusBadge({ status, text }) {
  // Normaliser le statut pour correspondre aux classes CSS
  const statusClass = `status-${status}`;

  // Mapper les statuts pour affichage lisible
  const statusLabels = {
    nouveau: "Nouveau",
    diffuse: "Diffusé",
    accepte: "Accepté",
    planifiee: "Planifiée",
    en_cours: "En cours",
    en_attente: "En attente",
    termine: "Terminé",
    annule: "Annulé",
  };

  // Utiliser text si fourni, sinon mapper status, sinon status brut
  const label = text || statusLabels[status] || status || '';

  return <span className={statusClass}>{label}</span>;
}
