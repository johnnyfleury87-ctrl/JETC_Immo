# 🔐 Flux d'authentification Admin via Magic Link

## Vue d'ensemble

L'accès admin se fait **uniquement** via Magic Link Supabase, sans bypass ni mode debug.

## Flux complet avec logs détaillés

### ✅ STEP 1-3 : Demande du Magic Link

**Action utilisateur** : Clic droit sur le logo "🏢 JETC IMMO"

**Code** : [components/Layout.js](components/Layout.js) → [lib/adminAuth.js](lib/adminAuth.js)

**Logs console** :
```
[ADMIN] Step 1 - Right click detected
[ADMIN] Step 2 - Magic link request sent to Supabase {email: "admin@example.com"}
[ADMIN] Step 3 - Magic link email SENT {email: "admin@example.com"}
```

**Ou en cas d'erreur** :
```
[ADMIN][ERROR] Email validation failed {email: "invalid"}
[ADMIN][ERROR] Magic link send failed {error: "...", status: 400, code: "..."}
```

---

### ✅ STEP 4-6 : Callback après clic sur le lien

**Action utilisateur** : Clic sur le lien reçu par email

**URL** : `https://votre-app.vercel.app/auth/callback?next=/admin`

**Code** : [pages/auth/callback.js](pages/auth/callback.js)

**Logs console** :
```
[ADMIN] Step 4 - Auth event {url: "...", params: {...}}
[ADMIN] Step 5 - Session detected {userId: "...", email: "..."}
[ADMIN] Step 6 - Profile loaded {role: "admin_jtec", email: "..."}
```

**Ou en cas d'erreur** :
```
[ADMIN][ERROR] Session retrieval failed {error: "...", hasSession: false}
[ADMIN][ERROR] Profile fetch failed {error: "...", code: "..."}
```

---

### ✅ STEP 7-8 : Vérification du rôle et redirection

**Code** : [pages/auth/callback.js](pages/auth/callback.js)

**Logs console (succès)** :
```
[ADMIN] Step 7 - ADMIN ROLE OK
[ADMIN] Step 8 - Redirecting to /admin
```

**Logs console (refus)** :
```
[ADMIN][BLOCKED] Role is not admin {role: "locataire", expected: "admin_jtec"}
```

**Résultat** :
- ✅ Si role = `admin_jtec` → Redirection vers `/admin`
- ❌ Sinon → Redirection vers `/` avec message d'erreur

---

### ✅ Protection de la page /admin

**Code** : [pages/admin/index.js](pages/admin/index.js)

**Vérifications** :
1. Session Supabase active
2. Profile avec role = `admin_jtec`
3. Backend confirmation du rôle

**Logs console (refus)** :
```
[ADMIN][BLOCKED] No session
[ADMIN][BLOCKED] Role is not admin {role: "..."}
[ADMIN][BLOCKED] Backend role verification failed {backendRole: "..."}
```

**Résultat** :
- ✅ Si toutes les vérifications passent → Dashboard admin affiché
- ❌ Sinon → Écran "Accès refusé" + redirection automatique après 3s

---

## Configuration requise

### 1. Supabase Auth

Dans Dashboard Supabase → Authentication → URL Configuration :

```
Site URL: https://votre-app.vercel.app
Redirect URLs:
  - http://localhost:3000/auth/callback
  - https://votre-app.vercel.app/auth/callback
```

### 2. Base de données

Table `profiles` doit avoir un user avec role admin :

```sql
-- Vérifier
SELECT id, email, role FROM profiles WHERE role = 'admin_jtec';

-- Créer/Modifier
UPDATE profiles 
SET role = 'admin_jtec' 
WHERE email = 'votre-email@example.com';
```

### 3. RLS Policies

Policy sur `profiles` pour lecture du profil :

```sql
-- Voir supabase/policies/10_policies_profiles.sql
-- L'utilisateur doit pouvoir lire son propre profil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
```

---

## Test du flux

### En local (http://localhost:3000)

1. `npm run dev`
2. Ouvrir http://localhost:3000
3. Clic droit sur le logo "🏢 JETC IMMO"
4. Entrer email admin (ou laisser auto-remplir si déjà connecté)
5. Vérifier console : logs **[ADMIN] Step 1-3**
6. Vérifier email inbox
7. Cliquer sur le Magic Link
8. Observer page callback (loader + message)
9. Vérifier console : logs **[ADMIN] Step 4-8**
10. Vérifier redirect vers /admin
11. Vérifier dashboard charge correctement

### En production (Vercel)

Même processus avec l'URL de production configurée dans Supabase.

---

## Debugging

### Pas de logs dans la console ?

- Ouvrir la console navigateur (F12)
- Filtrer par `[ADMIN]`
- Vérifier que le code est bien déployé (check version)

### Email non reçu ?

- Vérifier Supabase Dashboard → Auth → Logs
- Vérifier spam
- Tester avec un autre email

### Accès refusé malgré role admin ?

```sql
-- Vérifier le role dans la DB
SELECT id, email, role FROM profiles WHERE email = 'votre-email';

-- Résultat attendu : role = 'admin_jtec' (exactement)
```

### Session invalide ?

- Déconnexion + Reconnexion
- Vider cache navigateur
- Mode navigation privée

---

## Sécurité

✅ **Pas de bypass** : Aucun moyen d'accéder à /admin sans Magic Link

✅ **Pas de hardcode** : Pas d'email en dur dans le code

✅ **Logs clairs** : Chaque étape loggée pour debugging

✅ **Double vérification** : Supabase + Backend

✅ **Gestion d'erreurs** : Tous les cas d'erreur sont gérés

❌ **Fichier .secret supprimé** : Plus de documentation avec email hardcodé

---

## Fichiers concernés

| Fichier | Rôle | Steps |
|---------|------|-------|
| [components/Layout.js](components/Layout.js) | Handler clic droit sur logo | 1 |
| [lib/adminAuth.js](lib/adminAuth.js) | Envoi Magic Link + vérification role | 1-3 |
| [pages/auth/callback.js](pages/auth/callback.js) | Callback après clic sur lien | 4-8 |
| [pages/admin/index.js](pages/admin/index.js) | Protection page admin | Protection finale |

---

## Commit

```
feat: admin magic link flow with step-by-step logs

- Remove .secret/ACCES_ADMIN_SECRET.md (bypass with hardcoded email)
- Simplify log format: [ADMIN] Step 1-8 for clear tracking
- Clean code: no bypass, no silent failure, all errors logged
- Admin access ONLY via Magic Link authentication
```

---

**✨ Flux propre, sécurisé, tracé et debuggable !**
