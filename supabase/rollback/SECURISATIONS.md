# 🔒 SÉCURISATIONS ROLLBACK PRÉ-SAAS

## 📋 Modifications apportées

**Date** : 16 décembre 2025  
**Commit** : `c8ed52d`  
**Objectif** : Sécuriser le processus de rollback avant exécution

---

## ✅ 1. Interdiction force push sur main

### Modification
- **Fichier** : `supabase/rollback/README.md`
- **Section** : Bascule vers `main`

### Avant
```bash
git reset --hard reset/pre-saas-stable
git push origin main --force-with-lease
```

### Après
```bash
# 1. Créer Pull Request (RECOMMANDÉ)
# Sur GitHub : New PR
# base: main ← compare: reset/pre-saas-stable
# Merger après review

# OU en local si urgence (NON RECOMMANDÉ)
git merge reset/pre-saas-stable
git push origin main
```

### Justification
- ✅ Évite destruction accidentelle de l'historique
- ✅ Permet review avant merge
- ✅ Traçabilité complète
- ✅ Possibilité de rollback via revert

---

## ✅ 2. Audit enrichi avec dépendances

### Modification
- **Fichier** : `supabase/rollback/01_audit_saas_objects.sql`
- **Sections ajoutées** : I, J, K, L, M (5 nouvelles sections)

### Nouvelles sections

#### **Section I : Vues dépendantes des colonnes owner**
```sql
SELECT DISTINCT
  v.table_schema,
  v.table_name AS view_name,
  'regies.owner_id ou entreprises.owner_id/created_by' AS depends_on
FROM information_schema.views v
WHERE v.table_schema = 'public'
AND (
  v.view_definition LIKE '%owner_id%' OR
  v.view_definition LIKE '%created_by%'
)
```

**Interprétation** :
- Si **0 ligne** → ✅ Aucune vue ne dépend de owner_id/created_by
- Si **≥1 ligne** → ⚠️ Vue(s) référence(nt) ces colonnes → Ne PAS DROP COLUMN

#### **Section J : Fonctions référençant owner_id/created_by**
```sql
SELECT 
  n.nspname AS schema,
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS definition_preview
FROM pg_proc p
WHERE pg_get_functiondef(p.oid) LIKE '%owner_id%'
   OR pg_get_functiondef(p.oid) LIKE '%created_by%'
```

**Interprétation** :
- Si **0 ligne** → ✅ Aucune fonction ne référence ces colonnes
- Si **≥1 ligne** → ⚠️ Fonction(s) à supprimer AVANT DROP COLUMN

#### **Section K : Triggers utilisant owner_id/created_by**
```sql
SELECT 
  event_object_table,
  trigger_name,
  action_statement
FROM information_schema.triggers
WHERE action_statement LIKE '%owner_id%'
   OR action_statement LIKE '%created_by%'
```

**Interprétation** :
- Si **0 ligne** → ✅ Aucun trigger ne touche ces colonnes
- Si **≥1 ligne** → ⚠️ Trigger(s) à supprimer dans section 3 du script 02

#### **Section L : Foreign keys sur colonnes owner**
```sql
SELECT
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
WHERE tc.constraint_type = 'FOREIGN KEY'
AND kcu.column_name IN ('owner_id', 'created_by')
```

**Interprétation** :
- Si **0 ligne** → ✅ Aucune FK, DROP COLUMN safe
- Si **≥1 ligne** → ❌ CRITIQUE - Ne JAMAIS DROP COLUMN avec FK active

#### **Section M : Index sur colonnes owner**
```sql
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE indexdef LIKE '%owner_id%' OR indexdef LIKE '%created_by%'
```

**Interprétation** :
- Si **0 ligne** → ✅ Pas d'index spécifique
- Si **≥1 ligne** → ℹ️ Index seront supprimés automatiquement avec DROP COLUMN CASCADE

### Résumé enrichi

Le résumé final affiche maintenant :
```
Tables SaaS trouvées                  | 3
Fonctions SaaS trouvées               | 12
Triggers SaaS trouvés                 | 8
Policies RLS SaaS trouvées            | 15
Colonnes owner trouvées               | 4
Dépendances colonnes owner (vues)     | ?  ← NOUVEAU
Dépendances colonnes owner (fonctions)| ?  ← NOUVEAU
Foreign keys sur colonnes owner       | ?  ← NOUVEAU
```

**Règle de décision** :
- Si **TOUTES** les dépendances = 0 → Section 5 du script 02 peut être activée
- Si **AU MOINS 1** dépendance > 0 → Section 5 du script 02 DOIT rester commentée

---

## ✅ 3. Rollback SQL version SAFE

### Modification
- **Fichier** : `supabase/rollback/02_rollback_pre_saas.sql`
- **Section** : Section 5 réécrite

### Avant
```sql
-- =====================================================
-- SECTION 5 : SUPPRESSION COLONNES OWNER TRACKING
-- =====================================================

ALTER TABLE public.regies DROP COLUMN IF EXISTS owner_id CASCADE;
ALTER TABLE public.regies DROP COLUMN IF EXISTS created_by CASCADE;
ALTER TABLE public.entreprises DROP COLUMN IF EXISTS owner_id CASCADE;
ALTER TABLE public.entreprises DROP COLUMN IF EXISTS created_by CASCADE;
```
⚠️ **Problème** : Exécuté systématiquement, peut casser si dépendances

### Après
```sql
-- =====================================================
-- SECTION 5 : SUPPRESSION COLONNES OWNER TRACKING (OPTIONNEL)
-- =====================================================
-- ⚠️ CETTE SECTION EST DÉSACTIVÉE PAR DÉFAUT

-- Vérification préalable automatique
DO $$
DECLARE dep_count INTEGER;
BEGIN
  -- Vérifier vues dépendantes
  SELECT COUNT(DISTINCT v.table_name) INTO dep_count
  FROM information_schema.views v
  WHERE (v.view_definition LIKE '%owner_id%' OR v.view_definition LIKE '%created_by%');
  
  IF dep_count > 0 THEN
    RAISE NOTICE '⚠️ ATTENTION : % vue(s) référence(nt) owner_id/created_by', dep_count;
    RAISE NOTICE '→ Section 5 (DROP COLUMN) doit rester commentée';
  END IF;
  
  -- Vérifier fonctions dépendantes
  -- ...
  
  -- Vérifier foreign keys
  -- ...
END $$;

-- =====================================================
-- SECTION 5A : DROP COLUMN - DÉSACTIVÉ PAR DÉFAUT
-- =====================================================
-- DÉCOMMENTER UNIQUEMENT SI AUDIT CONFIRME 0 DÉPENDANCE
-- 
-- -- ALTER TABLE public.regies DROP COLUMN IF EXISTS owner_id CASCADE;
-- -- ALTER TABLE public.regies DROP COLUMN IF EXISTS created_by CASCADE;
-- -- ALTER TABLE public.entreprises DROP COLUMN IF EXISTS owner_id CASCADE;
-- -- ALTER TABLE public.entreprises DROP COLUMN IF EXISTS created_by CASCADE;
```

### Améliorations

#### 1. Check automatique (DO $$ block)
- Exécuté **avant** toute suppression
- Compte les dépendances (vues, fonctions, FK)
- Affiche warnings `⚠️ ATTENTION` si dépendances trouvées
- N'empêche pas l'exécution mais alerte l'utilisateur

#### 2. Section 5A commentée par défaut
- Les `ALTER TABLE DROP COLUMN` sont **commentés**
- Impossible d'exécuter accidentellement
- Nécessite action manuelle pour activer

#### 3. Instructions claires
```sql
-- AVANT D'ACTIVER CETTE SECTION :
-- 1. Exécuter le script 01_audit_saas_objects.sql
-- 2. Vérifier les sections I, J, K, L, M (dépendances)
-- 3. Si dépendances trouvées → NE PAS activer cette section
-- 4. Si 0 dépendance → décommenter les lignes ci-dessous
```

#### 4. Idempotence garantie
- Utilise `IF EXISTS` partout
- Utilise `CASCADE` pour supprimer dépendances automatiquement (si activé)
- Peut être réexécuté sans erreur

---

## ✅ 4. Plan de test automatisé (Sentinelles)

### Nouveau fichier
- **Fichier** : `supabase/rollback/TEST_SENTINEL.md`
- **Contenu** : 5 tests manuels critiques + grille de résultats

### Structure du document

#### 1. Pré-requis
- [ ] Script 01 (audit) exécuté
- [ ] Script 02 (rollback) exécuté sans erreur
- [ ] Script 03 (vérification) : tous tests ✅
- [ ] Logs Supabase propres

#### 2. Les 5 tests sentinelles

| # | Test | Durée | Objectif |
|---|------|-------|----------|
| 1 | Mode DEMO | 2 min | Vérifier accès DEMO sans auth |
| 2 | Login standard | 2 min | Vérifier auth + redirection dashboard |
| 3 | Dashboard Admin | 2 min | Vérifier admin basique fonctionne |
| 4 | Dashboard métier | 2 min | Vérifier pages métiers OK |
| 5 | Création ticket | 2 min | Vérifier écriture DB fonctionne |

**Durée totale** : ~10 minutes

#### 3. Grille de résultats
```
| Test | Résultat | Temps | Notes |
|------|----------|-------|-------|
| 1. Mode DEMO | ⬜ ✅ / ❌ | __min | |
| 2. Login standard | ⬜ ✅ / ❌ | __min | |
| 3. Dashboard Admin | ⬜ ✅ / ❌ | __min | |
| 4. Dashboard Régie | ⬜ ✅ / ❌ | __min | |
| 5. Création ticket | ⬜ ✅ / ❌ | __min | |

Statut global : ⬜ ✅ PASS / ⬜ ⚠️ PARTIEL / ⬜ ❌ FAIL
```

#### 4. Critères de validation

**PASS (5/5 tests ✅)**
- Tous les tests passent
- Aucune erreur 500 dans logs
- Aucune référence SaaS dans erreurs
- **→ Rollback validé, prêt pour merge**

**PARTIEL (3-4 tests ✅)**
- Fonctionnalités critiques OK
- Erreurs mineures non-bloquantes
- **→ Corriger erreurs mineures avant merge**

**FAIL (≤2 tests ✅)**
- Erreurs critiques bloquantes
- Application inutilisable
- **→ Ne PAS merger, investiguer avec script 03**

#### 5. Diagnostic rapide

Chaque type d'erreur a sa section de troubleshooting :
- "column owner_id does not exist"
- "table adhesion_requests does not exist"
- "policy ... does not exist"
- Erreur 401/403 systématique

---

## 📊 ORDRE D'EXÉCUTION SÉCURISÉ

### Phase 1 : Audit (lecture seule)
```
1. Exécuter 01_audit_saas_objects.sql
2. Analyser sections A-M (13 sections)
3. Focus sur sections I-M (dépendances owner)
4. Noter résumé final :
   - Colonnes owner : X
   - Dépendances vues : Y
   - Dépendances fonctions : Z
   - Foreign keys : W
5. DÉCISION : Section 5 activable ? (Y=0 ET Z=0 ET W=0)
```

### Phase 2 : Rollback (destructif)
```
1. Si décision Phase 1 = OUI → Décommenter section 5A
2. Si décision Phase 1 = NON → Laisser section 5A commentée
3. Exécuter 02_rollback_pre_saas.sql
4. Vérifier messages DO $$ (warnings dépendances)
5. Vérifier message COMMIT final
```

### Phase 3 : Vérification SQL
```
1. Exécuter 03_verification_post_rollback.sql
2. Vérifier tous tests ✅
3. Si section 5A activée : vérifier TEST 5 (colonnes owner = 0)
4. Si section 5A commentée : ignorer TEST 5 (colonnes owner restent)
```

### Phase 4 : Tests sentinelles
```
1. Ouvrir TEST_SENTINEL.md
2. Exécuter les 5 tests dans l'ordre
3. Remplir grille de résultats
4. Déterminer statut : PASS / PARTIEL / FAIL
5. Si FAIL : revenir à Phase 3 pour investigation
```

### Phase 5 : Merge (si PASS ou PARTIEL acceptable)
```
1. GitHub : Créer Pull Request
2. Titre : "Rollback pré-SaaS - État stable fde1dae"
3. Description : Copier résultats TEST_SENTINEL.md
4. Review (optionnel mais recommandé)
5. Merge dans main
6. Tag : v1.0-pre-saas
7. Vérifier déploiement Vercel
```

---

## 🎯 AVANTAGES DES SÉCURISATIONS

| Sécurisation | Risque évité |
|--------------|--------------|
| **Pas de force push** | Perte historique Git, impossibilité rollback |
| **Audit dépendances** | Cascade d'erreurs SQL, vues cassées, FK violées |
| **Section 5 commentée** | DROP COLUMN accidentel, perte données |
| **Tests sentinelles** | Déploiement app cassée, utilisateurs bloqués |

---

## 📝 CHECKLIST FINALE AVANT EXÉCUTION

- [ ] Scripts 01-02-03 relus et compris
- [ ] TEST_SENTINEL.md imprimé ou ouvert à côté
- [ ] Backup Supabase créé
- [ ] Aucune transaction critique en cours
- [ ] Décision prise sur section 5 (activée ou commentée)
- [ ] Fenêtre Supabase Dashboard ouverte (SQL Editor + Logs)
- [ ] Fenêtre application prod ouverte (pour tests sentinelles)
- [ ] Temps disponible : 30-45 min (audit → tests)

---

**Date de sécurisation** : 16 décembre 2025  
**Commit** : `c8ed52d`  
**Branche** : `reset/pre-saas-stable`  
**Statut** : ✅ Prêt pour exécution sécurisée
