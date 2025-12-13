# 🧪 TEST ÉTAPE 4 – BACKEND API (VALIDATION/REJET)

## 🎯 OBJECTIF
Tester les APIs de validation et rejet avec création complète des entités.

---

## ⚙️ CONFIGURATION REQUISE

### 1. Variable d'environnement SUPABASE_SERVICE_ROLE_KEY

Les APIs utilisent `supabase.auth.admin.createUser()` qui nécessite la clé service (admin).

**Action :**
1. Aller sur Supabase Dashboard → Votre projet
2. Settings → API
3. Copier `service_role` key (secret)
4. Ajouter dans `.env.local` :

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# ⚠️ SECRET - Ne JAMAIS commit
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # ← COLLER ICI

# URL pour magic links
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Redémarrer le serveur après ajout de la variable

```bash
# Arrêter le serveur (Ctrl+C)
npm run dev
```

---

## 🧪 TEST 1 : API VALIDATION (COMPLET)

### Prérequis
- [ ] Migration 05 exécutée
- [ ] Admin_jtec créé
- [ ] Demande pending existe (via test_etape_3_data.sql)

### Test via cURL

```bash
# Récupérer l'ID de la demande pending
DEMANDE_ID=$(psql $DATABASE_URL -t -c "SELECT id FROM adhesion_requests WHERE status='pending' LIMIT 1;")

# Récupérer l'ID admin_jtec
ADMIN_ID=$(psql $DATABASE_URL -t -c "SELECT id FROM profiles WHERE role='admin_jtec' LIMIT 1;")

# Appeler l'API validation
curl -X POST http://localhost:3000/api/admin/validate-adhesion \
  -H "Content-Type: application/json" \
  -d "{
    \"requestId\": \"$DEMANDE_ID\",
    \"adminId\": \"$ADMIN_ID\"
  }"
```

### Résultat attendu (200 OK)

```json
{
  "success": true,
  "message": "Demande validée avec succès",
  "regie_id": "abc-123-def-456",
  "subscription_id": "xyz-789-ghi-012",
  "profile_id": "mno-345-pqr-678",
  "owner_email": "jean.dupont.test@example.com",
  "magic_link": "https://votre-projet.supabase.co/auth/v1/verify?token=..."
}
```

### Vérifications base de données

```sql
-- 1. Vérifier régie créée
SELECT id, nom, ville, email, plan_id, subscription_actif, is_demo
FROM regies
WHERE email = 'jean.dupont.test@example.com';
-- Résultat attendu : 1 ligne, is_demo = false, subscription_actif = true

-- 2. Vérifier subscription créée
SELECT 
  id, 
  regie_id, 
  plan_id, 
  statut, 
  date_fin_essai,
  usage_users,
  usage_admins
FROM subscriptions
WHERE regie_id = (SELECT id FROM regies WHERE email = 'jean.dupont.test@example.com');
-- Résultat attendu : statut = 'essai', date_fin_essai = today + 14 jours, usage_users = 1

-- 3. Vérifier auth.users créé
SELECT id, email, email_confirmed_at, user_metadata
FROM auth.users
WHERE email = 'jean.dupont.test@example.com';
-- Résultat attendu : email_confirmed_at NOT NULL (pré-confirmé)

-- 4. Vérifier profile owner créé
SELECT 
  id, 
  role, 
  email, 
  nom, 
  prenom, 
  regie_id, 
  is_owner, 
  created_by
FROM profiles
WHERE email = 'jean.dupont.test@example.com';
-- Résultat attendu : role = 'regie', is_owner = true, created_by = NULL

-- 5. Vérifier demande marquée approved
SELECT 
  status, 
  validated_at, 
  validated_by,
  created_regie_id,
  created_subscription_id,
  created_owner_profile_id
FROM adhesion_requests
WHERE owner_email = 'jean.dupont.test@example.com';
-- Résultat attendu : status = 'approved', tous les created_*_id remplis
```

### Test du magic link

1. Copier le `magic_link` retourné par l'API
2. Ouvrir dans navigateur (en navigation privée)
3. Devrait rediriger vers `/regie/dashboard` avec authentification automatique

✅ **VALIDÉ** si :
- Régie créée
- Subscription créée (essai 14 jours)
- Auth.user créé (email confirmé)
- Profile owner créé (is_owner = true)
- Demande marquée approved
- Magic link fonctionne

---

## 🧪 TEST 2 : API REJET

### Test via cURL

```bash
# Récupérer une autre demande pending
DEMANDE_ID=$(psql $DATABASE_URL -t -c "SELECT id FROM adhesion_requests WHERE status='pending' LIMIT 1 OFFSET 1;")

# Récupérer l'ID admin_jtec
ADMIN_ID=$(psql $DATABASE_URL -t -c "SELECT id FROM profiles WHERE role='admin_jtec' LIMIT 1;")

# Appeler l'API rejet
curl -X POST http://localhost:3000/api/admin/reject-adhesion \
  -H "Content-Type: application/json" \
  -d "{
    \"requestId\": \"$DEMANDE_ID\",
    \"adminId\": \"$ADMIN_ID\",
    \"reason\": \"Informations incomplètes. Merci de nous recontacter avec votre SIRET.\"
  }"
```

### Résultat attendu (200 OK)

```json
{
  "success": true,
  "message": "Demande rejetée",
  "owner_email": "marie.martin.test@example.com",
  "reason": "Informations incomplètes. Merci de nous recontacter avec votre SIRET."
}
```

### Vérifications base de données

```sql
-- Vérifier demande marquée rejected
SELECT 
  status, 
  validated_at, 
  validated_by,
  rejection_reason,
  created_regie_id,
  created_subscription_id
FROM adhesion_requests
WHERE owner_email = 'marie.martin.test@example.com';
-- Résultat attendu : 
--   status = 'rejected'
--   rejection_reason = "Informations incomplètes..."
--   created_*_id = NULL (aucune entité créée)

-- Vérifier qu'AUCUNE régie n'a été créée
SELECT COUNT(*) FROM regies WHERE email = 'marie.martin.test@example.com';
-- Résultat attendu : 0

-- Vérifier qu'AUCUN auth.user n'a été créé
SELECT COUNT(*) FROM auth.users WHERE email = 'marie.martin.test@example.com';
-- Résultat attendu : 0
```

✅ **VALIDÉ** si :
- Demande marquée rejected
- Raison enregistrée
- Aucune régie créée
- Aucun user créé

---

## 🧪 TEST 3 : ROLLBACK (ERREUR MIDDLE)

### Simuler erreur création profile

**Modifier temporairement l'API pour forcer une erreur :**

```javascript
// Dans validate-adhesion.js, ligne ~140
const { data: newProfile, error: profileError } = await supabaseAdmin
  .from("profiles")
  .insert([
    {
      id: authUser.user.id,
      role: "INVALID_ROLE", // ← Forcer erreur CHECK constraint
      // ...
    },
  ])
```

**Relancer test validation :**

```bash
curl -X POST http://localhost:3000/api/admin/validate-adhesion \
  -H "Content-Type: application/json" \
  -d "{
    \"requestId\": \"$DEMANDE_ID\",
    \"adminId\": \"$ADMIN_ID\"
  }"
```

**Résultat attendu (500 Error) :**

```json
{
  "error": "Erreur création profile: ..."
}
```

### Vérifications rollback

```sql
-- Vérifier que la régie a été SUPPRIMÉE
SELECT COUNT(*) FROM regies 
WHERE email = (SELECT owner_email FROM adhesion_requests WHERE id = '$DEMANDE_ID');
-- Résultat attendu : 0

-- Vérifier que la subscription a été SUPPRIMÉE
SELECT COUNT(*) FROM subscriptions WHERE regie_id NOT IN (SELECT id FROM regies);
-- Résultat attendu : 0 (pas d'orphelins)

-- Vérifier que l'auth.user a été SUPPRIMÉ
SELECT COUNT(*) FROM auth.users 
WHERE email = (SELECT owner_email FROM adhesion_requests WHERE id = '$DEMANDE_ID');
-- Résultat attendu : 0

-- Vérifier que la demande est restée PENDING
SELECT status FROM adhesion_requests WHERE id = '$DEMANDE_ID';
-- Résultat attendu : 'pending'
```

✅ **VALIDÉ** si rollback complet (pas d'entités orphelines)

**⚠️ REMETTRE LE CODE ORIGINAL après test !**

---

## 🧪 TEST 4 : SÉCURITÉ (NON-ADMIN)

### Tenter validation avec non-admin

```bash
# Récupérer l'ID d'un user NON admin_jtec
NON_ADMIN_ID=$(psql $DATABASE_URL -t -c "SELECT id FROM profiles WHERE role='regie' LIMIT 1;")

# Tenter appel API
curl -X POST http://localhost:3000/api/admin/validate-adhesion \
  -H "Content-Type: application/json" \
  -d "{
    \"requestId\": \"$DEMANDE_ID\",
    \"adminId\": \"$NON_ADMIN_ID\"
  }"
```

**Résultat attendu (403 Forbidden) :**

```json
{
  "error": "Accès refusé. Admin JETC requis."
}
```

✅ **VALIDÉ** si accès refusé

---

## 🧪 TEST 5 : UI DASHBOARD (BOUTONS VALIDER/REJETER)

### Test via interface web

1. Se connecter en tant qu'admin_jtec
2. Aller sur `/admin/jetc`
3. Filtre "En attente"
4. Cliquer "✅ Valider" sur une demande

**Résultat attendu :**
- Popup confirmation : "Confirmer la validation ?"
- Après OK :
  - Loading spinner pendant création
  - Alert success : "Demande validée avec succès"
  - Demande disparaît du filtre "En attente"
  - Demande apparaît dans filtre "Validées"

5. Cliquer "❌ Rejeter" sur une autre demande

**Résultat attendu :**
- Prompt : "Raison du rejet (optionnel)"
- Après validation :
  - Alert success : "Demande rejetée"
  - Demande disparaît du filtre "En attente"
  - Demande apparaît dans filtre "Rejetées"

✅ **VALIDÉ** si workflow UI complet fonctionne

---

## 📧 TEST 6 : EMAIL (LOGS CONSOLE)

### Vérifier logs backend

**Dans le terminal où tourne `npm run dev` :**

```
[validation]
Email à envoyer à: jean.dupont.test@example.com
Lien magic: https://xxx.supabase.co/auth/v1/verify?token=...

[rejet]
Email rejet à envoyer à: marie.martin.test@example.com
Raison: Informations incomplètes...
```

⚠️ **Note :** Intégration email réelle = TODO (Resend/SendGrid)

Pour l'instant, vérifier que :
- Email owner loggé correctement
- Magic link généré
- Raison rejet loggée

---

## 🚨 CAS D'ERREUR

### Erreur : "SUPABASE_SERVICE_ROLE_KEY is not defined"

**Cause :** Variable env manquante

**Solution :**
1. Ajouter dans `.env.local` (voir section Configuration)
2. Redémarrer serveur : `npm run dev`

### Erreur : "Invalid API key"

**Cause :** Clé service incorrecte

**Solution :**
1. Revérifier dans Supabase Dashboard → Settings → API
2. Copier la clé `service_role` (pas `anon`)
3. Remplacer dans `.env.local`

### Erreur : "duplicate key value violates unique constraint"

**Cause :** Email owner déjà utilisé dans auth.users

**Solution :**
```sql
-- Supprimer l'ancien user
DELETE FROM auth.users WHERE email = 'email@example.com';
DELETE FROM profiles WHERE email = 'email@example.com';
DELETE FROM regies WHERE email = 'email@example.com';

-- Réessayer validation
```

### Erreur : "Role 'regie' does not exist in check constraint"

**Cause :** Colonne role dans profiles n'accepte pas 'regie'

**Solution :**
```sql
-- Vérifier la contrainte
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass 
AND contype = 'c';

-- Si 'regie' manque dans CHECK, modifier :
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('locataire', 'regie', 'entreprise', 'technicien', 'admin_jtec'));
```

---

## ✅ CHECKLIST VALIDATION ÉTAPE 4

### API validate-adhesion.js
- [ ] Variable SUPABASE_SERVICE_ROLE_KEY configurée
- [ ] Appel API retourne 200 + success:true
- [ ] Régie créée en DB (is_demo=false)
- [ ] Subscription créée (statut=essai, +14j)
- [ ] Auth.user créé (email_confirmed_at non null)
- [ ] Profile owner créé (is_owner=true, created_by=null)
- [ ] Demande marquée approved + IDs entités
- [ ] Magic link généré et fonctionnel
- [ ] Logs email dans console backend

### API reject-adhesion.js
- [ ] Appel API retourne 200 + success:true
- [ ] Demande marquée rejected
- [ ] Raison enregistrée en DB
- [ ] Aucune régie créée
- [ ] Aucun auth.user créé
- [ ] Logs email rejet dans console

### Sécurité
- [ ] Non-admin → 403 Forbidden
- [ ] Demande déjà traitée → 400 Bad Request
- [ ] Plan introuvable → 400 Bad Request

### Rollback
- [ ] Erreur création profile → Régie supprimée
- [ ] Erreur création profile → Subscription supprimée
- [ ] Erreur création profile → Auth.user supprimé
- [ ] Demande reste pending après erreur

### UI Dashboard
- [ ] Bouton Valider → Confirmation → Success
- [ ] Bouton Rejeter → Prompt raison → Success
- [ ] Demande disparaît du filtre après action
- [ ] Demande réapparaît dans bon filtre (Validées/Rejetées)

---

## 🎯 SI TOUS LES TESTS PASSENT

✅ **ÉTAPE 4 VALIDÉE**

Workflow complet fonctionnel :
1. Visiteur remplit formulaire → INSERT adhesion_requests (pending)
2. Admin JETC voit demande → /admin/jetc
3. Admin clique "Valider" → API crée régie + subscription + owner
4. Owner reçoit magic link (email TODO)
5. Owner se connecte → /regie/dashboard

**Prochaine étape :** ÉTAPE 5 - Sécurité (vérifier isolation DEMO/PROD, quotas)

---

**Confirmez que tous les tests passent pour continuer !** 🚀
