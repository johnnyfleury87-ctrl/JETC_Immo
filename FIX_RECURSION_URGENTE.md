# 🚨 FIX URGENT : Récursion Infinie RLS

**Erreur détectée :** `ERROR: 42P17: infinite recursion detected in policy for relation "profiles"`

---

## 🎯 CAUSE

Les policies actuelles en production contiennent des **sous-SELECT sur profiles** qui créent une **boucle infinie**.

Exemple de policy récursive :
```sql
-- ❌ RÉCURSIF (CASSE TOUT)
CREATE POLICY "admin_jtec_view_all_profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles  -- ← RÉCURSION ICI
    WHERE id = auth.uid() AND role = 'admin_jtec'
  )
);
```

---

## ✅ SOLUTION IMMÉDIATE

### **Exécuter ce script dans Supabase SQL Editor :**

**Fichier :** [supabase/FIX_RLS_RESET_COMPLET.sql](supabase/FIX_RLS_RESET_COMPLET.sql)

Ce script va :
1. ✅ **DÉSACTIVER RLS** temporairement
2. ✅ **SUPPRIMER** toutes les policies récursives
3. ✅ **RÉACTIVER RLS**
4. ✅ **CRÉER** uniquement les policies SIMPLES (sans sous-SELECT)
5. ✅ **SYNCHRONISER** le role dans le JWT pour les policies admin

---

## 📋 ÉTAPES D'EXÉCUTION

### 1. Ouvrir Supabase SQL Editor

**URL :** https://supabase.com/dashboard/project/YOUR_PROJECT/sql

### 2. Copier le contenu de FIX_RLS_RESET_COMPLET.sql

**Ou exécuter directement :**

```sql
-- DÉSACTIVER RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- SUPPRIMER TOUTES LES POLICIES
DROP POLICY IF EXISTS "users_view_own_profile" ON profiles;
DROP POLICY IF EXISTS "admin_jtec_view_all_profiles" ON profiles;
DROP POLICY IF EXISTS "regie_view_own_members" ON profiles;
DROP POLICY IF EXISTS "entreprise_view_own_technicians" ON profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "admin_jtec_insert_profiles" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "admin_jtec_update_profiles" ON profiles;
DROP POLICY IF EXISTS "admin_jtec_delete_profiles" ON profiles;

-- RÉACTIVER RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- CRÉER POLICY MINIMALE (SANS SOUS-SELECT)
CREATE POLICY "users_view_own_profile"
ON profiles FOR SELECT
USING (id = auth.uid());

CREATE POLICY "users_insert_own_profile"
ON profiles FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_own_profile"
ON profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
```

### 3. Vérifier que ça fonctionne

```sql
-- Test : Lire son propre profil
SELECT id, email, role FROM profiles WHERE id = auth.uid();
```

**✅ Résultat attendu :** 1 ligne avec vos données

---

## 🔧 AJOUTER LES POLICIES ADMIN (après le reset)

### Option A : Utiliser auth.jwt() (recommandé)

```sql
-- 1. Créer le trigger de synchronisation
CREATE OR REPLACE FUNCTION public.sync_role_to_jwt()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_role_to_jwt_trigger ON profiles;
CREATE TRIGGER sync_role_to_jwt_trigger
  AFTER INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_role_to_jwt();

-- 2. Synchroniser les profils existants
UPDATE auth.users u
SET raw_app_meta_data = 
  COALESCE(u.raw_app_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', p.role)
FROM profiles p
WHERE u.id = p.id AND p.role IS NOT NULL;

-- 3. Créer les policies admin (SANS sous-SELECT)
CREATE POLICY "admin_jtec_select_all"
ON profiles FOR SELECT
USING ((auth.jwt() ->> 'role')::text = 'admin_jtec');

CREATE POLICY "admin_jtec_insert_profiles"
ON profiles FOR INSERT
WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin_jtec');

CREATE POLICY "admin_jtec_update_profiles"
ON profiles FOR UPDATE
USING ((auth.jwt() ->> 'role')::text = 'admin_jtec');

CREATE POLICY "admin_jtec_delete_profiles"
ON profiles FOR DELETE
USING ((auth.jwt() ->> 'role')::text = 'admin_jtec');
```

### Option B : Gérer les permissions admin côté application

**Plus simple, pas de JWT :**

Garder uniquement la policy `users_view_own_profile` et gérer les permissions admin dans le code Next.js.

---

## ✅ VALIDATION

### Vérifier qu'il n'y a plus de récursion

```sql
-- Lister les policies
SELECT policyname, cmd, LEFT(qual::text, 100) as using_clause
FROM pg_policies
WHERE tablename = 'profiles';
```

**✅ Attendu :** Policies simples avec `id = auth.uid()` ou `auth.jwt()`

### Vérifier le plan d'exécution

```sql
EXPLAIN (VERBOSE, COSTS OFF)
SELECT id, email, role FROM profiles WHERE id = auth.uid();
```

**✅ Attendu :** Pas de sous-SELECT sur profiles dans le plan

---

## 🚀 APRÈS LE FIX

1. **Se reconnecter** à l'application (pour obtenir le nouveau JWT avec le role)
2. **Tester** `/admin/jetc`
3. **Vérifier** que `SELECT * FROM profiles WHERE id = auth.uid()` retourne 1 ligne

---

## 📊 RÉSUMÉ

| Avant | Après |
|-------|-------|
| ❌ Policy avec sous-SELECT sur profiles | ✅ Policy simple `id = auth.uid()` |
| ❌ Récursion infinie | ✅ Pas de récursion possible |
| ❌ SELECT retourne 0 ligne | ✅ SELECT retourne 1 ligne |
| ❌ Error 42P17 | ✅ Pas d'erreur |

---

**Fichier à exécuter :** [supabase/FIX_RLS_RESET_COMPLET.sql](supabase/FIX_RLS_RESET_COMPLET.sql)

**Statut :** 🔴 **URGENT** - À exécuter immédiatement en production
