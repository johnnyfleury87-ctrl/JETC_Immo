# 🚀 PLAN D'EXÉCUTION - MIGRATION SaaS COMPLÈTE

**Date:** 13 décembre 2025  
**Objectif:** Transformer la structure existante en modèle SaaS multi-tenant avec quotas automatiques

---

## 📋 ORDRE D'EXÉCUTION (CRITIQUE)

### ⚠️ BACKUP OBLIGATOIRE

```bash
# ÉTAPE 0 : BACKUP COMPLET (OBLIGATOIRE)
pg_dump -U postgres -h localhost -d jetc_immo > backup_pre_saas_$(date +%Y%m%d_%H%M%S).sql

# Vérifier taille du backup
ls -lh backup_pre_saas_*.sql

# Tester restore sur base de test (recommandé)
# createdb jetc_immo_test
# psql -U postgres -d jetc_immo_test < backup_pre_saas_XXXXXXXX.sql
```

---

## 🔄 MIGRATIONS (Ordre strict)

### Migration 1 : Plans CHF + Limites Users/Admins

**Fichier:** `supabase/migrations/01_plans_update_chf.sql`

**Action:**
```bash
cd /workspaces/JETC_Immo
psql -U postgres -h localhost -d jetc_immo -f supabase/migrations/01_plans_update_chf.sql
```

**Modifications apportées:**
- ✅ Ajoute `max_users` dans table `plans`
- ✅ Ajoute `max_admins` dans table `plans`
- ✅ Ajoute `usage_users` dans table `subscriptions`
- ✅ Ajoute `usage_admins` dans table `subscriptions`
- ✅ Change devise par défaut → CHF
- ✅ Étend fonction `check_plan_limit()` (ajoute cases 'users', 'admins', 'entreprises_partenaires')
- ✅ Crée plans Essentiel (49 CHF), Pro (99 CHF), Premium (199 CHF)
- ✅ Désactive anciens plans incompatibles

**Vérification:**
```sql
-- Vérifier plans créés
SELECT nom, prix_mensuel, devise, max_users, max_admins, max_logements 
FROM plans 
WHERE est_actif = true 
ORDER BY ordre_affichage;

-- Vérifier colonnes subscriptions
\d subscriptions
```

**Résultat attendu:**
```
     nom     | prix_mensuel | devise | max_users | max_admins | max_logements
-------------+--------------+--------+-----------+------------+---------------
 Essentiel   |        49.00 | CHF    |         2 |          1 |            25
 Pro         |        99.00 | CHF    |         5 |          1 |           150
 Premium     |       199.00 | CHF    |      NULL |       NULL |          NULL
```

**Rollback (si erreur):**
```bash
psql -U postgres -d jetc_immo -c "ROLLBACK;"
# Puis restaurer backup
psql -U postgres -d jetc_immo < backup_pre_saas_XXXXXXXX.sql
```

---

### Migration 2 : Tracking Owner/Creator

**Fichier:** `supabase/migrations/02_saas_owner_tracking.sql`

**Action:**
```bash
psql -U postgres -h localhost -d jetc_immo -f supabase/migrations/02_saas_owner_tracking.sql
```

**Modifications apportées:**
- ✅ Ajoute `is_owner` dans table `profiles`
- ✅ Ajoute `created_by` dans table `profiles`
- ✅ Ajoute `invited_at` dans table `profiles`
- ✅ Migre données existantes (1er profile/régie = owner)
- ✅ Recalcule `usage_users` et `usage_admins` depuis profiles réels
- ✅ Crée fonction `check_single_owner_per_tenant()` (optionnelle)

**Vérification:**
```sql
-- Vérifier colonnes profiles
\d profiles

-- Vérifier que chaque régie a un owner
SELECT 
  r.nom AS regie,
  COUNT(CASE WHEN p.is_owner THEN 1 END) AS nb_owners,
  COUNT(*) AS total_users
FROM regies r
LEFT JOIN profiles p ON p.regie_id = r.id
GROUP BY r.id, r.nom
ORDER BY r.nom;

-- Vérifier compteurs subscription
SELECT 
  s.id,
  s.usage_users AS compteur,
  (SELECT COUNT(*) FROM profiles WHERE regie_id = s.regie_id AND is_demo = false) AS reel
FROM subscriptions s
WHERE s.regie_id IS NOT NULL
LIMIT 5;
```

**Résultat attendu:**
- Chaque régie a au moins 1 owner (`is_owner = true`)
- `usage_users` = nombre réel de profiles (DEMO exclus)

---

### Migration 3 : Fonctions Helper Subscription

**Fichier:** `supabase/migrations/03_saas_subscription_helpers.sql`

**Action:**
```bash
psql -U postgres -h localhost -d jetc_immo -f supabase/migrations/03_saas_subscription_helpers.sql
```

**Modifications apportées:**
- ✅ Fonction `get_subscription_for_regie()`
- ✅ Fonction `get_subscription_for_entreprise()`
- ✅ Fonction `get_current_usage()`
- ✅ Fonction `can_add_user()`
- ✅ Fonction `get_quota_status()` (retourne JSON)
- ✅ Vue `regie_quota_overview` (dashboard admin)

**Vérification:**
```sql
-- Tester get_subscription_for_regie() (remplacer <uuid>)
SELECT * FROM get_subscription_for_regie('<regie_uuid>');

-- Tester can_add_user()
SELECT can_add_user('regie', '<regie_uuid>', 'locataire');

-- Tester get_quota_status()
SELECT get_quota_status('regie', '<regie_uuid>');

-- Voir vue quotas
SELECT * FROM regie_quota_overview LIMIT 5;
```

**Résultat attendu:**
- Fonctions retournent données correctes
- `can_add_user()` retourne `true` si quota non atteint
- Vue `regie_quota_overview` affiche tous les quotas

---

### Migration 4 : Triggers Automatiques Quotas

**Fichier:** `supabase/migrations/04_saas_quota_triggers.sql`

**Action:**
```bash
psql -U postgres -h localhost -d jetc_immo -f supabase/migrations/04_saas_quota_triggers.sql
```

**Modifications apportées:**
- ✅ Fonction `check_profile_quota_before_insert()` (vérification BEFORE INSERT)
- ✅ Fonction `increment_subscription_usage_after_insert()` (compteur +1 AFTER INSERT)
- ✅ Fonction `decrement_subscription_usage_after_delete()` (compteur -1 AFTER DELETE)
- ✅ Fonction `update_subscription_usage_on_role_change()` (ajustement si changement rôle)
- ✅ Fonction `prevent_owner_deletion()` (protection dernier owner)
- ✅ Fonction `check_logement_quota_before_insert()` (optionnelle, déactivée par défaut)
- ✅ Triggers actifs sur table `profiles`

**Vérification:**
```sql
-- Lister les triggers actifs
SELECT 
  tgname AS trigger_name,
  tgtype AS trigger_type,
  proname AS function_name
FROM pg_trigger t
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE tgrelid = 'profiles'::regclass
ORDER BY tgname;

-- TEST 1 : Essayer d'ajouter un user (doit incrémenter compteur)
-- Récupérer une régie avec quota disponible
SELECT * FROM regie_quota_overview WHERE users_actifs < users_limite LIMIT 1;

-- Insérer test user (remplacer <regie_uuid>)
INSERT INTO profiles (id, role, email, regie_id, is_demo)
VALUES (gen_random_uuid(), 'locataire', 'test_quota@example.com', '<regie_uuid>', false);

-- Vérifier compteur incrémenté
SELECT usage_users FROM subscriptions WHERE regie_id = '<regie_uuid>';

-- TEST 2 : Essayer d'ajouter user quand quota atteint (doit lever exception)
-- → Créer manuellement situation quota atteint, puis essayer INSERT
-- → Doit lever: "Quota utilisateurs atteint..."

-- Nettoyer test
DELETE FROM profiles WHERE email = 'test_quota@example.com';
```

**Résultat attendu:**
- 5 triggers actifs sur `profiles`
- Insertion user → compteur +1 automatique
- Suppression user → compteur -1 automatique
- Quota atteint → exception levée

---

## ✅ VÉRIFICATIONS GLOBALES (Post-migration complète)

### 1. Vérifier structure complète

```sql
-- Plans CHF avec limites
SELECT nom, prix_mensuel, devise, max_users, max_admins, max_logements, max_entreprises_partenaires
FROM plans
WHERE est_actif = true
ORDER BY prix_mensuel;

-- Profiles avec tracking owner
SELECT 
  email, 
  role, 
  is_owner, 
  created_by IS NOT NULL AS invited,
  regie_id IS NOT NULL AS has_tenant
FROM profiles
WHERE is_demo = false
LIMIT 10;

-- Subscriptions avec compteurs
SELECT 
  s.id,
  p.nom AS plan,
  s.usage_users,
  p.max_users,
  s.usage_admins,
  p.max_admins,
  s.statut
FROM subscriptions s
JOIN plans p ON p.id = s.plan_id
WHERE s.statut IN ('essai', 'actif')
LIMIT 10;
```

### 2. Tester workflow complet

```sql
-- Scénario : Régie avec plan Essentiel (max 2 users, 1 admin)

-- 1. Vérifier quota disponible
SELECT get_quota_status('regie', '<regie_uuid>');

-- 2. Vérifier si peut ajouter user
SELECT can_add_user('regie', '<regie_uuid>', 'locataire');

-- 3. Ajouter user (via API backend normalement)
INSERT INTO profiles (id, role, email, regie_id, created_by, is_demo)
VALUES (
  gen_random_uuid(),
  'locataire',
  'nouveau_user@example.com',
  '<regie_uuid>',
  '<owner_uuid>', -- ID de l'admin qui invite
  false
);

-- 4. Vérifier compteur incrémenté
SELECT usage_users FROM subscriptions WHERE regie_id = '<regie_uuid>';

-- 5. Essayer d'ajouter 3ème user (doit échouer si Essentiel)
-- → Exception attendue
```

### 3. Vérifier isolation tenant (RLS)

```sql
-- Se connecter comme user régie A
SET ROLE authenticated;
SET request.jwt.claim.sub = '<user_regie_A_uuid>';

-- Doit voir uniquement profiles de sa régie
SELECT * FROM profiles;

-- Ne doit PAS voir subscriptions d'autres régies
SELECT * FROM subscriptions;

-- Reset
RESET ROLE;
```

### 4. Dashboard quotas

```sql
-- Vue admin : tous les quotas
SELECT * FROM regie_quota_overview
ORDER BY users_actifs DESC;

-- API format JSON
SELECT get_quota_status('regie', '<regie_uuid>');
```

---

## 🎯 CHECKLIST MIGRATION COMPLÈTE

### Phase 1 : Préparation
- [ ] Backup complet créé et vérifié
- [ ] Base de test disponible (staging)
- [ ] Connexion psql fonctionnelle
- [ ] Fichiers SQL présents dans `/supabase/migrations/`

### Phase 2 : Exécution séquentielle
- [ ] Migration 01 exécutée : Plans CHF + limites users/admins
- [ ] Migration 01 vérifiée : 3 plans actifs (Essentiel, Pro, Premium)
- [ ] Migration 02 exécutée : Tracking owner/creator
- [ ] Migration 02 vérifiée : Chaque régie a 1 owner
- [ ] Migration 03 exécutée : Fonctions helper subscription
- [ ] Migration 03 vérifiée : Fonctions appellables, vue créée
- [ ] Migration 04 exécutée : Triggers automatiques quotas
- [ ] Migration 04 vérifiée : 5 triggers actifs sur profiles

### Phase 3 : Tests fonctionnels
- [ ] Test ajout user → compteur +1
- [ ] Test suppression user → compteur -1
- [ ] Test quota atteint → exception levée
- [ ] Test suppression dernier owner → exception levée
- [ ] Test changement rôle → compteur admins ajusté
- [ ] Test isolation RLS → users voient uniquement leur tenant

### Phase 4 : Validation production
- [ ] Aucune régression API backend
- [ ] Comptes DEMO non impactés (is_demo = true bypass)
- [ ] Abonnements existants fonctionnels
- [ ] Compteurs usage cohérents avec réalité
- [ ] Dashboard quotas affiche données correctes

---

## ⚠️ ROLLBACK (En cas de problème)

### Rollback complet (toutes migrations)

```bash
# Restaurer backup complet
psql -U postgres -d jetc_immo < backup_pre_saas_XXXXXXXX.sql
```

### Rollback migration spécifique

```sql
-- Migration 04 : Supprimer triggers
DROP TRIGGER IF EXISTS enforce_quota_before_profile_insert ON profiles;
DROP TRIGGER IF EXISTS increment_usage_after_profile_insert ON profiles;
DROP TRIGGER IF EXISTS decrement_usage_after_profile_delete ON profiles;
DROP TRIGGER IF EXISTS adjust_usage_on_profile_role_change ON profiles;
DROP TRIGGER IF EXISTS prevent_last_owner_deletion ON profiles;

DROP FUNCTION IF EXISTS check_profile_quota_before_insert();
DROP FUNCTION IF EXISTS increment_subscription_usage_after_insert();
-- ... etc

-- Migration 03 : Supprimer fonctions helper
DROP VIEW IF EXISTS regie_quota_overview;
DROP FUNCTION IF EXISTS get_subscription_for_regie(UUID);
-- ... etc

-- Migration 02 : Supprimer colonnes profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS is_owner;
ALTER TABLE profiles DROP COLUMN IF EXISTS created_by;
ALTER TABLE profiles DROP COLUMN IF EXISTS invited_at;

-- Migration 01 : Supprimer colonnes plans/subscriptions
ALTER TABLE plans DROP COLUMN IF EXISTS max_users;
ALTER TABLE plans DROP COLUMN IF EXISTS max_admins;
ALTER TABLE subscriptions DROP COLUMN IF EXISTS usage_users;
ALTER TABLE subscriptions DROP COLUMN IF EXISTS usage_admins;
```

---

## 📊 MONITORING POST-MIGRATION

### Requêtes utiles

```sql
-- 1. Régies proches de leur limite users
SELECT * FROM regie_quota_overview
WHERE users_limite IS NOT NULL
AND (users_actifs::float / users_limite) > 0.8
ORDER BY (users_actifs::float / users_limite) DESC;

-- 2. Régies sans abonnement actif
SELECT r.nom, r.email
FROM regies r
LEFT JOIN subscriptions s ON s.regie_id = r.id AND s.statut IN ('essai', 'actif')
WHERE s.id IS NULL;

-- 3. Incohérences compteurs (usage_users != réalité)
SELECT 
  s.id,
  s.usage_users AS compteur,
  (SELECT COUNT(*) FROM profiles WHERE regie_id = s.regie_id AND is_demo = false) AS reel,
  s.usage_users - (SELECT COUNT(*) FROM profiles WHERE regie_id = s.regie_id AND is_demo = false) AS delta
FROM subscriptions s
WHERE s.regie_id IS NOT NULL
HAVING s.usage_users != (SELECT COUNT(*) FROM profiles WHERE regie_id = s.regie_id AND is_demo = false);

-- 4. Trigger logs (si erreurs)
-- Vérifier logs PostgreSQL :
-- tail -f /var/log/postgresql/postgresql-XX-main.log | grep "Quota utilisateurs atteint"
```

---

## 🚀 DÉPLOIEMENT PRODUCTION

### Ordre recommandé

1. **DEV (local)** : Tester toutes migrations sur copie locale
2. **STAGING** : Déployer sur environnement de pré-prod avec données anonymisées
3. **VALIDATION** : Tests complets + QA
4. **PRODUCTION** : Fenêtre de maintenance (backup → migrations → vérifications)

### Commandes déploiement Supabase Cloud

```bash
# Se connecter à Supabase
supabase login

# Pousser migrations
supabase db push

# OU exécuter manuellement dans dashboard Supabase
# → SQL Editor → Coller contenu migrations → Run
```

---

## 📝 DOCUMENTATION DÉVELOPPEURS

**Après migration, informer l'équipe :**

1. **Nouveau champ `is_owner`** : Distingue owner vs users invités
2. **Nouveau champ `created_by`** : Tracking qui a invité l'user
3. **Triggers automatiques** : Quotas vérifiés à chaque INSERT profile
4. **Fonction helper** : `can_add_user()` à appeler avant formulaire d'invitation
5. **API endpoint** : `/api/quota-status` devrait utiliser `get_quota_status()`
6. **Errors handling** : Capturer exception "Quota utilisateurs atteint" dans frontend

**Exemple code backend (Node.js / Supabase):**

```javascript
// Avant d'afficher formulaire "Inviter utilisateur"
const { data: canAdd } = await supabase.rpc('can_add_user', {
  tenant_type: 'regie',
  tenant_id: regieId,
  user_role: 'locataire'
});

if (!canAdd) {
  return res.status(403).json({ 
    error: 'Quota atteint',
    message: 'Passez à un plan supérieur pour ajouter plus d\'utilisateurs'
  });
}
```

---

## ✅ SUCCÈS

**Une fois toutes les étapes complétées :**

✅ Structure SaaS multi-tenant opérationnelle  
✅ Quotas automatiques users/admins/logements  
✅ Tracking owner vs utilisateurs invités  
✅ Compteurs usage mis à jour automatiquement  
✅ Protection suppression dernier owner  
✅ Isolation tenant par RLS préservée  
✅ Pas de casse données existantes  
✅ Mode DEMO non impacté  

**Système prêt pour facturation et scaling !** 🎉
