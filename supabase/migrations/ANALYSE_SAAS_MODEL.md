# 🏢 MODÈLE SaaS CONTRÔLÉ - JETC IMMO

**Date:** 13 décembre 2025  
**Objectif:** Architecture SaaS multi-tenant avec contrôle strict des quotas

---

## 📐 SCHÉMA LOGIQUE SaaS

### Modèle tenant

```
┌─────────────────────────────────────────────────────────────┐
│                        RÉGIE (Tenant)                       │
│  - ID unique                                                │
│  - Nom, SIRET, coordonnées                                  │
│  - plan_id → référence au plan actif                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────────────┐
                    │ SUBSCRIPTION  │
                    │  - plan_id    │
                    │  - statut     │
                    │  - limites    │
                    └───────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌─────────────────┐                   ┌─────────────────┐
│ OWNER ADMIN     │                   │ USERS / ADMINS  │
│  - is_owner=true│                   │  - is_owner=false│
│  - created_by   │                   │  - created_by    │
│  - role='regie' │                   │  - role='regie'  │
│  - regie_id     │                   │    ou 'locataire'│
└─────────────────┘                   └─────────────────┘
        ↓                                       ↓
    CRÉATEUR                         INVITÉS PAR OWNER
    (1er compte)                     (quotas plan)
```

### Hiérarchie des rôles

```
admin_jtec (Super Admin)
    └── RÉGIE (Tenant)
            ├── Owner Admin (is_owner=true, role='regie')
            │       └── Peut inviter/gérer users secondaires
            ├── Admin secondaire (is_owner=false, role='regie')
            │       └── Gestion quotidienne (si multi-admin)
            └── Users (role='locataire')
                    └── Consultation tickets/logements
```

### Limites par plan

| Plan | max_logements | max_users | max_admins | max_entreprises |
|------|--------------|-----------|------------|-----------------|
| **Essentiel** | 25 | 2 | 1 | 5 |
| **Pro** | 150 | 5 | 1 | ∞ |
| **Premium** | ∞ | ∞ | ∞ | ∞ |

**Règle métier:** `max_users` inclut `max_admins` (1 admin compte dans les 2 users d'Essentiel)

---

## ✅ STRUCTURE EXISTANTE (Analyse)

### Table `profiles` (actuelle)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  role TEXT CHECK (role IN ('locataire', 'regie', 'entreprise', 'technicien', 'admin_jtec')),
  email TEXT UNIQUE,
  nom, prenom, telephone, adresse...
  
  -- Liaisons tenant
  regie_id UUID,         -- ✅ Lien au tenant
  entreprise_id UUID,
  
  -- Métadonnées
  is_demo BOOLEAN,       -- ✅ Existe déjà
  created_at, updated_at
);
```

**État:**
- ✅ `regie_id` existe → tenant linkage OK
- ✅ `role` existe → distinction regie/locataire OK
- ❌ **MANQUE:** `is_owner` (distinguer owner admin vs admins secondaires)
- ❌ **MANQUE:** `created_by` (tracking qui a créé le user)
- ❌ **MANQUE:** Triggers de vérification quota

### Table `subscriptions` (actuelle)

```sql
CREATE TABLE subscriptions (
  id UUID,
  regie_id UUID,           -- ✅ Lien tenant
  entreprise_id UUID,
  plan_id UUID,            -- ✅ Lien plan
  statut TEXT,
  
  -- Usage tracking (après migration 01)
  usage_users INTEGER,     -- ✅ Compteur users
  usage_admins INTEGER,    -- ✅ Compteur admins
  usage_logements INTEGER,
  ...
);
```

**État:**
- ✅ Lien régie → subscription OK
- ✅ Compteurs usage après migration 01
- ❌ **MANQUE:** Fonction helper `get_subscription_for_regie()`
- ❌ **MANQUE:** Vérification automatique avant INSERT profile

### Fonction `check_plan_limit()` (actuelle)

```sql
CREATE FUNCTION check_plan_limit(subscription_uuid, limit_type, increment)
RETURNS BOOLEAN
```

**État:**
- ✅ Infrastructure existante
- ✅ Vérifie limites immeubles/logements/tickets
- ⚠️ **À ÉTENDRE:** Ajouter vérification users/admins (déjà fait dans 01_plans_update_chf.sql)
- ❌ **MANQUE:** Appel automatique via TRIGGER

---

## 🔧 ADAPTATIONS SaaS NÉCESSAIRES

### A. Colonnes manquantes dans `profiles`

#### 1. `is_owner` (booléen)
- **Usage:** Identifier le créateur principal du tenant (owner admin)
- **Valeur:** `true` pour le 1er compte régie, `false` pour invités
- **Impact:** Permet de distinguer owner vs admins secondaires

#### 2. `created_by` (UUID)
- **Usage:** Tracer qui a invité/créé ce compte
- **Valeur:** `id` du profile qui a créé (NULL pour owner)
- **Impact:** Audit trail + vérification hiérarchique

#### 3. `invited_at` (timestamp)
- **Usage:** Date d'invitation (vs created_at = date d'acceptation)
- **Impact:** Permet de suivre délai d'onboarding

### B. Fonction helper : `get_subscription_for_regie()`

**Besoin:** Récupérer facilement l'abonnement actif d'une régie.

```sql
CREATE FUNCTION get_subscription_for_regie(regie_uuid UUID)
RETURNS subscriptions AS $$
  SELECT * FROM subscriptions 
  WHERE regie_id = regie_uuid 
  AND statut IN ('essai', 'actif')
  ORDER BY created_at DESC 
  LIMIT 1;
$$;
```

**Usage:**
- Dans triggers de vérification quota
- Dans API backend pour afficher limites
- Dans check_plan_limit()

### C. Triggers de vérification automatique

#### 1. Trigger BEFORE INSERT sur `profiles`

**Objectif:** Bloquer création user si quota `max_users` atteint.

```sql
CREATE TRIGGER enforce_plan_limits_on_profile_insert
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION check_profile_quota();
```

**Logique:**
1. Si `role = 'regie'` → vérifier `max_admins`
2. Si `role = 'locataire'` → vérifier `max_users`
3. Si quota atteint → RAISE EXCEPTION
4. Sinon → incrémenter compteur subscription

#### 2. Trigger AFTER INSERT sur `profiles`

**Objectif:** Incrémenter compteurs `usage_users`/`usage_admins` dans subscription.

```sql
CREATE TRIGGER update_subscription_usage_on_profile_insert
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION increment_subscription_usage();
```

#### 3. Trigger AFTER DELETE sur `profiles`

**Objectif:** Décrémenter compteurs lors de suppression user.

```sql
CREATE TRIGGER update_subscription_usage_on_profile_delete
AFTER DELETE ON profiles
FOR EACH ROW
EXECUTE FUNCTION decrement_subscription_usage();
```

### D. Extension `check_plan_limit()` (déjà fait dans 01)

✅ Déjà implémenté dans `01_plans_update_chf.sql` :
- Cas `'users'` → vérifie `max_users`
- Cas `'admins'` → vérifie `max_admins`
- Retourne `true` si limite non atteinte

**Reste à faire:** Appeler automatiquement via triggers.

---

## 📦 SCRIPTS SQL À CRÉER

### Script 1: `02_saas_owner_tracking.sql`

**Objectif:** Ajouter colonnes de tracking owner/creator.

**Contenu:**
- ALTER TABLE profiles ADD COLUMN is_owner
- ALTER TABLE profiles ADD COLUMN created_by
- ALTER TABLE profiles ADD COLUMN invited_at
- Index sur nouvelles colonnes
- Migration données existantes (1er profile par régie = is_owner=true)

### Script 2: `03_saas_subscription_helpers.sql`

**Objectif:** Fonctions helper pour récupérer subscription/vérifier quotas.

**Contenu:**
- CREATE FUNCTION get_subscription_for_regie()
- CREATE FUNCTION get_subscription_for_entreprise()
- CREATE FUNCTION get_current_usage() (compter users/admins actuels)
- CREATE FUNCTION can_add_user() (vérifier avant ajout)

### Script 3: `04_saas_quota_triggers.sql`

**Objectif:** Triggers automatiques de vérification quotas.

**Contenu:**
- CREATE FUNCTION check_profile_quota() (appelée BEFORE INSERT)
- CREATE FUNCTION increment_subscription_usage() (appelée AFTER INSERT)
- CREATE FUNCTION decrement_subscription_usage() (appelée AFTER DELETE)
- CREATE TRIGGER enforce_plan_limits_on_profile_insert
- CREATE TRIGGER update_subscription_usage_on_insert
- CREATE TRIGGER update_subscription_usage_on_delete

### Script 4: (Optionnel) `05_saas_audit_log.sql`

**Objectif:** Logging des actions critiques (ajout/suppression users).

**Contenu:**
- CREATE TABLE audit_users_changes
- Trigger AFTER INSERT/UPDATE/DELETE sur profiles
- Fonction d'audit avec user_id, action, timestamp

---

## 🚀 ORDRE D'EXÉCUTION RECOMMANDÉ

### Phase 1 : Migration plans (DÉJÀ CRÉÉ)
```bash
psql -f supabase/migrations/01_plans_update_chf.sql
```
**Impact:** Ajoute colonnes max_users/max_admins, crée plans CHF, étend check_plan_limit()

### Phase 2 : Tracking owner/creator
```bash
psql -f supabase/migrations/02_saas_owner_tracking.sql
```
**Impact:** Ajoute is_owner, created_by, invited_at dans profiles

### Phase 3 : Fonctions helper subscription
```bash
psql -f supabase/migrations/03_saas_subscription_helpers.sql
```
**Impact:** Fonctions get_subscription_for_regie(), can_add_user(), etc.

### Phase 4 : Triggers automatiques quotas
```bash
psql -f supabase/migrations/04_saas_quota_triggers.sql
```
**Impact:** Vérification automatique + compteurs à jour

### Phase 5 : (Optionnel) Audit log
```bash
psql -f supabase/migrations/05_saas_audit_log.sql
```
**Impact:** Traçabilité actions users

---

## ⚙️ LOGIQUE DE VÉRIFICATION

### Cas 1: Création nouveau user dans régie

```
1. Admin clique "Inviter utilisateur"
2. Backend appelle INSERT INTO profiles
3. ⚡ TRIGGER enforce_plan_limits_on_profile_insert
   ├─ Récupère subscription via get_subscription_for_regie()
   ├─ Appelle check_plan_limit(sub.id, 'users', 1)
   ├─ Si false → RAISE EXCEPTION "Quota max_users atteint"
   └─ Si true → Laisse passer
4. ⚡ TRIGGER update_subscription_usage_on_insert
   └─ UPDATE subscriptions SET usage_users = usage_users + 1
5. User créé ✅
```

### Cas 2: Upgrade de plan Essentiel → Pro

```
1. Admin change de plan dans /compte/abonnement
2. Backend UPDATE subscriptions SET plan_id = <pro_plan_id>
3. Nouvelles limites appliquées:
   - max_users: 2 → 5
   - max_logements: 25 → 150
   - max_entreprises: 5 → ∞
4. Users existants non affectés (déjà créés)
5. Prochains ajouts vérifiés avec nouvelles limites ✅
```

### Cas 3: Downgrade Pro → Essentiel (bloqué si au-delà)

```
1. Admin demande downgrade vers Essentiel
2. Backend vérifie usage actuel:
   - usage_users = 4 > max_users Essentiel (2) ❌
3. API retourne erreur: "Impossible de downgrade, 4 users actifs (max Essentiel: 2)"
4. Admin doit supprimer 2 users avant downgrade
5. Après suppression: downgrade autorisé ✅
```

---

## 🛡️ SÉCURITÉ & ISOLATION

### Isolation tenant (déjà OK avec RLS)

```sql
-- Policy profiles: User ne voit que sa régie
CREATE POLICY profiles_isolation ON profiles
USING (regie_id IN (
  SELECT regie_id FROM profiles WHERE id = auth.uid()
));
```

✅ **Déjà implémenté** dans `10_policies_profiles.sql`

### Hiérarchie owner vs users

**Règle métier:**
- Owner (is_owner=true) peut inviter/supprimer users
- Admins secondaires peuvent gérer (selon permissions)
- Users (locataires) ne peuvent pas inviter

**Vérification:**
```sql
-- Dans trigger check_profile_quota()
IF NEW.created_by IS NOT NULL THEN
  -- Vérifier que creator est owner ou admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = NEW.created_by
    AND role IN ('regie', 'admin_jtec')
    AND (is_owner = true OR role = 'admin_jtec')
  ) THEN
    RAISE EXCEPTION 'Seul le owner peut inviter des utilisateurs';
  END IF;
END IF;
```

---

## 📊 SUIVI DES QUOTAS (Vue admin)

### Vue pour dashboard admin

```sql
CREATE VIEW regie_quota_status AS
SELECT 
  r.id AS regie_id,
  r.nom AS regie_nom,
  p.nom AS plan_nom,
  
  -- Utilisateurs
  s.usage_users AS users_actifs,
  p.max_users AS users_limite,
  CASE WHEN p.max_users IS NULL THEN '∞' 
       ELSE (s.usage_users::float / p.max_users * 100)::text || '%' 
  END AS users_pourcentage,
  
  -- Admins
  s.usage_admins AS admins_actifs,
  p.max_admins AS admins_limite,
  
  -- Logements
  s.usage_logements AS logements_actifs,
  p.max_logements AS logements_limite,
  CASE WHEN p.max_logements IS NULL THEN '∞'
       ELSE (s.usage_logements::float / p.max_logements * 100)::text || '%'
  END AS logements_pourcentage

FROM regies r
JOIN subscriptions s ON s.regie_id = r.id AND s.statut IN ('essai', 'actif')
JOIN plans p ON p.id = s.plan_id;
```

**Usage:**
- Backend appelle cette vue pour afficher quotas dans `/compte/abonnement`
- API retourne `{ users: "3/5 (60%)", logements: "80/150 (53%)" }`

---

## ⚠️ PRÉCAUTIONS

### 1. Migration données existantes

**Problème:** Profiles existants n'ont pas `is_owner`, `created_by`.

**Solution dans 02_saas_owner_tracking.sql:**
```sql
-- Identifier 1er profile par régie = owner
UPDATE profiles p
SET is_owner = true
WHERE id = (
  SELECT id FROM profiles
  WHERE regie_id = p.regie_id
  ORDER BY created_at ASC
  LIMIT 1
);

-- Autres users = is_owner false
UPDATE profiles
SET is_owner = false
WHERE is_owner IS NULL;
```

### 2. Abonnements sans compteurs

**Problème:** Subscriptions existants ont `usage_users = 0` (faux).

**Solution dans 02_saas_owner_tracking.sql:**
```sql
-- Recalculer usage_users/usage_admins depuis profiles
UPDATE subscriptions s
SET 
  usage_users = (
    SELECT COUNT(*) FROM profiles p
    WHERE p.regie_id = s.regie_id
  ),
  usage_admins = (
    SELECT COUNT(*) FROM profiles p
    WHERE p.regie_id = s.regie_id AND p.role = 'regie'
  )
WHERE s.regie_id IS NOT NULL;
```

### 3. Mode DEMO

**Règle:** Comptes DEMO (`is_demo = true`) ne consomment PAS de quotas.

**Implémentation dans triggers:**
```sql
-- Dans check_profile_quota()
IF NEW.is_demo = true THEN
  RETURN NEW; -- Bypass vérification quota
END IF;
```

---

## 🎯 RÉSUMÉ SaaS

| Élément | Statut Actuel | Action Requise |
|---------|--------------|----------------|
| **Tenant = Régie** | ✅ OK | regie_id dans profiles |
| **Subscription → Régie** | ✅ OK | regie_id dans subscriptions |
| **Plans avec limites** | ✅ OK (après 01) | max_users, max_admins ajoutés |
| **Owner vs Users** | ❌ MANQUE | Ajouter is_owner, created_by |
| **Vérification quota** | ⚠️ PARTIEL | Ajouter triggers automatiques |
| **Compteurs usage** | ✅ OK (après 01) | usage_users, usage_admins |
| **Fonctions helper** | ❌ MANQUE | get_subscription_for_regie() |
| **Audit trail** | ❌ OPTIONNEL | Table audit_users_changes |
| **Isolation RLS** | ✅ OK | Policies existantes |

---

## 📂 FICHIERS FOURNIS

1. **ANALYSE_SAAS_MODEL.md** (ce fichier)
   - Schéma logique complet
   - Analyse existant vs cible
   - Plan d'exécution détaillé

2. **02_saas_owner_tracking.sql** (à créer)
   - Colonnes is_owner, created_by, invited_at
   - Migration données existantes
   - Index performance

3. **03_saas_subscription_helpers.sql** (à créer)
   - Fonctions get_subscription_for_regie()
   - Fonction can_add_user()
   - Vue regie_quota_status

4. **04_saas_quota_triggers.sql** (à créer)
   - Triggers BEFORE/AFTER sur profiles
   - Vérification automatique quotas
   - Incrémentation compteurs

**Prêt pour génération des scripts SQL !** 🚀
