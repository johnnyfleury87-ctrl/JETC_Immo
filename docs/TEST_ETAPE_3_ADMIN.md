# 🧪 TEST ÉTAPE 3 – ADMIN DASHBOARD JETC

## 🎯 OBJECTIF
Vérifier que la page `/admin/jetc` :
1. Est accessible UNIQUEMENT pour les profils `admin_jtec`
2. Affiche la liste des demandes depuis `adhesion_requests_summary`
3. Permet de filtrer par statut (pending/approved/rejected/all)
4. Affiche les détails d'une demande
5. Bloque l'accès aux non-admins

---

## 📋 PRÉ-REQUIS

### 1. Migration SQL exécutée

Vérifier que la migration 05 est appliquée :

```sql
-- Dans Supabase SQL Editor
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'adhesion_requests';
```

**Résultat attendu :** 1 ligne (table existe)

### 2. Profil admin_jtec existe

Créer un profil admin_jtec si absent :

```sql
-- Vérifier si admin_jtec existe
SELECT id, email, role FROM profiles WHERE role = 'admin_jtec';

-- Si aucun résultat, créer un admin JETC :
-- Option A : Via Supabase Auth Dashboard
--   1. Aller dans Authentication > Users
--   2. Créer un user : admin@jetcimmo.ch
--   3. Copier son UUID

-- Option B : Via SQL (nécessite auth.users existant)
-- Exemple avec un user existant :
UPDATE profiles 
SET role = 'admin_jtec' 
WHERE email = 'VOTRE_EMAIL@example.com';
```

**⚠️ IMPORTANT :** Vous devez avoir un compte avec `role = 'admin_jtec'` pour tester.

### 3. Données de test (optionnel)

Insérer une demande fictive pour tester l'affichage :

```sql
-- Insérer demande pending
INSERT INTO adhesion_requests (
  plan_requested,
  regie_name,
  city,
  logements_estimes,
  owner_firstname,
  owner_lastname,
  owner_email,
  owner_phone,
  status
) VALUES (
  'Pro',
  'Test Régie SA',
  'Genève',
  50,
  'Jean',
  'Dupont',
  'jean.dupont.test@example.com',
  '+41 22 123 45 67',
  'pending'
);

-- Vérifier insertion
SELECT * FROM adhesion_requests ORDER BY created_at DESC LIMIT 1;
```

---

## 🧪 TESTS MANUELS

### Test 1 : Accès refusé (non-admin)

**Contexte :** Utilisateur NON admin_jtec ou non connecté

**Actions :**
1. Se déconnecter ou se connecter avec un compte `regie`/`entreprise`
2. Aller sur `http://localhost:3000/admin/jetc`

**Résultat attendu :**
- ✅ Alert : "Accès refusé. Cette page est réservée aux administrateurs JETC."
- ✅ Redirection vers `/` (homepage)

**Vérification :**
```javascript
// Console navigateur : vérifier useEffect checkAdminAccess()
// Si role !== 'admin_jtec' → alert + router.push("/")
```

---

### Test 2 : Accès autorisé (admin_jtec)

**Contexte :** Utilisateur avec `role = 'admin_jtec'`

**Actions :**
1. Se connecter avec compte admin_jtec
2. Aller sur `http://localhost:3000/admin/jetc`

**Résultat attendu :**
- ✅ Page s'affiche (pas de redirection)
- ✅ Header : "🏢 JETC IMMO - Administration"
- ✅ Titre : "Demandes d'adhésion"
- ✅ 4 filtres visibles :
  * En attente (orange)
  * Validées (vert)
  * Rejetées (rouge)
  * Toutes (gris)

**Vérification :**
```javascript
// Console navigateur
profile.role // → "admin_jtec"
```

---

### Test 3 : Filtres statut

**Contexte :** Connecté en admin_jtec

**Actions :**
1. Cliquer sur filtre "En attente"
2. Vérifier que seules les demandes `status = 'pending'` s'affichent
3. Cliquer sur filtre "Validées"
4. Vérifier que seules les demandes `status = 'approved'` s'affichent
5. Cliquer sur filtre "Toutes"
6. Vérifier que TOUTES les demandes s'affichent

**Résultat attendu :**
- ✅ Filtre actif a bordure colorée
- ✅ Requête Supabase change : `.eq("status", filter)` si filter !== "all"
- ✅ Nombre de lignes dans le tableau correspond au filtre

**Vérification console :**
```javascript
// Network tab : vérifier requête Supabase
// URL : .../adhesion_requests_summary?...&status=eq.pending
```

---

### Test 4 : Affichage liste demandes

**Contexte :** Demande de test insérée (voir Pré-requis §3)

**Colonnes visibles dans le tableau :**
- ✅ Date demande (format FR : JJ/MM/YYYY HH:MM)
- ✅ Régie (nom + ville)
- ✅ Plan (badge coloré : Essentiel/Pro/Premium)
- ✅ Contact (nom + email)
- ✅ Logements (avec ⚠️ si dépasse limite plan)
- ✅ Statut (badge coloré)
- ✅ Actions (boutons Valider/Rejeter pour pending)

**Exemple demande affichée :**
```
| Date        | Régie             | Plan | Contact              | Logements | Statut     | Actions          |
|-------------|-------------------|------|----------------------|-----------|------------|------------------|
| 13/12 15:30 | Test Régie SA     | Pro  | Jean Dupont          | 50        | En attente | ✅ Valider       |
|             | Genève            |      | jean.dupont@test.ch  |           |            | ❌ Rejeter       |
```

**Vérification :**
- Si `logements_estimes > plan_max_logements` → Afficher "⚠️ 50 (limite: 25)"
- Badge statut :
  * pending → orange "En attente"
  * approved → vert "Validée"
  * rejected → rouge "Rejetée"

---

### Test 5 : Détails demande (modal)

**Contexte :** Demande validée ou rejetée existe

**Actions :**
1. Cliquer sur une demande `approved` ou `rejected`
2. Modal "Détails de la demande" s'ouvre

**Résultat attendu (demande approved) :**
```
📋 Détails de la demande

Régie : Test Régie SA
Ville : Genève
Plan : Pro (99 CHF/mois)
Contact : Jean Dupont
Email : jean.dupont@test.ch
Téléphone : +41 22 123 45 67

Estimations :
- Logements : 50
- Admins : 1
- Users : 3

Statut : ✅ Validée
Validée par : Admin JETC (vous)
Date validation : 13/12/2025 à 15:45

Motivation :
"Test workflow adhésion"

Entités créées :
- Régie ID : abc-123-def
- Subscription ID : xyz-789-ghi
- Owner Profile ID : mno-456-pqr
```

**Vérification :**
- ✅ Toutes les données de la demande affichées
- ✅ Infos validateur (validated_by_name)
- ✅ IDs des entités créées (si approved)
- ✅ Raison rejet (si rejected)

---

### Test 6 : Compteurs filtres

**Contexte :** Plusieurs demandes avec statuts différents

**Résultat attendu :**
```
[En attente (3)] [Validées (5)] [Rejetées (1)] [Toutes (9)]
```

**Vérification :**
- ✅ Badge filtre affiche le COUNT du statut
- ✅ "Toutes" affiche le total

---

## 🔍 VÉRIFICATIONS BASE DE DONNÉES

### Vérifier vue adhesion_requests_summary

```sql
-- La vue doit retourner toutes les colonnes nécessaires
SELECT 
  id, 
  regie_name, 
  city, 
  plan_requested, 
  owner_name, 
  owner_email, 
  status,
  created_at,
  validated_at,
  validated_by_name,
  plan_prix,
  over_logements_limit,
  over_users_limit
FROM adhesion_requests_summary
ORDER BY created_at DESC
LIMIT 5;
```

**Résultat attendu :**
- ✅ Toutes les colonnes présentes
- ✅ `owner_name` = concatenation prénom + nom
- ✅ `validated_by_name` = nom admin si validée/rejetée
- ✅ `over_logements_limit` = boolean (true si estimations > limite plan)

### Vérifier RLS policies

```sql
-- Vérifier policies adhesion_requests
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'adhesion_requests';
```

**Résultat attendu :**
```
policyname                              | cmd    | qual
----------------------------------------|--------|------
public_insert_adhesion_request          | INSERT | true
admin_jtec_view_all_adhesion_requests   | SELECT | EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin_jtec')
admin_jtec_update_adhesion_requests     | UPDATE | EXISTS (...)
admin_jtec_delete_adhesion_requests     | DELETE | EXISTS (...)
```

---

## 🚨 CAS D'ERREUR

### Erreur 1 : "Failed to fetch adhesion_requests_summary"

**Cause :** Vue n'existe pas ou RLS bloque

**Solution :**
```sql
-- Recréer la vue
DROP VIEW IF EXISTS adhesion_requests_summary;
-- Puis copier-coller la création depuis 05_adhesion_requests.sql
```

### Erreur 2 : "Table adhesion_requests does not exist"

**Cause :** Migration 05 non exécutée

**Solution :**
```bash
# Exécuter migration
psql $DATABASE_URL -f supabase/migrations/05_adhesion_requests.sql
```

### Erreur 3 : Liste vide alors que demandes existent

**Cause :** RLS bloque (profile.role !== 'admin_jtec')

**Solution :**
```sql
-- Vérifier role du user connecté
SELECT id, email, role FROM profiles WHERE id = auth.uid();

-- Si role != admin_jtec, modifier :
UPDATE profiles SET role = 'admin_jtec' WHERE id = auth.uid();
```

### Erreur 4 : "Cannot read property 'role' of null"

**Cause :** `getProfile()` retourne null (user non connecté ou profile inexistant)

**Solution :**
1. Se reconnecter
2. Vérifier que profile existe dans DB pour ce auth.uid()

---

## ✅ CHECKLIST VALIDATION ÉTAPE 3

### Accès
- [ ] ✅ Non-admin → Accès refusé + redirection
- [ ] ✅ Admin_jtec → Page s'affiche

### Affichage
- [ ] ✅ Titre "Demandes d'adhésion" visible
- [ ] ✅ 4 filtres affichés avec compteurs
- [ ] ✅ Tableau avec colonnes : Date, Régie, Plan, Contact, Logements, Statut, Actions
- [ ] ✅ Demandes triées par date DESC

### Filtres
- [ ] ✅ Cliquer "En attente" → Affiche uniquement status=pending
- [ ] ✅ Cliquer "Validées" → Affiche uniquement status=approved
- [ ] ✅ Cliquer "Rejetées" → Affiche uniquement status=rejected
- [ ] ✅ Cliquer "Toutes" → Affiche tous les statuts

### Détails
- [ ] ✅ Cliquer sur demande approved/rejected → Modal détails s'ouvre
- [ ] ✅ Modal affiche toutes les infos + entités créées

### Sécurité
- [ ] ✅ RLS empêche SELECT si role != admin_jtec
- [ ] ✅ Vue adhesion_requests_summary retourne données si admin_jtec

---

## 🎯 RÉSULTAT ÉTAPE 3

**Si tous les tests passent :**
✅ ÉTAPE 3 VALIDÉE : Dashboard admin JETC opérationnel

**Prochaine étape :**
ÉTAPE 4 – API Backend (Validation/Rejet avec création régie + owner + subscription)

---

## 📝 NOTES

- ⚠️ Les boutons "Valider" et "Rejeter" sont visibles mais **non fonctionnels** à ce stade
- Ils seront implémentés à l'ÉTAPE 4 (Backend API)
- Pour l'instant, vérifier uniquement l'affichage et les filtres

---

**Date test :** _______________  
**Testeur :** _______________  
**Statut :** [ ] ✅ Validé  [ ] ❌ Échec (préciser erreur)
