# 🔐 ADMIN MAGIC LINK - Guide de Debugging

## 📋 Vue d'ensemble du flux

Flux d'authentification admin par Magic Link déclenché par **clic droit** sur le logo JETC IMMO.

**Durée totale** : ~30 secondes (+ temps de réception email)

---

## 🔄 Flux complet (10 étapes)

### ÉTAPE 1-4 : Déclenchement Magic Link

**Localisation** : `components/Layout.js` + `lib/adminAuth.js`

```
[ADMIN-AUTH][1] RightClick detected on logo
[ADMIN-AUTH][2] Email validated
[ADMIN-AUTH][3] Calling supabase.auth.signInWithOtp...
[ADMIN-AUTH][4] OTP request SUCCESS (mail should be sent)
```

**Actions** :
1. Clic droit sur logo "🏢 JETC IMMO"
2. Email récupéré du profile (ou prompt)
3. Envoi Magic Link via `supabase.auth.signInWithOtp()`
4. Confirmation envoi email

**Fichiers concernés** :
- `components/Layout.js` (handler `handleAdminRightClick`)
- `lib/adminAuth.js` (fonction `sendAdminMagicLink`)

---

### ÉTAPE 5-8 : Callback après clic sur Magic Link

**Localisation** : `pages/auth/callback.js`

```
[ADMIN-AUTH][5] Callback loaded
[ADMIN-AUTH][6] Session OK / Session FAIL
[ADMIN-AUTH][7] Profile fetch OK + role
[ADMIN-AUTH][8] Role OK -> redirect /admin
```

**Actions** :
1. Redirection vers `/auth/callback?next=/admin`
2. Récupération session Supabase
3. Fetch du profile (role, email)
4. Vérification role === 'admin_jtec'
5. Redirection vers destination

**Fichiers concernés** :
- `pages/auth/callback.js`

**Comportement** :
- ✅ Si role = admin_jtec → Redirect `/admin`
- ❌ Si role ≠ admin_jtec → Redirect `/` + message erreur

---

### ÉTAPE 9-10 : Accès page Admin

**Localisation** : `pages/admin/index.js`

```
[ADMIN-AUTH][9] Admin page loaded
[ADMIN-AUTH][10] Admin access granted
```

**Actions** :
1. Vérification session Supabase
2. Fetch profile + vérification role
3. Double vérification via API backend `/me`
4. Chargement dashboard si OK

**Fichiers concernés** :
- `pages/admin/index.js`
- `lib/adminAuth.js` (fonction `checkAdminRole`)

**Comportement** :
- ✅ Si role = admin_jtec → Affichage dashboard
- ❌ Si role ≠ admin_jtec → Écran "Accès refusé" + redirect

---

## 🐛 Debugging par étape

### ❌ Bloqué à l'étape [1]

**Symptôme** : Pas de log après clic droit

**Causes possibles** :
- Clic droit ne déclenche pas l'event
- Console bloquée par navigateur

**Solutions** :
```javascript
// Tester dans la console navigateur
console.log("Test console OK");

// Vérifier event handler sur le logo
document.querySelector('h1').oncontextmenu = (e) => {
  console.log("Clic droit détecté");
  e.preventDefault();
};
```

---

### ❌ Bloqué à l'étape [2]

**Symptôme** : `[ADMIN-AUTH][2] Email validation FAILED`

**Causes possibles** :
- Email vide ou invalide
- Annulation du prompt

**Solutions** :
- Vérifier que l'email contient '@'
- Si profile existe, vérifier `profile.email` dans le state
- Forcer un email valide via prompt

---

### ❌ Bloqué à l'étape [3-4]

**Symptôme** : `[ADMIN-AUTH][4] OTP request FAILED`

**Causes possibles** :
- Variables Supabase mal configurées
- Email non autorisé dans Supabase Auth
- Quota Supabase dépassé

**Solutions** :
```bash
# Vérifier variables d'environnement
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...

# Dans Supabase Dashboard
Authentication → Email Templates → Magic Link activé
Authentication → Providers → Email activé
```

**Vérifier logs Supabase** :
- Dashboard → Logs → Auth Logs
- Chercher erreur `signInWithOtp`

---

### ❌ Bloqué à l'étape [5]

**Symptôme** : Callback ne charge jamais

**Causes possibles** :
- Redirect URL mal configuré
- Page `/auth/callback` n'existe pas
- Erreur 404

**Solutions** :
```bash
# Vérifier fichier existe
ls pages/auth/callback.js

# Vérifier redirect URL dans Supabase
Dashboard → Authentication → URL Configuration
→ Redirect URLs : http://localhost:3000/auth/callback
                   https://votre-domaine.vercel.app/auth/callback
```

---

### ❌ Bloqué à l'étape [6]

**Symptôme** : `[ADMIN-AUTH][6] Session FAIL`

**Causes possibles** :
- Code Magic Link expiré (>1h)
- Code déjà utilisé
- Session corrompue

**Solutions** :
```javascript
// Dans la console de /auth/callback
const { data, error } = await supabase.auth.getSession();
console.log("Session:", data, "Error:", error);

// Effacer session et réessayer
await supabase.auth.signOut();
```

---

### ❌ Bloqué à l'étape [7]

**Symptôme** : `[ADMIN-AUTH][7] Profile fetch FAIL`

**Causes possibles** :
- Table `profiles` vide pour cet user
- RLS bloque l'accès
- User non créé dans profiles

**Solutions** :
```sql
-- Vérifier profile existe
SELECT * FROM profiles WHERE id = 'USER_ID';

-- Si absent, créer manuellement
INSERT INTO public.profiles (id, email, role)
VALUES ('USER_ID', 'admin@example.com', 'admin_jtec');

-- Vérifier policies RLS
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

**Policies requises** :
- `profiles_select_own` : Lecture de son propre profile
- `profiles_select_admin` : Admin peut tout lire

---

### ❌ Bloqué à l'étape [8]

**Symptôme** : `[ADMIN-AUTH][8] Role NOT admin -> redirect denied`

**Causes possibles** :
- Role dans DB ≠ 'admin_jtec'
- Typo dans le role (majuscules, espaces)

**Solutions** :
```sql
-- Vérifier role exact
SELECT id, email, role FROM profiles WHERE email = 'admin@example.com';

-- Corriger role
UPDATE profiles 
SET role = 'admin_jtec' 
WHERE email = 'admin@example.com';
```

**Valeur EXACTE requise** : `admin_jtec` (lowercase, underscore)

---

### ❌ Bloqué à l'étape [9-10]

**Symptôme** : Écran "Accès refusé" sur `/admin`

**Causes possibles** :
- Session expirée entre callback et accès admin
- API backend `/me` renvoie role différent
- Double vérification échoue

**Solutions** :
```javascript
// Tester dans console de /admin
import { checkAdminRole } from '../../lib/adminAuth';
const result = await checkAdminRole();
console.log(result);

// Tester API backend
const response = await fetch('/api/me');
const data = await response.json();
console.log("Backend role:", data.role);
```

---

## 📊 Logs attendus (flux nominal)

```
[ADMIN-AUTH][1] RightClick detected on logo
  └─ Timestamp: 2025-12-16T10:30:00.000Z

[ADMIN-AUTH][2] Email validated { email: 'admin@example.com' }
  └─ Timestamp: 2025-12-16T10:30:00.100Z

[ADMIN-AUTH][3] Calling supabase.auth.signInWithOtp... { 
  email: 'admin@example.com',
  redirectTo: 'http://localhost:3000/auth/callback?next=/admin'
}
  └─ Timestamp: 2025-12-16T10:30:00.200Z

[ADMIN-AUTH][4] OTP request SUCCESS (mail should be sent) {
  data: {...},
  email: 'admin@example.com'
}
  └─ Timestamp: 2025-12-16T10:30:01.500Z

--- Attente clic sur Magic Link dans email ---

[ADMIN-AUTH][5] Callback loaded {
  url: 'http://localhost:3000/auth/callback?next=/admin&token=...',
  params: { next: '/admin', token: '...' }
}
  └─ Timestamp: 2025-12-16T10:30:45.000Z

[ADMIN-AUTH][6] Session OK {
  userId: 'abc-123-def',
  email: 'admin@example.com'
}
  └─ Timestamp: 2025-12-16T10:30:45.300Z

[ADMIN-AUTH][7] Profile fetch OK {
  role: 'admin_jtec',
  email: 'admin@example.com'
}
  └─ Timestamp: 2025-12-16T10:30:45.600Z

[ADMIN-AUTH][8] Role OK -> redirect { destination: '/admin' }
  └─ Timestamp: 2025-12-16T10:30:45.700Z

--- Redirection vers /admin ---

[ADMIN-AUTH][9] Admin page loaded
  └─ Timestamp: 2025-12-16T10:30:46.000Z

[ADMIN-AUTH][7] Profile fetched {
  role: 'admin_jtec',
  email: 'admin@example.com',
  isAdmin: true
}
  └─ Timestamp: 2025-12-16T10:30:46.300Z

[ADMIN-AUTH][10] Admin access granted {
  email: 'admin@example.com',
  role: 'admin_jtec'
}
  └─ Timestamp: 2025-12-16T10:30:46.600Z

--- Dashboard admin chargé ---
```

**Durée totale** : ~1 seconde (hors délai email)

---

## 🔧 Outils de diagnostic

### Console Navigateur

```javascript
// Filtrer logs admin
// Chrome DevTools → Console → Filter: [ADMIN-AUTH]

// Tester manuellement
import { sendAdminMagicLink } from './lib/adminAuth';
await sendAdminMagicLink('admin@example.com');
```

### Supabase Dashboard

**Auth Logs** :
- Dashboard → Authentication → Logs
- Filtrer : `signInWithOtp`, `exchangeCode`

**Database Logs** :
- Dashboard → Database → Logs
- Filtrer : `SELECT * FROM profiles`

**SQL Editor** :
```sql
-- Vérifier user admin existe
SELECT id, email, role, created_at 
FROM profiles 
WHERE role = 'admin_jtec';

-- Vérifier policies RLS
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
```

---

## 📝 Checklist de validation

- [ ] Clic droit sur logo déclenche log [1]
- [ ] Email validé (log [2])
- [ ] Magic Link envoyé sans erreur (log [4])
- [ ] Email reçu dans boîte mail
- [ ] Clic sur Magic Link redirige vers `/auth/callback`
- [ ] Callback affiche "Traitement..." puis "Accès admin autorisé"
- [ ] Logs [5-8] affichés dans console
- [ ] Redirection automatique vers `/admin`
- [ ] Page admin charge avec dashboard (logs [9-10])
- [ ] Aucune erreur 500 ou RLS dans logs Supabase

---

## ⚙️ Configuration Supabase requise

### Authentication

```
Dashboard → Authentication → Providers
✅ Email (Magic Link) : Enabled

Dashboard → Authentication → Email Templates
✅ Magic Link : Active (template par défaut OK)

Dashboard → Authentication → URL Configuration
✅ Site URL : http://localhost:3000 (dev)
✅ Redirect URLs :
   - http://localhost:3000/auth/callback
   - https://votre-app.vercel.app/auth/callback
```

### RLS Policies (profiles)

```sql
-- Policy 1 : Lecture de son propre profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Policy 2 : Admin peut tout lire
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin_jtec'
    )
  );

-- Policy 3 : Insert son propre profile
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy 4 : Update son propre profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

---

## 🚨 Erreurs courantes

### "Email not confirmed"

**Cause** : Supabase en mode "Confirm email" activé  
**Solution** : Dashboard → Auth → Settings → Disable email confirmations (dev only)

### "Invalid redirect URL"

**Cause** : URL callback non autorisée  
**Solution** : Ajouter URL dans Auth → URL Configuration → Redirect URLs

### "Row level security policy violation"

**Cause** : RLS bloque l'accès au profile  
**Solution** : Vérifier policies ci-dessus sont créées et actives

### "Role undefined"

**Cause** : Profile existe mais colonne `role` NULL  
**Solution** : `UPDATE profiles SET role = 'admin_jtec' WHERE id = '...'`

---

**Dernière mise à jour** : 16 décembre 2025  
**Version** : 1.0  
**Contact** : Consulter logs [ADMIN-AUTH] en cas de problème
