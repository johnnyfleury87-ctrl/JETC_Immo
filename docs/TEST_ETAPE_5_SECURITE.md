# ✅ ÉTAPE 5 – SÉCURITÉ & VALIDATION FINALE

## 🎯 OBJECTIF
Vérifier l'isolation complète DEMO/PROD, la sécurité des accès, et valider le workflow SaaS de bout en bout.

---

## 🔐 TEST 1 : ISOLATION DEMO/PROD

### Vérification 1.1 : Comptes DEMO n'apparaissent PAS dans adhesion_requests

**SQL à exécuter :**

```sql
-- Vérifier qu'AUCUNE demande d'adhésion n'a is_demo=true
-- (la colonne n'existe même pas, c'est correct)
SELECT COUNT(*) FROM adhesion_requests WHERE owner_email LIKE '%demo%';
-- Résultat attendu : 0 (pas de demandes DEMO)

-- Vérifier régies DEMO séparées
SELECT 
  nom, 
  email, 
  is_demo, 
  subscription_actif,
  plan_id
FROM regies 
WHERE is_demo = true;
-- Résultat attendu : Régies DEMO visibles avec is_demo=true

-- Vérifier régies PROD (créées via adhesion)
SELECT 
  nom, 
  email, 
  is_demo, 
  subscription_actif,
  plan_id
FROM regies 
WHERE is_demo = false;
-- Résultat attendu : Régies PROD avec is_demo=false
```

✅ **VALIDÉ** si AUCUNE régie DEMO n'a été créée via adhesion_requests

---

### Vérification 1.2 : Mode DEMO bypass quotas

**SQL à exécuter :**

```sql
-- Vérifier triggers quotas (migration 04)
-- Les triggers doivent ignorer is_demo=true

-- Test : Créer un profil DEMO dépassant les quotas
INSERT INTO profiles (
  role, email, nom, prenom, regie_id, is_demo
) 
VALUES (
  'regie',
  'test_demo_quota@example.com',
  'Test',
  'Quota',
  (SELECT id FROM regies WHERE is_demo=true LIMIT 1),
  true
);

-- Vérifier que ça fonctionne (pas de RAISE EXCEPTION)
SELECT COUNT(*) FROM profiles WHERE email = 'test_demo_quota@example.com';
-- Résultat attendu : 1 (insertion réussie)

-- Nettoyer
DELETE FROM profiles WHERE email = 'test_demo_quota@example.com';
```

**Vérifier dans le code des triggers (04_saas_quota_triggers.sql) :**

```sql
-- Extrait du trigger enforce_quota_users_on_insert
IF NEW.role = 'admin_jtec' THEN
  RETURN NEW; -- Admin JETC bypasse tout
END IF;

IF NEW.is_demo = true THEN
  RETURN NEW; -- ✅ DEMO bypasse quotas
END IF;

-- ... reste du code vérification quotas
```

✅ **VALIDÉ** si tous les triggers ont `IF NEW.is_demo = true THEN RETURN NEW;`

---

### Vérification 1.3 : Accès DEMO Hub inchangé

**Test manuel :**

1. Ouvrir `http://localhost:3000`
2. Cliquer "🎭 Commencer en mode DEMO"
3. Vérifier redirection → `/demo-hub`
4. Choisir un rôle (ex: Régie)
5. Vérifier :
   - Banner "MODE DÉMO" visible
   - Aucune demande d'adhésion créée
   - Données fictives chargées
   - Quotas ignorés

**Vérifier localStorage :**

```javascript
// Dans console navigateur (F12)
localStorage.getItem("jetc_demo_mode") // → "true"
localStorage.getItem("jetc_demo_role") // → "regie"
```

✅ **VALIDÉ** si mode DEMO fonctionne sans créer de vraies entités

---

## 🔒 TEST 2 : SÉCURITÉ ACCÈS

### Vérification 2.1 : Demande pending → Aucun accès

**Scénario :**
1. Soumettre formulaire `/demande-adhesion`
2. Demande créée avec `status = 'pending'`
3. Tenter de se connecter avec `owner_email`

**Test SQL :**

```sql
-- Récupérer email d'une demande pending
SELECT owner_email, status 
FROM adhesion_requests 
WHERE status = 'pending' 
LIMIT 1;

-- Vérifier qu'AUCUN auth.user existe pour cet email
SELECT COUNT(*) 
FROM auth.users 
WHERE email = (SELECT owner_email FROM adhesion_requests WHERE status='pending' LIMIT 1);
-- Résultat attendu : 0
```

**Test UI :**

1. Aller sur `/login`
2. Entrer email d'une demande pending
3. Entrer n'importe quel mot de passe
4. Cliquer "Connexion"

**Résultat attendu :**
- ❌ Erreur : "Invalid login credentials" (user n'existe pas)
- ❌ Aucun accès possible

✅ **VALIDÉ** si impossible de se connecter avec demande pending

---

### Vérification 2.2 : Après validation → Accès possible

**Scénario :**
1. Admin JETC valide une demande
2. Owner reçoit magic link
3. Owner se connecte

**Test :**

```sql
-- Après validation via API ou UI
SELECT 
  ar.owner_email,
  ar.status,
  au.id AS auth_user_id,
  au.email_confirmed_at,
  p.id AS profile_id,
  p.is_owner
FROM adhesion_requests ar
LEFT JOIN auth.users au ON au.email = ar.owner_email
LEFT JOIN profiles p ON p.email = ar.owner_email
WHERE ar.status = 'approved'
LIMIT 1;
```

**Résultat attendu :**
```
owner_email          | status   | auth_user_id | email_confirmed_at | profile_id | is_owner
---------------------|----------|--------------|-------------------|------------|----------
jean.dupont@test.ch  | approved | abc-123-def  | 2025-12-13 15:30  | xyz-789    | true
```

✅ **VALIDÉ** si auth.user existe UNIQUEMENT après validation

---

### Vérification 2.3 : RLS Policies strictes

**Tester accès non-autorisé :**

```sql
-- Simuler un user non-admin tentant de SELECT adhesion_requests
SET LOCAL jwt.claims.sub = (SELECT id FROM profiles WHERE role='regie' LIMIT 1);

SELECT COUNT(*) FROM adhesion_requests;
-- Résultat attendu : ERREUR RLS ou 0 rows (pas accès)

-- Reset
RESET jwt.claims.sub;
```

**Vérifier policies :**

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'adhesion_requests'
ORDER BY policyname;
```

**Résultat attendu :**

| policyname                              | cmd    | roles         | qual (résumé)                       |
|-----------------------------------------|--------|---------------|-------------------------------------|
| admin_jtec_delete_adhesion_requests     | DELETE | authenticated | role = 'admin_jtec'                 |
| admin_jtec_update_adhesion_requests     | UPDATE | authenticated | role = 'admin_jtec'                 |
| admin_jtec_view_all_adhesion_requests   | SELECT | authenticated | role = 'admin_jtec'                 |
| public_insert_adhesion_request          | INSERT | public        | true (tous peuvent INSERT)          |

✅ **VALIDÉ** si :
- SELECT réservé admin_jtec
- UPDATE réservé admin_jtec
- DELETE réservé admin_jtec
- INSERT public (formulaire non authentifié)

---

## 🔄 TEST 3 : WORKFLOW COMPLET (END-TO-END)

### Scénario complet : Du formulaire au dashboard owner

**Étape 1 : Soumission formulaire (PROSPECT)**

```bash
# Aller sur http://localhost:3000/demande-adhesion
# Remplir formulaire complet :
# - Plan : Pro
# - Régie : Test E2E SA
# - Ville : Genève
# - Logements : 80
# - Contact : Test E2E / test.e2e@example.com / +41 22 999 88 77
# - Mode locataires : Plus tard
# - Motivation : Test end-to-end workflow SaaS

# Soumettre
```

**Vérification DB :**

```sql
SELECT 
  id,
  plan_requested,
  regie_name,
  owner_email,
  status,
  created_at
FROM adhesion_requests
WHERE owner_email = 'test.e2e@example.com';
-- Résultat attendu : 1 ligne, status='pending'
```

---

**Étape 2 : Validation admin (ADMIN JETC)**

```bash
# Se connecter en admin_jtec
# Aller sur http://localhost:3000/admin/jetc
# Filtre "En attente"
# Trouver demande "Test E2E SA"
# Cliquer "✅ Valider"
# Confirmer popup
```

**Vérification DB après validation :**

```sql
-- Demande approved
SELECT status, validated_at, created_regie_id, created_subscription_id, created_owner_profile_id
FROM adhesion_requests
WHERE owner_email = 'test.e2e@example.com';
-- Attendu : status='approved', tous les created_*_id remplis

-- Régie créée
SELECT id, nom, ville, is_demo, subscription_actif
FROM regies
WHERE email = 'test.e2e@example.com';
-- Attendu : 1 ligne, is_demo=false, subscription_actif=true

-- Subscription créée
SELECT 
  statut, 
  date_debut, 
  date_fin_essai, 
  usage_users, 
  usage_admins,
  TO_CHAR(date_fin_essai, 'YYYY-MM-DD') AS fin_essai_formatted
FROM subscriptions
WHERE regie_id = (SELECT id FROM regies WHERE email='test.e2e@example.com');
-- Attendu : statut='essai', date_fin_essai = today + 14 jours, usage_users=1

-- Auth.user créé
SELECT id, email, email_confirmed_at
FROM auth.users
WHERE email = 'test.e2e@example.com';
-- Attendu : email_confirmed_at NOT NULL (pré-confirmé)

-- Profile owner créé
SELECT role, is_owner, created_by, regie_id
FROM profiles
WHERE email = 'test.e2e@example.com';
-- Attendu : role='regie', is_owner=true, created_by=NULL
```

---

**Étape 3 : Connexion owner (OWNER)**

**Récupérer magic link :**

```bash
# Dans terminal où tourne npm run dev, chercher :
# "Lien magic: https://xxx.supabase.co/auth/v1/verify?token=..."
# Copier le lien complet
```

**Tester connexion :**

1. Ouvrir navigation privée
2. Coller magic link dans barre d'adresse
3. Enter

**Résultat attendu :**
- ✅ Redirection vers `/regie/dashboard`
- ✅ Authentifié automatiquement
- ✅ Nom "Test E2E" visible en haut
- ✅ Dashboard régie accessible

**Vérifier session :**

```javascript
// Console navigateur (F12)
// Vérifier Supabase session
const session = JSON.parse(localStorage.getItem('supabase.auth.token'))
console.log(session.currentSession.user.email) // → test.e2e@example.com
```

---

**Étape 4 : Utilisation normal (OWNER)**

**Vérifier accès fonctionnalités :**

1. **Tickets** : `/regie/tickets`
   - ✅ Liste tickets
   - ✅ Créer ticket (bouton "Nouveau ticket")

2. **Immeubles** : `/regie/immeubles`
   - ✅ Liste immeubles
   - ✅ Ajouter immeuble (bouton "Nouvel immeuble")

3. **Logements** : `/regie/logements`
   - ✅ Liste logements
   - ✅ Ajouter logement

4. **Quotas** :
   ```sql
   -- Vérifier que quotas sont enforced
   SELECT 
     s.usage_users,
     s.usage_admins,
     p.max_users,
     p.max_admins
   FROM subscriptions s
   JOIN plans p ON p.id = s.plan_id
   WHERE s.regie_id = (SELECT id FROM regies WHERE email='test.e2e@example.com');
   ```

   - Si plan Pro : max_users=5, max_admins=1
   - Tenter de créer 6ème user → Doit être bloqué par trigger

✅ **VALIDÉ** si workflow complet fonctionne de A à Z

---

## 🛡️ TEST 4 : QUOTAS ENFORCEMENT

### Vérification 4.1 : Trigger bloque dépassement quotas

**Scénario : Plan Pro (max 5 users)**

```sql
-- Récupérer régie Test E2E
SELECT id, nom FROM regies WHERE email = 'test.e2e@example.com';

-- Vérifier subscription Pro
SELECT 
  s.id,
  s.usage_users,
  p.nom AS plan_nom,
  p.max_users
FROM subscriptions s
JOIN plans p ON p.id = s.plan_id
WHERE s.regie_id = (SELECT id FROM regies WHERE email='test.e2e@example.com');
-- Attendu : plan_nom='Pro', max_users=5, usage_users=1 (owner)

-- Tenter d'ajouter 5 users (total = 6, devrait échouer au 5ème)
DO $$
DECLARE
  test_regie_id UUID;
  i INTEGER;
BEGIN
  SELECT id INTO test_regie_id FROM regies WHERE email = 'test.e2e@example.com';
  
  FOR i IN 1..5 LOOP
    BEGIN
      INSERT INTO profiles (
        role, email, nom, prenom, regie_id, is_demo
      ) VALUES (
        'regie',
        'user' || i || '.test@example.com',
        'User',
        'Test ' || i,
        test_regie_id,
        false
      );
      RAISE NOTICE 'User % créé', i;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'User % BLOQUÉ: %', i, SQLERRM;
    END;
  END LOOP;
END $$;
```

**Résultat attendu :**

```
NOTICE:  User 1 créé
NOTICE:  User 2 créé
NOTICE:  User 3 créé
NOTICE:  User 4 créé
NOTICE:  User 5 BLOQUÉ: Quota users atteint (5/5). Upgrade votre plan.
```

**Nettoyer :**

```sql
DELETE FROM profiles WHERE email LIKE 'user%.test@example.com';
```

✅ **VALIDÉ** si trigger bloque au 5ème user

---

### Vérification 4.2 : Compteurs usage_users/usage_admins corrects

```sql
-- Vérifier usage après ajout users
SELECT 
  s.usage_users,
  s.usage_admins,
  COUNT(p.id) AS count_profiles
FROM subscriptions s
LEFT JOIN profiles p ON p.regie_id = s.regie_id AND p.is_demo = false
WHERE s.regie_id = (SELECT id FROM regies WHERE email='test.e2e@example.com')
GROUP BY s.id, s.usage_users, s.usage_admins;
```

**Résultat attendu :**

```
usage_users | usage_admins | count_profiles
------------|--------------|---------------
5           | 1            | 5
```

✅ **VALIDÉ** si compteurs correspondent au nombre réel de profiles

---

## 🚨 TEST 5 : CAS LIMITES

### Test 5.1 : Double soumission (même email)

**Scénario :**

1. Soumettre demande avec `duplicate@example.com`
2. Tenter de re-soumettre avec même email

**Test SQL :**

```sql
-- Première insertion
INSERT INTO adhesion_requests (
  plan_requested, regie_name, city, logements_estimes,
  owner_firstname, owner_lastname, owner_email, owner_phone, status
) VALUES (
  'Pro', 'Test Duplicate SA', 'Genève', 50,
  'Test', 'Duplicate', 'duplicate@example.com', '+41 22 111 22 33', 'pending'
);

-- Deuxième insertion (devrait échouer)
INSERT INTO adhesion_requests (
  plan_requested, regie_name, city, logements_estimes,
  owner_firstname, owner_lastname, owner_email, owner_phone, status
) VALUES (
  'Pro', 'Test Duplicate 2 SA', 'Lausanne', 60,
  'Test', 'Duplicate2', 'duplicate@example.com', '+41 21 444 55 66', 'pending'
);
-- Attendu : ERROR duplicate key value violates unique constraint "adhesion_requests_owner_email_key"
```

✅ **VALIDÉ** si erreur UNIQUE constraint

**Nettoyer :**

```sql
DELETE FROM adhesion_requests WHERE owner_email = 'duplicate@example.com';
```

---

### Test 5.2 : Demande déjà traitée

**Scénario :**

1. Valider une demande
2. Tenter de la valider à nouveau

**Test via API :**

```bash
# Valider demande
DEMANDE_ID="..." # ID demande pending
ADMIN_ID="..." # ID admin_jtec

curl -X POST http://localhost:3000/api/admin/validate-adhesion \
  -H "Content-Type: application/json" \
  -d "{\"requestId\": \"$DEMANDE_ID\", \"adminId\": \"$ADMIN_ID\"}"

# Tenter de re-valider la même demande
curl -X POST http://localhost:3000/api/admin/validate-adhesion \
  -H "Content-Type: application/json" \
  -d "{\"requestId\": \"$DEMANDE_ID\", \"adminId\": \"$ADMIN_ID\"}"
```

**Résultat attendu 2ème appel :**

```json
{
  "error": "Demande déjà traitée"
}
```

✅ **VALIDÉ** si deuxième validation refusée

---

### Test 5.3 : Magic link expiré

**Scénario :**

1. Générer magic link
2. Attendre expiration (24h par défaut Supabase)
3. Tenter d'utiliser lien expiré

**Test manuel :**

- Magic link contient `?token=...&type=magiclink`
- Après 24h, le token est invalidé par Supabase
- Tentative de connexion → Erreur "Link expired"

**Solution pour owner :**

1. Aller sur `/login`
2. Cliquer "Mot de passe oublié"
3. Entrer email
4. Nouveau lien envoyé (si SMTP configuré)

✅ **VALIDÉ** si lien expiré redirige vers erreur

---

## ✅ CHECKLIST VALIDATION FINALE

### Isolation DEMO/PROD
- [ ] Aucune demande DEMO dans adhesion_requests
- [ ] Régies DEMO ont is_demo=true
- [ ] Régies PROD ont is_demo=false
- [ ] Mode DEMO bypass quotas (triggers)
- [ ] Mode DEMO accessible via homepage
- [ ] Aucun impact DEMO sur données PROD

### Sécurité accès
- [ ] Demande pending → Aucun auth.user créé
- [ ] Demande pending → Impossible de se connecter
- [ ] Demande approved → Auth.user créé
- [ ] Demande approved → Magic link fonctionnel
- [ ] RLS : SELECT adhesion_requests → Admin_jtec only
- [ ] RLS : UPDATE adhesion_requests → Admin_jtec only
- [ ] RLS : DELETE adhesion_requests → Admin_jtec only
- [ ] RLS : INSERT adhesion_requests → Public OK

### Workflow end-to-end
- [ ] Formulaire → Demande pending créée
- [ ] Admin validation → Régie + Subscription + Owner créés
- [ ] Magic link → Connexion automatique
- [ ] Dashboard owner accessible
- [ ] Fonctionnalités régie utilisables

### Quotas enforcement
- [ ] Trigger bloque dépassement max_users
- [ ] Trigger bloque dépassement max_admins
- [ ] Compteurs usage_users/usage_admins corrects
- [ ] is_demo=true bypass quotas
- [ ] admin_jtec bypass quotas

### Cas limites
- [ ] Double soumission même email → Erreur UNIQUE
- [ ] Demande déjà traitée → Erreur "déjà traitée"
- [ ] Magic link expiré → Erreur expiration
- [ ] Plan inexistant → Erreur validation
- [ ] Email invalide → Erreur frontend

---

## 🎉 SI TOUS LES TESTS PASSENT

✅ **ÉTAPE 5 VALIDÉE**

✅ **WORKFLOW SAAS COMPLET OPÉRATIONNEL**

### Résumé du système

**Architecture finale :**

```
┌─────────────────────────────────────────────────────────┐
│                    FLUX PRODUCTION                      │
└─────────────────────────────────────────────────────────┘

1. VISITEUR
   ↓ Homepage → "Commencer maintenant"
   ↓ /demande-adhesion (formulaire 3 étapes)
   ↓ Soumettre → INSERT adhesion_requests (status=pending)

2. ADMIN JETC
   ↓ /admin/jetc (guard admin_jtec)
   ↓ Voir demandes pending
   ↓ Cliquer "Valider"
   ↓ API /api/admin/validate-adhesion

3. BACKEND API
   ↓ Créer régie (is_demo=false)
   ↓ Créer subscription (statut=essai, +14j)
   ↓ Créer auth.user (email_confirmed=true)
   ↓ Créer profile (is_owner=true, created_by=null)
   ↓ Marquer demande approved
   ↓ Générer magic link

4. OWNER
   ↓ Recevoir email (TODO: SMTP)
   ↓ Cliquer magic link
   ↓ Authentifié automatiquement
   ↓ Redirection /regie/dashboard
   ↓ Utilisation normale (quotas enforced)

┌─────────────────────────────────────────────────────────┐
│                     FLUX DEMO                           │
└─────────────────────────────────────────────────────────┘

1. VISITEUR
   ↓ Homepage → "🎭 Essayer le DEMO"
   ↓ /demo-hub
   ↓ Choisir rôle (régie/entreprise/technicien/locataire)
   ↓ localStorage.jetc_demo_mode = true
   ↓ Dashboard DEMO (données fictives)
   ↓ Aucune adhesion_request créée
   ↓ Quotas ignorés (is_demo=true)
   ↓ Isolation totale PROD/DEMO
```

**Fichiers clés créés :**

1. **Migrations SQL (5 fichiers) :**
   - 01_plans_update_chf.sql : Plans en CHF
   - 02_saas_owner_tracking.sql : is_owner, created_by
   - 03_saas_subscription_helpers.sql : Vues + fonctions helpers
   - 04_saas_quota_triggers.sql : Triggers enforcement quotas
   - 05_adhesion_requests.sql : Table + RLS + fonctions validation/rejet

2. **Pages frontend (3 pages) :**
   - pages/demande-adhesion.js : Formulaire 3 étapes
   - pages/admin/jetc.js : Dashboard admin JETC
   - pages/pricing.js : CTAs modifiés

3. **APIs backend (2 endpoints) :**
   - pages/api/admin/validate-adhesion.js : Création tenant complet
   - pages/api/admin/reject-adhesion.js : Rejet demande

4. **Scripts test (3 fichiers) :**
   - supabase/migrations/test_etape_3_data.sql : Données test admin
   - test-api-adhesion.sh : Test automatisé APIs
   - docs/TEST_ETAPE_*.md : Guides test complets

**Sécurité :**

- ✅ RLS policies strictes (admin_jtec only)
- ✅ Public INSERT sur adhesion_requests (formulaire)
- ✅ Aucun auth.user avant validation admin
- ✅ Quotas enforced par triggers
- ✅ Isolation DEMO/PROD complète
- ✅ Magic link passwordless first login
- ✅ Rollback atomique si erreur

**Prochaines améliorations (hors scope actuel) :**

1. **Email service** : Intégrer Resend/SendGrid pour emails automatiques
2. **Templates email** : HTML professionnel welcome/rejection
3. **Webhook Stripe** : Paiement automatique fin essai
4. **Dashboard analytics** : Métriques conversion MRR churn
5. **Multi-langue** : FR/EN/DE pour Suisse
6. **Import CSV** : Si owner sélectionne mode "csv" dans formulaire

---

## 📊 MÉTRIQUES SYSTÈME

```sql
-- Statistiques demandes
SELECT 
  status,
  COUNT(*) AS nombre,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS pourcentage
FROM adhesion_requests
GROUP BY status;

-- Répartition plans
SELECT 
  plan_requested,
  COUNT(*) AS demandes,
  SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) AS validees
FROM adhesion_requests
GROUP BY plan_requested;

-- Taux conversion
SELECT 
  COUNT(*) FILTER (WHERE status='approved') * 100.0 / COUNT(*) AS taux_validation_pct,
  COUNT(*) FILTER (WHERE status='rejected') * 100.0 / COUNT(*) AS taux_rejet_pct
FROM adhesion_requests;

-- Délai moyen traitement
SELECT 
  AVG(EXTRACT(EPOCH FROM (validated_at - created_at))/3600)::NUMERIC(10,2) AS heures_moy_traitement
FROM adhesion_requests
WHERE status IN ('approved', 'rejected');
```

---

**🎉 FÉLICITATIONS ! LE SYSTÈME SAAS JETC IMMO EST OPÉRATIONNEL !** 🚀
