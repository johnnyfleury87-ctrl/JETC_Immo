# ⚡ COMMANDES EXACTES - Admin JETC

Copier-coller ces commandes dans l'ordre.

---

## 🎯 ÉTAPE 1 : Supabase Dashboard (Interface Web)

```
1. Ouvrir : https://app.supabase.com/project/VOTRE_PROJECT/auth/users
2. Cliquer : "Invite User"
3. Email  : johnny.fleury87@gmail.com
4. Cliquer : "Invite User"
```

✅ **Résultat** : Magic link envoyé à l'email

---

## 💾 ÉTAPE 2 : Créer le profile (SQL Editor)

### Dans Supabase SQL Editor, exécuter :

```sql
-- ============================================================================
-- Script : create_admin_jetc.sql
-- Description : Création de l'utilisateur admin JETC (johnny.fleury87@gmail.com)
-- ============================================================================

DO $$
DECLARE
  admin_user_id UUID;
  existing_profile_id UUID;
BEGIN
  -- Vérifier que l'utilisateur existe dans auth.users
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'johnny.fleury87@gmail.com';
  
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION '❌ Utilisateur non trouvé. Créez-le d''abord via Invite User.';
  END IF;
  
  RAISE NOTICE '✓ Utilisateur trouvé : %', admin_user_id;
  
  -- Vérifier si un profile existe déjà
  SELECT id INTO existing_profile_id
  FROM profiles
  WHERE id = admin_user_id;
  
  IF existing_profile_id IS NOT NULL THEN
    -- Mise à jour vers admin_jtec
    UPDATE profiles
    SET 
      role = 'admin_jtec',
      prenom = 'Johnny',
      nom = 'Fleury',
      regie_id = NULL,
      entreprise_id = NULL,
      is_demo = false,
      updated_at = NOW()
    WHERE id = admin_user_id;
    
    RAISE NOTICE '✓ Profile mis à jour vers admin_jtec';
  ELSE
    -- Création du profile
    INSERT INTO profiles (
      id,
      email,
      prenom,
      nom,
      role,
      regie_id,
      entreprise_id,
      is_demo
    )
    VALUES (
      admin_user_id,
      'johnny.fleury87@gmail.com',
      'Johnny',
      'Fleury',
      'admin_jtec',
      NULL,
      NULL,
      false
    );
    
    RAISE NOTICE '✓ Profile admin_jtec créé';
  END IF;
  
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ ADMIN JETC CRÉÉ AVEC SUCCÈS';
  RAISE NOTICE '   Email : johnny.fleury87@gmail.com';
  RAISE NOTICE '   UUID  : %', admin_user_id;
  RAISE NOTICE '   Rôle  : admin_jtec';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- Vérification
SELECT 
  id,
  email,
  prenom,
  nom,
  role,
  regie_id,
  entreprise_id,
  is_demo
FROM profiles
WHERE email = 'johnny.fleury87@gmail.com';
```

✅ **Résultat attendu** : "✅ ADMIN JETC CRÉÉ AVEC SUCCÈS"

---

## ✔️ ÉTAPE 3 : Vérifier (SQL Editor)

### Dans Supabase SQL Editor, exécuter :

```sql
-- Vérification rapide
SELECT 
  '✓ Profile existe' AS check_1,
  CASE 
    WHEN COUNT(*) = 1 THEN 'OK'
    ELSE 'ERREUR'
  END AS resultat
FROM profiles
WHERE email = 'johnny.fleury87@gmail.com';

SELECT 
  '✓ Rôle correct' AS check_2,
  CASE 
    WHEN role = 'admin_jtec' THEN 'OK'
    ELSE 'ERREUR'
  END AS resultat,
  role AS role_actuel
FROM profiles
WHERE email = 'johnny.fleury87@gmail.com';

SELECT 
  '✓ Isolation admin' AS check_3,
  CASE 
    WHEN regie_id IS NULL AND entreprise_id IS NULL THEN 'OK'
    ELSE 'ERREUR'
  END AS resultat
FROM profiles
WHERE email = 'johnny.fleury87@gmail.com';

SELECT 
  '✓ Auth.users' AS check_4,
  CASE 
    WHEN COUNT(*) = 1 THEN 'OK'
    ELSE 'ERREUR'
  END AS resultat
FROM auth.users
WHERE email = 'johnny.fleury87@gmail.com';

SELECT 
  '✓ Is Demo = false' AS check_5,
  CASE 
    WHEN NOT is_demo THEN 'OK'
    ELSE 'ERREUR'
  END AS resultat
FROM profiles
WHERE email = 'johnny.fleury87@gmail.com';
```

✅ **Résultat attendu** : Tous les checks affichent "OK"

---

## 🔐 ÉTAPE 4 : Se connecter

```
1. Ouvrir l'email (johnny.fleury87@gmail.com)
2. Cliquer sur le magic link Supabase
3. → Redirection automatique vers http://localhost:3000/admin/jetc
```

✅ **Résultat attendu** : Page admin JETC visible

---

## 🧪 ÉTAPE 5 : Tester les protections

### Test 1 : Accès autorisé

```
http://localhost:3000/admin/jetc
```

✅ **Attendu** : Page accessible, demandes d'adhésion visibles

### Test 2 : Accès refusé (doit rediriger vers /login)

```
http://localhost:3000/locataire/dashboard
http://localhost:3000/regie/dashboard
http://localhost:3000/entreprise/missions
http://localhost:3000/technicien/missions
```

✅ **Attendu** : Redirection forcée vers `/login`

---

## 📊 Résumé des vérifications

| Vérification | Commande | Résultat attendu |
|--------------|----------|-----------------|
| User auth.users | `SELECT * FROM auth.users WHERE email='johnny.fleury87@gmail.com'` | 1 ligne |
| Profile existe | `SELECT * FROM profiles WHERE email='johnny.fleury87@gmail.com'` | 1 ligne |
| Rôle correct | `SELECT role FROM profiles WHERE email='johnny.fleury87@gmail.com'` | `admin_jtec` |
| Isolation | `SELECT regie_id, entreprise_id FROM profiles WHERE email='johnny.fleury87@gmail.com'` | `NULL`, `NULL` |
| Is Demo | `SELECT is_demo FROM profiles WHERE email='johnny.fleury87@gmail.com'` | `false` |

---

## 🆘 En cas d'erreur

### Erreur : "Utilisateur non trouvé"

```
➡️  Retournez à l'ÉTAPE 1 (Invite User dans Supabase Dashboard)
```

### Erreur : "Profile avec mauvais rôle"

```sql
-- Forcer la mise à jour
UPDATE profiles
SET role = 'admin_jtec',
    regie_id = NULL,
    entreprise_id = NULL,
    is_demo = false
WHERE email = 'johnny.fleury87@gmail.com';
```

### Erreur : "Contrainte check_role_consistency violée"

```sql
-- Vérifier la contrainte
SELECT 
  role,
  regie_id,
  entreprise_id,
  CASE 
    WHEN role = 'admin_jtec' AND regie_id IS NULL AND entreprise_id IS NULL THEN 'OK'
    ELSE 'ERREUR'
  END AS contrainte_ok
FROM profiles
WHERE email = 'johnny.fleury87@gmail.com';
```

---

## ✅ Checklist finale

- [ ] Magic link reçu par email
- [ ] Script SQL exécuté sans erreur
- [ ] Toutes les vérifications passent (OK)
- [ ] Connexion via magic link réussie
- [ ] Redirection vers `/admin/jetc` fonctionne
- [ ] Accès aux vues client bloqué

---

**Temps estimé** : 5 minutes  
**Difficulté** : Facile  
**Prérequis** : Accès Supabase Dashboard + SQL Editor
