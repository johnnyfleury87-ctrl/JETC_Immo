-- ============================================================================
-- Fichier : storage_buckets.sql
-- Description : Configuration des buckets Supabase Storage et leurs policies
-- ============================================================================

-- Créer les buckets s'ils n'existent pas déjà
-- Note : Cette commande doit être exécutée via le dashboard Supabase ou l'API

-- ============================================================================
-- Bucket : signatures
-- Description : Stockage des signatures numériques (client + technicien)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'signatures',
  'signatures',
  false, -- privé
  5242880, -- 5 MB max
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Policies pour le bucket signatures
CREATE POLICY "Entreprises et techniciens peuvent uploader signatures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'signatures' AND
  (
    -- L'entreprise ou le technicien peut uploader une signature pour ses missions
    EXISTS (
      SELECT 1 FROM missions m
      JOIN profiles p ON p.id = auth.uid()
      WHERE (
        (p.role = 'entreprise' AND m.entreprise_id = p.entreprise_id)
        OR
        (p.role = 'technicien' AND (m.technicien_id = p.id OR m.entreprise_id = p.entreprise_id))
      )
      AND (storage.foldername(name))[1] = m.id::text
    )
  )
);

CREATE POLICY "Utilisateurs autorisés peuvent lire signatures"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'signatures' AND
  (
    -- Entreprise, technicien, régie, locataire peuvent voir les signatures de leurs missions
    EXISTS (
      SELECT 1 FROM missions m
      JOIN tickets t ON m.ticket_id = t.id
      JOIN profiles p ON p.id = auth.uid()
      WHERE (storage.foldername(name))[1] = m.id::text
      AND (
        (p.role = 'entreprise' AND m.entreprise_id = p.entreprise_id)
        OR
        (p.role = 'technicien' AND m.entreprise_id = p.entreprise_id)
        OR
        (p.role = 'regie' AND t.regie_id = p.regie_id)
        OR
        (p.role = 'locataire' AND t.locataire_id IN (SELECT id FROM locataires WHERE profile_id = p.id))
        OR
        p.role = 'admin_jtec'
      )
    )
  )
);

CREATE POLICY "Entreprises peuvent supprimer leurs signatures"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'signatures' AND
  EXISTS (
    SELECT 1 FROM missions m
    JOIN profiles p ON p.id = auth.uid()
    WHERE (storage.foldername(name))[1] = m.id::text
    AND (
      (p.role = 'entreprise' AND m.entreprise_id = p.entreprise_id)
      OR
      p.role = 'admin_jtec'
    )
  )
);

-- ============================================================================
-- Bucket : photos-missions
-- Description : Photos d'intervention prises par les techniciens
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos-missions',
  'photos-missions',
  false, -- privé
  10485760, -- 10 MB max
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Policies pour le bucket photos-missions
CREATE POLICY "Entreprises et techniciens peuvent uploader photos missions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos-missions' AND
  (
    EXISTS (
      SELECT 1 FROM missions m
      JOIN profiles p ON p.id = auth.uid()
      WHERE (storage.foldername(name))[1] = m.id::text
      AND (
        (p.role = 'entreprise' AND m.entreprise_id = p.entreprise_id)
        OR
        (p.role = 'technicien' AND (m.technicien_id = p.id OR m.entreprise_id = p.entreprise_id))
      )
    )
  )
);

CREATE POLICY "Utilisateurs autorisés peuvent lire photos missions"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'photos-missions' AND
  (
    EXISTS (
      SELECT 1 FROM missions m
      JOIN tickets t ON m.ticket_id = t.id
      JOIN profiles p ON p.id = auth.uid()
      WHERE (storage.foldername(name))[1] = m.id::text
      AND (
        (p.role = 'entreprise' AND m.entreprise_id = p.entreprise_id)
        OR
        (p.role = 'technicien' AND m.entreprise_id = p.entreprise_id)
        OR
        (p.role = 'regie' AND t.regie_id = p.regie_id)
        OR
        (p.role = 'locataire' AND t.locataire_id IN (SELECT id FROM locataires WHERE profile_id = p.id))
        OR
        p.role = 'admin_jtec'
      )
    )
  )
);

CREATE POLICY "Entreprises peuvent supprimer leurs photos missions"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'photos-missions' AND
  EXISTS (
    SELECT 1 FROM missions m
    JOIN profiles p ON p.id = auth.uid()
    WHERE (storage.foldername(name))[1] = m.id::text
    AND (
      (p.role = 'entreprise' AND m.entreprise_id = p.entreprise_id)
      OR
      p.role = 'admin_jtec'
    )
  )
);

-- ============================================================================
-- Bucket : photos-tickets
-- Description : Photos attachées aux tickets (pour étapes futures)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos-tickets',
  'photos-tickets',
  false, -- privé
  10485760, -- 10 MB max
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Policies pour le bucket photos-tickets
CREATE POLICY "Locataires et régies peuvent uploader photos tickets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos-tickets' AND
  (
    EXISTS (
      SELECT 1 FROM tickets t
      JOIN profiles p ON p.id = auth.uid()
      WHERE (storage.foldername(name))[1] = t.id::text
      AND (
        (p.role = 'locataire' AND t.locataire_id IN (SELECT id FROM locataires WHERE profile_id = p.id))
        OR
        (p.role = 'regie' AND t.regie_id = p.regie_id)
        OR
        p.role = 'admin_jtec'
      )
    )
  )
);

CREATE POLICY "Utilisateurs autorisés peuvent lire photos tickets"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'photos-tickets' AND
  (
    EXISTS (
      SELECT 1 FROM tickets t
      JOIN profiles p ON p.id = auth.uid()
      WHERE (storage.foldername(name))[1] = t.id::text
      AND (
        (p.role = 'locataire' AND t.locataire_id IN (SELECT id FROM locataires WHERE profile_id = p.id))
        OR
        (p.role = 'regie' AND t.regie_id = p.regie_id)
        OR
        (p.role = 'entreprise' AND (
          (t.diffusion_mode = 'general' AND t.statut IN ('diffusé', 'accepté', 'en_cours', 'terminé'))
          OR
          (t.diffusion_mode = 'restreint' AND p.entreprise_id = ANY(t.entreprises_autorisees))
        ))
        OR
        (p.role = 'technicien' AND (
          (t.diffusion_mode = 'general' AND t.statut IN ('diffusé', 'accepté', 'en_cours', 'terminé'))
          OR
          (t.diffusion_mode = 'restreint' AND p.entreprise_id = ANY(t.entreprises_autorisees))
        ))
        OR
        p.role = 'admin_jtec'
      )
    )
  )
);

-- ============================================================================
-- NOTES SUR LE STOCKAGE
-- ============================================================================

-- 1. Toutes les photos et signatures sont privées (non accessibles publiquement)
-- 2. Les URLs signées doivent être générées côté serveur avec le SERVICE_ROLE_KEY
-- 3. Format de stockage recommandé :
--    - signatures/{mission_id}/signature_client_{timestamp}.png
--    - signatures/{mission_id}/signature_technicien_{timestamp}.png
--    - photos-missions/{mission_id}/{uuid}.jpg
--    - photos-tickets/{ticket_id}/{uuid}.jpg
-- 4. Les policies RLS contrôlent l'accès en fonction du rôle et des relations
