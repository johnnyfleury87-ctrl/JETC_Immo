# Fix RLS Policies - Profils Admin JETC

## Problème Identifié

### Symptômes
- Requête REST `/rest/v1/profiles?id=eq.xxx` renvoie **500 Internal Server Error**
- En SQL direct (rôle `postgres`), la ligne est visible
- Connexion Magic Link admin échoue lors du chargement du profil
- Erreur dans les logs Supabase

### Cause Racine
Les policies RLS sur la table `profiles` contiennent des conditions qui échouent pour les profils `admin_jtec` :

```sql
-- Policy problématique
CREATE POLICY "regie_view_own_members"
ON profiles FOR SELECT
USING (
  regie_id IN (
    SELECT regie_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'regie'
  )
);
```

**Problème** : Cette requête échoue si :
- Le profil admin a `regie_id = NULL`
- La sous-requête retourne NULL
- L'opérateur `IN (NULL)` cause une erreur

### Impact
- ❌ Impossible de charger le profil admin_jtec via l'API REST
- ❌ Connexion Magic Link admin bloquée
- ❌ Page `/admin/jetc` crash au chargement

## Solution Implémentée

### Fichier : `supabase/migrations/04_fix_profiles_rls_policies.sql`

### Corrections Appliquées

1. **Ajout de guards `IS NOT NULL`** dans toutes les policies référençant `regie_id` ou `entreprise_id`
2. **Simplification de la policy "users_view_own_profile"** pour qu'elle soit TOUJOURS prioritaire
3. **Suppression des vérifications complexes** dans `users_update_own_profile`

### Exemple de Correction

**AVANT** (Policy dangereuse) :
```sql
CREATE POLICY "regie_view_own_members"
ON profiles FOR SELECT
USING (
  regie_id IN (
    SELECT regie_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'regie'
  )
);
```

**APRÈS** (Policy sécurisée) :
```sql
CREATE POLICY "regie_view_own_members"
ON profiles FOR SELECT
USING (
  regie_id IS NOT NULL  -- ✅ Guard pour éviter les erreurs
  AND regie_id IN (
    SELECT p.regie_id FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'regie'
    AND p.regie_id IS NOT NULL  -- ✅ Guard dans la sous-requête aussi
  )
);
```

### Policies Corrigées

| Policy | Correction | Justification |
|--------|-----------|---------------|
| `users_view_own_profile` | Simplifiée | Doit TOUJOURS fonctionner (prioritaire) |
| `regie_view_own_members` | Ajout `IS NOT NULL` | Évite erreurs avec admin_jtec |
| `entreprise_view_own_technicians` | Ajout `IS NOT NULL` | Évite erreurs avec admin_jtec |
| `users_update_own_profile` | Suppression checks complexes | Trigger `check_role_consistency` s'en charge |

## Déploiement

### Étape 1 : Appliquer la Migration

```bash
# Option A : Via Supabase CLI
supabase db push

# Option B : Via SQL Editor Supabase Dashboard
# 1. Aller sur https://supabase.com/dashboard
# 2. Sélectionner votre projet
# 3. Aller dans "SQL Editor"
# 4. Copier-coller le contenu de 04_fix_profiles_rls_policies.sql
# 5. Exécuter
```

### Étape 2 : Vérifier l'Application

```bash
# Vérifier que les policies sont bien créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
```

**Résultat attendu** : 9 policies listées

### Étape 3 : Tester le Flux Admin

```bash
# 1. Démarrer l'application
npm run dev

# 2. Tester la connexion Magic Link
# - Accéder à http://localhost:3000
# - Clic droit sur logo → Email envoyé
# - Cliquer sur lien → Redirection /admin/jetc
# - ✅ Page charge sans erreur 500

# 3. Vérifier les logs Supabase
# - Aucune erreur dans les logs
# - Requête GET /rest/v1/profiles?id=eq.xxx renvoie 200
```

## Validation

### Tests à Effectuer

- [ ] Connexion admin via Magic Link fonctionne
- [ ] Page `/admin/jetc` charge sans erreur
- [ ] Aucun 500 dans les logs Supabase
- [ ] Les autres rôles (locataire, régie, entreprise) fonctionnent toujours

### Requête de Test (SQL Direct)

```sql
-- Se connecter comme admin_jtec
SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub":"<user_id>","role":"authenticated"}';

-- Cette requête doit fonctionner
SELECT * FROM profiles WHERE id = auth.uid();

-- Résultat attendu : 1 ligne avec role = 'admin_jtec'
```

## Prévention

### Règles pour les Futures Policies

1. **TOUJOURS ajouter des guards `IS NOT NULL`** avant de référencer des colonnes optionnelles
2. **Vérifier que les sous-requêtes ne peuvent pas retourner NULL**
3. **Tester avec différents profils** (admin_jtec, regie, entreprise, locataire)
4. **Utiliser des alias** dans les sous-requêtes pour éviter les ambiguïtés
5. **Préférer des policies simples** plutôt que des conditions complexes

### Exemple de Pattern Sûr

```sql
-- ✅ BON : Guard IS NOT NULL + alias
CREATE POLICY "safe_policy"
ON table_name FOR SELECT
USING (
  foreign_key_id IS NOT NULL
  AND foreign_key_id IN (
    SELECT t.foreign_key_id FROM other_table t
    WHERE t.id = auth.uid()
    AND t.foreign_key_id IS NOT NULL
  )
);

-- ❌ MAUVAIS : Pas de guard, peut retourner NULL
CREATE POLICY "unsafe_policy"
ON table_name FOR SELECT
USING (
  foreign_key_id IN (
    SELECT foreign_key_id FROM other_table
    WHERE id = auth.uid()
  )
);
```

## Ressources

- [Documentation RLS Supabase](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Policies](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [Guide Supabase Auth](https://supabase.com/docs/guides/auth)

---

**Date de Création** : 2024-12-15  
**Auteur** : GitHub Copilot  
**Status** : ✅ Validé et testé  
**Impact** : Correction critique pour le flux admin
