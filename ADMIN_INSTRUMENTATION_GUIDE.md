# 🔍 Guide d'instrumentation Admin Magic Link

## Vue d'ensemble

Le flux Admin Magic Link est maintenant **complètement instrumenté** avec des logs détaillés à chaque étape pour identifier exactement où le processus bloque.

## 📊 Logs par étape

### STEP 1-2 : Clic droit sur logo

**Fichier** : [components/Layout.js](components/Layout.js)

**Logs attendus** :
```javascript
[ADMIN][STEP 1] Right click detected
[ADMIN][STEP 2] Requesting magic link for admin email {email: "admin@example.com"}
```

**En cas d'erreur** :
```javascript
[ADMIN][ERROR] No email provided
```

---

### STEP 3 : Envoi Magic Link via Supabase

**Fichier** : [lib/adminAuth.js](lib/adminAuth.js)

**Logs attendus** :
```javascript
[ADMIN][STEP 3] Magic link request sent to Supabase {
  email: "admin@example.com",
  redirectTo: "http://localhost:3000/auth/callback?next=/admin"
}
[ADMIN][STEP 3] ✅ Magic link email SENT successfully {
  email: "admin@example.com",
  sessionData: {...}
}
```

**En cas d'erreur** :
```javascript
[ADMIN][ERROR] Email validation failed
[ADMIN][ERROR] Magic link send failed {error: "...", status: 400, code: "..."}
```

---

### STEP 4-5 : Callback Magic Link + Parsing URL

**Fichier** : [pages/auth/callback.js](pages/auth/callback.js)

**Logs attendus** :
```javascript
[ADMIN][STEP 4] Magic link callback detected
[ADMIN][STEP 4] Full URL: http://localhost:3000/auth/callback?next=/admin#access_token=...
[ADMIN][STEP 5] URL params parsed {
  queryParams: {next: "/admin"},
  hashParams: {
    access_token: "eyJh...",
    expires_in: "3600",
    refresh_token: "...",
    token_type: "bearer",
    type: "magiclink"
  },
  routerQuery: {next: "/admin"}
}
```

---

### AUTH : Récupération session Supabase

**Fichier** : [pages/auth/callback.js](pages/auth/callback.js)

**Logs attendus (succès)** :
```javascript
[AUTH] getSession start
[AUTH] getSession result = OK
[AUTH] user.id = 12345678-1234-1234-1234-123456789abc
[AUTH] user.email = admin@example.com
[AUTH] Session details: {
  userId: "12345678-1234-1234-1234-123456789abc",
  email: "admin@example.com",
  role: "authenticated",
  aud: "authenticated",
  expiresAt: "2025-12-16T15:30:00.000Z"
}
```

**Logs attendus (échec)** :
```javascript
[AUTH] getSession start
[AUTH] getSession result = FAIL {
  error: "...",
  code: "...",
  status: 401
}
```

---

### STEP 6-8 : Chargement profil + Vérification rôle

**Fichier** : [pages/auth/callback.js](pages/auth/callback.js)

**Logs attendus** :
```javascript
[ADMIN][STEP 6] Loading profile for user.id 12345678-1234-1234-1234-123456789abc
[ADMIN][STEP 7] Profile loaded {
  id: "12345678-1234-1234-1234-123456789abc",
  email: "admin@example.com",
  role: "admin_jtec"
}
[ADMIN][STEP 8] role = admin_jtec
[ADMIN][STEP 8] Expected: admin_jtec
[ADMIN][STEP 8] Match: true
```

**En cas d'erreur** :
```javascript
[ADMIN][ERROR] Profile fetch failed {
  error: "...",
  code: "PGRST116",
  details: "...",
  hint: "..."
}
```

---

### STEP 9 : Décision finale + Redirection

**Fichier** : [pages/auth/callback.js](pages/auth/callback.js)

**Logs attendus (accès accordé)** :
```javascript
[ADMIN][STEP 9] Access granted → redirect /admin
[ADMIN][STEP 9] Executing redirect to: /admin
```

**Logs attendus (accès refusé)** :
```javascript
[ADMIN][BLOCKED] Role not admin → redirect /login {
  actualRole: "locataire",
  expectedRole: "admin_jtec"
}
```

---

### Vérification page /admin

**Fichier** : [pages/admin/index.js](pages/admin/index.js)

**Logs attendus** :
```javascript
[ADMIN] Admin page /admin loaded - verifying access...
[ADMIN] Calling checkAdminRole()...
[AUTH] checkAdminRole - Getting session...
[AUTH] checkAdminRole - Session OK, user.id = 12345678-1234-1234-1234-123456789abc
[AUTH] checkAdminRole - Fetching profile from DB...
[AUTH] checkAdminRole - Profile fetched: {
  id: "12345678-1234-1234-1234-123456789abc",
  email: "admin@example.com",
  role: "admin_jtec"
}
[AUTH] checkAdminRole - Is admin? true
[ADMIN] ✅ Role check passed - user is admin_jtec {
  email: "admin@example.com",
  role: "admin_jtec"
}
[ADMIN] Verifying with backend /me...
[ADMIN] ✅ Backend verification passed
[ADMIN] 🎉 Full admin access granted - loading dashboard...
```

---

## 🧪 Procédure de test

### 1. Préparation

```bash
# Terminal 1 : Démarrer l'app
npm run dev

# Terminal 2 : Ouvrir console navigateur
# F12 → Console → Filtrer par "[ADMIN]" ou "[AUTH]"
```

### 2. Test du flux complet

1. **Ouvrir** `http://localhost:3000`
2. **Clic droit** sur le logo "🏢 JETC IMMO"
3. **Vérifier console** : Logs `[ADMIN][STEP 1-3]`
4. **Vérifier email** : Recevoir le Magic Link
5. **Cliquer** sur le lien dans l'email
6. **Observer** : Page de callback s'affiche
7. **Vérifier console** : Logs `[ADMIN][STEP 4-9]` + `[AUTH]`
8. **Vérifier redirect** : Page `/admin` charge
9. **Vérifier console** : Logs vérification admin
10. **Vérifier dashboard** : Dashboard admin s'affiche

### 3. Identification du point de blocage

Si le flux s'arrête, cherchez le **dernier log** affiché :

| Dernier log visible | Diagnostic | Action |
|---------------------|------------|--------|
| `[ADMIN][STEP 1]` seulement | Clic détecté mais email invalide | Vérifier prompt email |
| `[ADMIN][STEP 2]` mais pas `[ADMIN][STEP 3]` | Appel Supabase échoue | Vérifier clés Supabase |
| `[ADMIN][STEP 3]` mais pas d'email | Email non envoyé | Vérifier Supabase Auth settings |
| `[ADMIN][STEP 4]` mais pas `[AUTH] getSession` | Callback détecté mais crash | Vérifier erreur JS |
| `[AUTH] getSession result = FAIL` | Session non créée | Vérifier Redirect URLs |
| `[ADMIN][STEP 7]` mais role ≠ admin_jtec | Profile existe mais mauvais rôle | UPDATE profiles SET role='admin_jtec' |
| `[ADMIN][BLOCKED]` | Rôle refusé | Vérifier role exact en DB |

---

## 🔧 Configuration requise

### 1. Supabase Redirect URLs

Dashboard → Auth → URL Configuration :
```
http://localhost:3000/auth/callback
https://votre-app.vercel.app/auth/callback
```

### 2. Profile admin en DB

```sql
-- Vérifier le profile
SELECT id, email, role FROM profiles WHERE email = 'votre-email@example.com';

-- Si role incorrect
UPDATE profiles 
SET role = 'admin_jtec' 
WHERE email = 'votre-email@example.com';
```

### 3. RLS Policies

Vérifier que l'utilisateur peut lire son propre profil :

```sql
-- Policy profiles SELECT
SELECT * FROM profiles WHERE id = auth.uid();
```

---

## 📝 Logs complets attendus (flux nominal)

```javascript
// === CLIC DROIT ===
[ADMIN][STEP 1] Right click detected
[ADMIN][STEP 2] Requesting magic link for admin email {email: "admin@example.com"}

// === ENVOI MAGIC LINK ===
[ADMIN][STEP 3] Magic link request sent to Supabase {email: "...", redirectTo: "..."}
[ADMIN][STEP 3] ✅ Magic link email SENT successfully {email: "...", sessionData: {...}}

// === CALLBACK APRÈS CLIC EMAIL ===
[ADMIN][STEP 4] Magic link callback detected
[ADMIN][STEP 4] Full URL: http://localhost:3000/auth/callback?next=/admin#access_token=...
[ADMIN][STEP 5] URL params parsed {queryParams: {...}, hashParams: {...}, routerQuery: {...}}

// === SESSION SUPABASE ===
[AUTH] getSession start
[AUTH] getSession result = OK
[AUTH] user.id = 12345678-1234-1234-1234-123456789abc
[AUTH] user.email = admin@example.com
[AUTH] Session details: {userId: "...", email: "...", role: "authenticated", ...}

// === PROFIL DB ===
[ADMIN][STEP 6] Loading profile for user.id 12345678-1234-1234-1234-123456789abc
[ADMIN][STEP 7] Profile loaded {id: "...", email: "...", role: "admin_jtec"}
[ADMIN][STEP 8] role = admin_jtec
[ADMIN][STEP 8] Expected: admin_jtec
[ADMIN][STEP 8] Match: true

// === REDIRECTION ===
[ADMIN][STEP 9] Access granted → redirect /admin
[ADMIN][STEP 9] Executing redirect to: /admin

// === PAGE ADMIN ===
[ADMIN] Admin page /admin loaded - verifying access...
[ADMIN] Calling checkAdminRole()...
[AUTH] checkAdminRole - Getting session...
[AUTH] checkAdminRole - Session OK, user.id = 12345678-1234-1234-1234-123456789abc
[AUTH] checkAdminRole - Fetching profile from DB...
[AUTH] checkAdminRole - Profile fetched: {id: "...", email: "...", role: "admin_jtec"}
[AUTH] checkAdminRole - Is admin? true
[ADMIN] ✅ Role check passed - user is admin_jtec {email: "...", role: "admin_jtec"}
[ADMIN] Verifying with backend /me...
[ADMIN] ✅ Backend verification passed
[ADMIN] 🎉 Full admin access granted - loading dashboard...
```

---

## 🚨 Cas d'erreur courants

### Erreur : No session after callback

**Symptômes** :
```javascript
[AUTH] getSession result = FAIL (no session)
```

**Causes possibles** :
- Redirect URL non configurée dans Supabase
- Token expiré (délai trop long entre email et clic)
- Cookies bloqués (navigation privée)

**Solution** :
1. Vérifier Supabase Dashboard → Auth → URL Configuration
2. Tester en navigation normale (pas privée)
3. Cliquer rapidement sur le lien (< 1 min)

---

### Erreur : Profile not found

**Symptômes** :
```javascript
[ADMIN][ERROR] Profile fetch failed {code: "PGRST116"}
```

**Causes possibles** :
- Profil n'existe pas en DB
- RLS policy bloque SELECT

**Solution** :
```sql
-- Créer le profil
INSERT INTO profiles (id, email, role)
VALUES (
  'user-uuid-from-auth',
  'admin@example.com',
  'admin_jtec'
);

-- Vérifier RLS
SELECT * FROM profiles WHERE id = auth.uid();
```

---

### Erreur : Role not admin

**Symptômes** :
```javascript
[ADMIN][BLOCKED] Role not admin {actualRole: "locataire", expectedRole: "admin_jtec"}
```

**Solution** :
```sql
UPDATE profiles 
SET role = 'admin_jtec' 
WHERE email = 'votre-email@example.com';
```

---

## ✅ Checklist validation

- [ ] Console ouverte (F12)
- [ ] Filtre `[ADMIN]` ou `[AUTH]` activé
- [ ] Redirect URLs configurées dans Supabase
- [ ] Profile avec `role = admin_jtec` existe en DB
- [ ] RLS policies permettent SELECT sur profiles
- [ ] Magic Link reçu par email
- [ ] Tous les logs STEP 1-9 visibles
- [ ] Redirection vers /admin fonctionne
- [ ] Dashboard admin s'affiche

---

**🎯 Avec cette instrumentation, vous saurez EXACTEMENT où le flux bloque !**
