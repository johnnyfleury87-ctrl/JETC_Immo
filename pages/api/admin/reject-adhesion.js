import { createClient } from "@supabase/supabase-js";

// Client Supabase avec clé service (admin)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { requestId, adminId, reason } = req.body;

  if (!requestId || !adminId) {
    return res.status(400).json({ error: "requestId et adminId requis" });
  }

  try {
    // 1. Vérifier que l'admin est bien admin_jtec
    const { data: admin, error: adminError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", adminId)
      .single();

    if (adminError || !admin || admin.role !== "admin_jtec") {
      return res.status(403).json({ error: "Accès refusé. Admin JETC requis." });
    }

    // 2. Récupérer la demande
    const { data: request, error: requestError } = await supabaseAdmin
      .from("adhesion_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (requestError || !request) {
      return res.status(404).json({ error: "Demande introuvable" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "Demande déjà traitée" });
    }

    // 3. Marquer comme rejetée
    const { error: updateError } = await supabaseAdmin
      .from("adhesion_requests")
      .update({
        status: "rejected",
        validated_at: new Date().toISOString(),
        validated_by: adminId,
        rejection_reason: reason || null,
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("Erreur rejet demande:", updateError);
      return res.status(500).json({ error: "Erreur mise à jour demande: " + updateError.message });
    }

    // 4. ENVOYER EMAIL DE REJET (à implémenter)
    // TODO: Intégrer service email
    // Contenu:
    // - Désolé, votre demande n'a pas été acceptée
    // - Raison (si fournie)
    // - Contact support JETC pour plus d'infos

    console.log("Email rejet à envoyer à:", request.owner_email);
    console.log("Raison:", reason || "Non spécifiée");

    return res.status(200).json({
      success: true,
      message: "Demande rejetée",
      owner_email: request.owner_email,
      reason: reason || null,
    });
  } catch (error) {
    console.error("Erreur rejet:", error);
    return res.status(500).json({ error: "Erreur serveur: " + error.message });
  }
}
