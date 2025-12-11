-- ============================================================================
-- Fichier : 05_triggers.sql
-- Description : Triggers automatiques pour gestion du cycle de vie
-- ============================================================================

-- Trigger pour créer automatiquement un profil après création d'un utilisateur
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, is_demo)
  VALUES (
    NEW.id,
    NEW.email,
    'locataire', -- Rôle par défaut, sera modifié selon le contexte
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attacher le trigger à la création d'utilisateur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Note : D'autres triggers seront ajoutés selon les étapes
--   - Triggers pour notifications (création ticket, mission, etc.)
--   - Triggers pour mise à jour automatique des timestamps
--   - Triggers pour logs d'audit (mode DEMO/PRO)
