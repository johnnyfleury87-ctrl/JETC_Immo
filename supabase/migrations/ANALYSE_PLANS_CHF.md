# 📋 ANALYSE STRUCTURE SUPABASE - COMPATIBILITÉ PLANS CHF

**Date:** 13 décembre 2025  
**Objectif:** Adapter les plans d'abonnement aux nouveaux tarifs CHF sans casser la prod

---

## ✅ STRUCTURE EXISTANTE (État actuel)

### Tables présentes

#### 1. **plans** (`supabase/schema/01_tables.sql` lignes 678-732)
```sql
- id, nom, description, type_entite
- prix_mensuel, prix_annuel, devise (DEFAULT 'EUR')
- periode_essai_jours
- max_immeubles, max_logements, max_locataires
- max_tickets_par_mois, max_missions_par_mois
- max_entreprises_partenaires ✅
- max_techniciens, max_stockage_mb
- features (JSONB), modules payants
- est_actif, est_visible, ordre_affichage
```

#### 2. **subscriptions** (`supabase/schema/01_tables.sql` lignes 746-815)
```sql
- id, regie_id, entreprise_id, plan_id
- statut, dates (début, fin, essai, annulation)
- frequence_paiement, montant_facture, mode_paiement
- usage_immeubles, usage_logements, usage_locataires
- usage_tickets_mois_actuel, usage_missions_mois_actuel
- usage_stockage_mb, date_reset_usage
- historique (JSONB)
```

#### 3. **profiles** (lignes 29-78)
```sql
- id, role, email, nom, prenom
- regie_id, entreprise_id
- Rôles: locataire, regie, entreprise, technicien, admin_jtec
```

#### 4. **regies** (lignes 85-114)
```sql
- id, nom, siret, email, coordonnées
- plan_id, subscription_actif, date_fin_abonnement
```

### Fonction existante

**check_plan_limit()** (lignes 822-884)
- Vérifie les limites: immeubles, logements, locataires, tickets, missions, techniciens
- Retourne `true` si limite non atteinte, `false` sinon
- Gère `NULL = illimité`

### Policies RLS

- **21_policies_plans.sql**: Admin JTEC seul peut créer/modifier, tous peuvent lire plans visibles
- **22_policies_subscriptions.sql**: Régies/entreprises peuvent voir/modifier leur propre abonnement

---

## ⚠️ CE QUI MANQUE (Incompatibilités avec nouveaux plans)

### 1. **Colonnes absentes dans `plans`**

| Colonne manquante | Besoin | Plan concerné |
|-------------------|--------|---------------|
| `max_users` | Limiter nombre total d'utilisateurs | Essentiel (2), Pro (5), Premium (illimité) |
| `max_admins` | Limiter nombre d'admins | Essentiel (1), Pro (1), Premium (illimité) |

**Problème:** Actuellement, aucune colonne ne limite le nombre d'utilisateurs ou d'administrateurs par régie/entreprise.

### 2. **Colonnes absentes dans `subscriptions`**

| Colonne manquante | Besoin | Usage |
|-------------------|--------|-------|
| `usage_users` | Compter utilisateurs actifs | Vérifier limite `max_users` |
| `usage_admins` | Compter admins actifs | Vérifier limite `max_admins` |

**Problème:** Pas de tracking du nombre d'utilisateurs/admins par abonnement.

### 3. **Devise par défaut**

- **Actuel:** `devise TEXT DEFAULT 'EUR'`
- **Attendu:** `devise TEXT DEFAULT 'CHF'`

**Impact:** Faible, mais nécessite mise à jour pour cohérence.

### 4. **Fonction `check_plan_limit()`**

- **Manque:** Vérification des limites `users` et `admins`
- **Manque:** Vérification des limites `entreprises_partenaires`

**Problème:** La fonction ne peut pas bloquer la création d'utilisateurs au-delà de la limite du plan.

---

## 🔧 ADAPTATIONS NÉCESSAIRES

### Modifications SQL requises

#### A. **Ajout colonnes dans `plans`**
```sql
ALTER TABLE plans
ADD COLUMN max_users INTEGER,
ADD COLUMN max_admins INTEGER DEFAULT 1;
```
- **Sécurité:** `max_admins DEFAULT 1` pour éviter multi-admin accidentel
- **Impact:** Aucun sur données existantes (colonnes nullables)

#### B. **Ajout colonnes dans `subscriptions`**
```sql
ALTER TABLE subscriptions
ADD COLUMN usage_users INTEGER DEFAULT 0,
ADD COLUMN usage_admins INTEGER DEFAULT 1;
```
- **Sécurité:** `usage_admins DEFAULT 1` (créateur = premier admin)
- **Impact:** Aucun sur abonnements existants

#### C. **Mise à jour devise par défaut**
```sql
ALTER TABLE plans
ALTER COLUMN devise SET DEFAULT 'CHF';
```
- **Impact:** Plans futurs créés en CHF par défaut
- **Existants:** Non modifiés (nécessite UPDATE manuel si besoin)

#### D. **Extension fonction `check_plan_limit()`**
```sql
CREATE OR REPLACE FUNCTION check_plan_limit(...)
-- Ajouter CASE pour 'users', 'admins', 'entreprises_partenaires'
```
- **Impact:** Fonction remplacée, compatible ascendant

#### E. **Création/Mise à jour des plans Essentiel, Pro, Premium**
```sql
INSERT INTO plans (...) VALUES (...) ON CONFLICT (nom) DO UPDATE SET ...;
```
- **Impact:** 
  - Plans existants mis à jour si même nom
  - Nouveaux plans créés si absents
  - Anciens plans peuvent être désactivés (`est_actif = false`)

---

## 📦 CE QUI EST DÉJÀ COMPATIBLE

✅ **Structure table `plans`:**
- `max_logements` ✓
- `max_entreprises_partenaires` ✓ (pour limiter les 5 entreprises du plan Essentiel)
- `prix_mensuel`, `prix_annuel` ✓
- `periode_essai_jours` ✓

✅ **Structure table `subscriptions`:**
- `usage_logements` ✓ (tracking actuel)
- `regie_id`, `entreprise_id` ✓ (séparation entités)
- `statut` ✓ (essai, actif, suspendu, annulé, expiré)

✅ **Policies RLS:**
- Isolation régie/entreprise ✓
- Admin JTEC peut tout gérer ✓
- Utilisateurs authentifiés voient plans visibles ✓

✅ **Fonction `check_plan_limit()`:**
- Infrastructure existante ✓
- Logique `NULL = illimité` ✓
- Extensible avec nouveaux `CASE` ✓

---

## 🚀 PLAN D'EXÉCUTION RECOMMANDÉ

### Ordre des opérations

**Étape 1:** Ajouter colonnes manquantes (non destructif)
```bash
# Fichier: supabase/migrations/01_plans_update_chf.sql (CRÉÉ)
psql -U postgres -d jetc_immo -f supabase/migrations/01_plans_update_chf.sql
```

**Étape 2:** Mettre à jour la fonction `check_plan_limit()` (remplace existante)
```bash
# Inclus dans 01_plans_update_chf.sql
```

**Étape 3:** Créer/Mettre à jour les plans Essentiel, Pro, Premium (upsert)
```bash
# Inclus dans 01_plans_update_chf.sql
```

**Étape 4:** Vérifier résultats
```sql
-- Vérifier plans créés
SELECT nom, prix_mensuel, devise, max_logements, max_users, max_admins 
FROM plans 
WHERE est_actif = true;

-- Vérifier structure
\d plans
\d subscriptions
```

**Étape 5:** (Optionnel) Migrer abonnements existants
```sql
-- Si abonnements existants doivent passer en CHF
UPDATE subscriptions s
SET montant_facture = (
  SELECT prix_mensuel FROM plans p WHERE p.id = s.plan_id
)
WHERE statut = 'actif';
```

---

## 📄 FICHIERS FOURNIS

### 1. **Migration SQL complète**
**Fichier:** `supabase/migrations/01_plans_update_chf.sql`

**Contenu:**
- Ajout colonnes `max_users`, `max_admins` dans `plans`
- Ajout colonnes `usage_users`, `usage_admins` dans `subscriptions`
- Mise à jour devise par défaut (CHF)
- Mise à jour fonction `check_plan_limit()` (inclut users/admins)
- Création plans Essentiel (49 CHF), Pro (99 CHF), Premium (199 CHF)
- Index performance sur nouvelles colonnes
- Vérifications post-migration automatiques

**Exécution:**
```bash
cd /workspaces/JETC_Immo
psql -U postgres -d votre_base -f supabase/migrations/01_plans_update_chf.sql
```

---

## ⚠️ PRÉCAUTIONS

### 1. **Backup obligatoire avant migration**
```bash
pg_dump -U postgres jetc_immo > backup_pre_migration_$(date +%Y%m%d).sql
```

### 2. **Test en DEV d'abord**
- Ne JAMAIS exécuter directement en PROD
- Tester sur base de dev/staging
- Vérifier les `SELECT` de validation

### 3. **Abonnements existants**
- Les colonnes ajoutées sont `NULL` ou `DEFAULT 0/1`
- **Pas de casse des abonnements actifs**
- Mettre à jour `usage_users`/`usage_admins` manuellement si nécessaire:
```sql
UPDATE subscriptions s
SET usage_users = (
  SELECT COUNT(*) FROM profiles p 
  WHERE p.regie_id = s.regie_id OR p.entreprise_id = s.entreprise_id
),
usage_admins = (
  SELECT COUNT(*) FROM profiles p 
  WHERE (p.regie_id = s.regie_id OR p.entreprise_id = s.entreprise_id)
  AND p.role IN ('regie', 'entreprise') -- Rôles admin
);
```

### 4. **Plans existants**
- Script désactive anciens plans (`est_actif = false`)
- Utilise `ON CONFLICT (nom) DO UPDATE` → sûr si plans "Essentiel/Pro/Premium" existent déjà
- Abonnements actifs continuent de fonctionner (lien `plan_id` préservé)

---

## 🎯 RÉSUMÉ OK / À FAIRE

| Élément | Statut | Action |
|---------|--------|--------|
| **Structure plans existante** | ✅ OK | Compatible à 90% |
| **Colonne max_users** | ❌ MANQUANT | ALTER TABLE plans (script fourni) |
| **Colonne max_admins** | ❌ MANQUANT | ALTER TABLE plans (script fourni) |
| **Tracking usage_users** | ❌ MANQUANT | ALTER TABLE subscriptions (script fourni) |
| **Tracking usage_admins** | ❌ MANQUANT | ALTER TABLE subscriptions (script fourni) |
| **Devise CHF par défaut** | ❌ À MODIFIER | ALTER COLUMN devise (script fourni) |
| **Fonction check_plan_limit()** | ⚠️ INCOMPLET | CREATE OR REPLACE (script fourni) |
| **Plans Essentiel/Pro/Premium** | ❌ À CRÉER | INSERT ... ON CONFLICT (script fourni) |
| **Policies RLS** | ✅ OK | Aucune modification nécessaire |
| **Backup avant migration** | ⚠️ REQUIS | pg_dump avant exécution |

---

## 📌 NOTES FINALES

1. **Aucune modification des policies** nécessaire → isolation déjà correcte
2. **Aucun refactor global** → ajout incrémental uniquement
3. **Aucune modification frontend** requise → backend only
4. **Priorité données** respectée → compatibilité ascendante garantie
5. **Script idempotent** → peut être exécuté plusieurs fois sans casse

**Prêt pour exécution:** Le fichier `supabase/migrations/01_plans_update_chf.sql` contient tout le SQL nécessaire dans l'ordre correct.
