# 🔧 GUIDE DE RÉSOLUTION : Session Stale + RLS Bloqué

**Date :** 15 décembre 2025  
**Problème :** Blocage "Chargement...", Token invalid, SELECT profiles retourne 0 ligne

---

## 🎯 PROBLÈMES IDENTIFIÉS

1. **Session stale** (> 12h) → Token expiré → Erreur "invalid JWT"
2. **RLS bloque l'accès** → `SELECT * FROM profiles WHERE id = auth.uid()` retourne 0 ligne
3. **Policies récursives** → Sous-SELECT sur profiles dans les policies

---

## 🛠 CORRECTIONS APPLIQUÉES

### 1️⃣ AuthContext : Rafraîchissement automatique de la session

**Fichier :** [context/AuthContext.js](context/AuthContext.js)

**Changement :**
```javascript
// Avant
const profileData = await getProfile();

// Après
// 1. Récupérer la session
const { data: { session } } = await supabase.auth.getSession();

// 2. Vérifier l'expiration
const hoursUntilExpiry = (session.expires_at * 1000 - Date.now()) / (1000 * 60 * 60);

// 3. Si < 1h, rafraîchir
if (hoursUntilExpiry < 1) {
  await supabase.auth.refreshSession();
}

// 4. Charger le profile
const profileData = await getProfile();
```

**Impact :**
- ✅ Session automatiquement rafraîchie si proche expiration
- ✅ Plus d'erreur "Session issued over 12h ago"
- ✅ Token toujours valide

---

### 2️⃣ getProfile : Diagnostic détaillé des erreurs RLS

**Fichier :** [lib/api.js](lib/api.js#L100-L125)

**Changement :**
```javascript
if (profileError) {
  console.error('[getProfile] Code:', profileError.code);
  console.error('[getProfile] Message:', profileError.message);
  console.error('[getProfile] Details:', profileError.details);
  
  // Si PGRST116 = No rows found
  if (profileError.code === 'PGRST116') {
    console.error('[getProfile] ⚠️ Profile existe mais RLS bloque l\'accès');
    throw new Error('RLS bloque l\'accès au profil (policy manquante ou récursive)');
  }
}
```

**Impact :**
- ✅ Messages d'erreur clairs
- ✅ Distinction entre "profile inexistant" et "RLS bloque"
- ✅ Logs détaillés pour debug

---

## 📋 ÉTAPES DE VALIDATION

### ÉTAPE 1 : Exécuter le test SQL de diagnostic

**Fichier :** [supabase/TEST_RLS_DIAGNOSTIC.sql](supabase/TEST_RLS_DIAGNOSTIC.sql)

1. Ouvrir **Supabase SQL Editor**
2. Copier le contenu du fichier
3. Exécuter les requêtes **une par une**
4. Noter les résultats

**Vérifications critiques :**

| Test | Résultat attendu | Si échec |
|------|------------------|----------|
| `SELECT auth.uid()` | UUID (pas NULL) | Pas de session active |
| `SELECT * FROM profiles WHERE id = auth.uid()` | 1 ligne | Profile n'existe pas |
| RLS enabled | `true` | Activer RLS |
| Policy `users_view_own_profile` existe | Oui | Créer la policy |
| Role dans JWT | `admin_jtec` | Trigger non exécuté |

---

### ÉTAPE 2 : Appliquer le fix RLS si nécessaire

**Fichier :** [supabase/FIX_RECURSION_RLS_DEFINITIF.sql](supabase/FIX_RECURSION_RLS_DEFINITIF.sql)

**Quand l'appliquer :**
- Si `SELECT * FROM profiles WHERE id = auth.uid()` retourne 0 ligne
- Si les logs montrent "infinite recursion detected"
- Si les policies contiennent des sous-SELECT sur profiles

**Comment :**
1. Ouvrir Supabase SQL Editor
2. Copier le contenu du fichier
3. Exécuter le script complet
4. Vérifier : `SELECT * FROM profiles WHERE id = auth.uid();` → doit retourner 1 ligne

---

### ÉTAPE 3 : Tester en local

```bash
# 1. Build
npm run build

# 2. Lancer en local
npm start

# 3. Ouvrir http://localhost:3000
# 4. Se connecter avec Magic Link
# 5. Observer les logs console :

[AuthProvider] 🔄 Chargement profile...
[AuthProvider] Session expire dans: 2.50 heures
[AuthProvider] ✅ Session valide
[getProfile] Récupération profile pour user: abc123...
[getProfile] OK: { id: 'abc123', role: 'admin_jtec', email: '...' }
[AuthProvider] ✅ Profile chargé, role: admin_jtec
```

**Si erreur :**
```
[getProfile] ❌ Erreur récupération profile:
[getProfile] Code: PGRST116
[getProfile] Message: No rows found
[getProfile] ⚠️ Profile existe mais RLS bloque l'accès
```
→ Exécuter [FIX_RECURSION_RLS_DEFINITIF.sql](supabase/FIX_RECURSION_RLS_DEFINITIF.sql)

---

### ÉTAPE 4 : Tester en production (Vercel)

1. **Déployer** sur Vercel
2. **Se connecter** avec Magic Link
3. **Vérifier logs Vercel** (Runtime Logs) :

```
[AuthProvider] Session expire dans: 0.8 heures
[AuthProvider] ⚠️ Session proche expiration, rafraîchissement...
[AuthProvider] ✅ Session rafraîchie
```

4. **Ouvrir** `/admin/jetc`
5. **Vérifier** :
   - Page affichée (pas de "Chargement..." infini)
   - Pas d'erreur 500 ou 401 dans Network
   - UserBadge affiche correctement

---

## 🔍 DIAGNOSTIC RAPIDE

### Symptôme 1 : "Session issued over 12h ago"

**Cause :** Session expirée, pas rafraîchie  
**Solution :** ✅ Corrigé dans AuthContext (refresh automatique)

---

### Symptôme 2 : "Token invalid: invalid JWT"

**Cause :** Token expiré envoyé à l'API  
**Solution :** ✅ Corrigé avec refresh session + utilisation session.access_token

---

### Symptôme 3 : "SELECT profiles WHERE id = auth.uid() retourne 0 ligne"

**Cause :** RLS bloque l'accès (policy récursive ou manquante)  
**Solution :** Exécuter [FIX_RECURSION_RLS_DEFINITIF.sql](supabase/FIX_RECURSION_RLS_DEFINITIF.sql)

**Vérifier en SQL :**
```sql
-- Test 1 : auth.uid() retourne-t-il un UUID ?
SELECT auth.uid();

-- Test 2 : Le profile existe-t-il ?
SELECT * FROM profiles WHERE id = auth.uid();

-- Test 3 : Y a-t-il une policy users_view_own_profile ?
SELECT policyname FROM pg_policies WHERE tablename = 'profiles';

-- Test 4 : Le role est-il dans le JWT ?
SELECT (auth.jwt() ->> 'role')::text;
```

---

### Symptôme 4 : Erreur PGRST116 "No rows found"

**Cause :** RLS bloque l'accès  
**Solution :**

1. Vérifier que RLS est activé :
   ```sql
   SELECT rowsecurity FROM pg_tables WHERE tablename = 'profiles';
   ```

2. Vérifier la policy :
   ```sql
   SELECT policyname, qual FROM pg_policies WHERE tablename = 'profiles';
   ```

3. Si policy manquante, créer :
   ```sql
   CREATE POLICY "users_view_own_profile"
   ON profiles FOR SELECT
   USING (id = auth.uid());
   ```

---

## 🎯 CHECKLIST FINALE

- [ ] **SQL** : Exécuter [TEST_RLS_DIAGNOSTIC.sql](supabase/TEST_RLS_DIAGNOSTIC.sql)
- [ ] **SQL** : `SELECT auth.uid()` retourne un UUID
- [ ] **SQL** : `SELECT * FROM profiles WHERE id = auth.uid()` retourne 1 ligne
- [ ] **SQL** : Policy `users_view_own_profile` existe
- [ ] **SQL** : Role dans JWT : `SELECT (auth.jwt() ->> 'role')::text` retourne `admin_jtec`
- [ ] **Code** : AuthContext rafraîchit la session si < 1h
- [ ] **Code** : getProfile log les erreurs RLS en détail
- [ ] **Build** : `npm run build` compile sans erreur
- [ ] **Local** : Se connecter et voir `/admin/jetc` sans blocage
- [ ] **Prod** : Déployer et tester avec Magic Link
- [ ] **Logs** : Vérifier Vercel Runtime Logs (pas d'erreur 500/401)

---

## 📞 SI ÇA NE FONCTIONNE TOUJOURS PAS

1. **Partager les résultats de [TEST_RLS_DIAGNOSTIC.sql](supabase/TEST_RLS_DIAGNOSTIC.sql)**
2. **Partager les logs Vercel** (spécifiquement les lignes avec `[AuthProvider]` et `[getProfile]`)
3. **Vérifier que le fix RLS a bien été appliqué** :
   ```sql
   SELECT policyname, LEFT(qual::text, 100) FROM pg_policies WHERE tablename = 'profiles';
   ```

---

**Statut :** Corrections appliquées, prêtes pour test
