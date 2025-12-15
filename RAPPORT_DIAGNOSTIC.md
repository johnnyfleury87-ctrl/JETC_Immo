# 🔍 RAPPORT DE DIAGNOSTIC - Blocage "Chargement..."

## ✅ INSTRUMENTATION COMPLÉTÉE

J'ai ajouté des **console.log structurés** dans 3 fichiers critiques pour diagnostiquer EXACTEMENT où le code bloque.

---

## 📍 FICHIERS MODIFIÉS

### 1. [`pages/admin/jetc.js`](pages/admin/jetc.js)

**Logs ajoutés**:
- `[ADMIN INIT]` → Début du useEffect
- `[ADMIN SESSION]` → Résultat getSession() avec hasSession, userId, error
- `[ADMIN PROFILE]` → Résultat query profiles avec hasProfile, role, email, error
- `[ADMIN REDIRECT]` → Si redirect vers /login déclenché
- `[ADMIN SUCCESS]` → Si setState(profile) exécuté
- `[ADMIN UNMOUNTED]` → Si composant démonté AVANT setState
- `[ADMIN CLEANUP]` → Lors du démontage du composant
- `[ADMIN RENDER]` → Au moment du render (profile null ou chargé)
- `[ADMIN REQUESTS]` → Chargement des demandes d'adhésion

### 2. [`components/Layout.js`](components/Layout.js)

**Logs ajoutés**:
- `[LAYOUT INIT]` → Début du chargement profile dans Layout
- `[LAYOUT PROFILE]` → Résultat getProfile() avec hasUser, role, email

### 3. [`lib/api.js`](lib/api.js)

**Logs ajoutés**:
- `[API getProfile]` → Début, session, résultat avec hasProfile, role, email, error

---

## 🎯 POINTS DE BLOCAGE IDENTIFIÉS

### 🔴 HYPOTHÈSE #1 (Priorité HAUTE) : Composant démonté prématurément

**Fichier**: [pages/admin/jetc.js](pages/admin/jetc.js#L50)  
**Problème**: useEffect avec dépendance `[router]`

```javascript
useEffect(() => {
  let mounted = true;
  async function init() {
    // ... appels async ...
    if (mounted) {  // ← Peut être false si cleanup exécuté
      setProfile(profileData);
    }
  }
  init();
  return () => { mounted = false; };
}, [router]); // ← PROBLÈME ICI
```

**Scénario de blocage**:
1. Page `/admin/jetc` charge
2. useEffect démarre l'async init()
3. Pendant l'attente des requêtes Supabase, Next.js détecte un changement de route
4. useEffect cleanup s'exécute → `mounted = false`
5. Quand profileData arrive, `if (mounted)` est false
6. `setProfile()` jamais appelé
7. `profile` reste `null` indéfiniment
8. Render bloqué sur `if (!profile)` → "Chargement..."

**Log attendu si c'est ça**:
```
[ADMIN INIT] Démarrage vérification
[ADMIN SESSION] { hasSession: true, userId: "..." }
[ADMIN PROFILE] { hasProfile: true, role: "admin_jtec", ... }
[ADMIN CLEANUP] Composant démonté  ← ⚠️ AVANT setState
[ADMIN UNMOUNTED] Composant démonté avant setState
[ADMIN RENDER] Blocage: profile === null  ← ♾️ BOUCLE INFINIE
```

**Correction minimale**:
```javascript
}, []); // Retirer router des dépendances
```

---

### 🟠 HYPOTHÈSE #2 (Priorité MOYENNE) : Erreur Supabase silencieuse

**Fichier**: [pages/admin/jetc.js](pages/admin/jetc.js#L28-L40)  
**Problème**: `profileError` non vérifié explicitement

**Scénario de blocage**:
1. Query profiles réussit partiellement
2. `profileError !== null` MAIS `profileData !== null` (données incomplètes)
3. `profileData.role === undefined` (colonne manquante dans RLS)
4. Condition `profileData.role !== "admin_jtec"` → true
5. `router.replace("/login")` appelé MAIS échoue silencieusement
6. Composant reste monté avec `profile = null`
7. Render bloqué sur "Chargement..."

**Log attendu si c'est ça**:
```
[ADMIN SESSION] { hasSession: true, userId: "..." }
[ADMIN PROFILE] { hasProfile: true, role: undefined, error: { code: "...", message: "..." } }
[ADMIN REDIRECT] Profile invalide ou pas admin_jtec → /login
[ADMIN RENDER] Blocage: profile === null  ← ♾️ BOUCLE
```

**Correction minimale**:
```javascript
if (profileError) {
  console.error('[ADMIN ERROR]', profileError);
  router.replace("/login");
  return;
}
```

---

### 🟡 HYPOTHÈSE #3 (Priorité BASSE) : Double chargement profile

**Fichiers**: 
- [components/Layout.js](components/Layout.js#L16-L23)
- [pages/admin/jetc.js](pages/admin/jetc.js#L17-L50)

**Observation**: Les 2 composants chargent le profile indépendamment
- Layout → `getProfile()` (lib/api.js)
- AdminJetcPage → `supabase.auth.getSession()` + `supabase.from('profiles')`

**Impact**: Pas un blocage direct, mais peut masquer d'autres problèmes par race condition.

---

## 🧪 TESTS À EXÉCUTER

### Étape 1: Démarrer le serveur dev

```bash
npm run dev
```

### Étape 2: Ouvrir la console navigateur

1. Ouvrir DevTools (F12)
2. Onglet Console
3. Filtrer sur "ADMIN" pour voir uniquement les logs pertinents

### Étape 3: Se connecter via Magic Link

1. Connexion admin
2. Navigation vers `/admin/jetc`
3. **OBSERVER LES LOGS DANS LA CONSOLE**

### Étape 4: Analyser les logs

**CAS A - Blocage par démontage** (HYPOTHÈSE #1):
```
[ADMIN INIT] ...
[ADMIN SESSION] { hasSession: true, ... }
[ADMIN PROFILE] { hasProfile: true, role: "admin_jtec", ... }
[ADMIN CLEANUP] Composant démonté  ← ⚠️ PROBLÈME
[ADMIN UNMOUNTED] ...
[ADMIN RENDER] Blocage: profile === null  ← SE RÉPÈTE
```

**CAS B - Blocage par erreur Supabase** (HYPOTHÈSE #2):
```
[ADMIN SESSION] { hasSession: true, ... }
[ADMIN PROFILE] { hasProfile: false/true, role: undefined, error: {...} }  ← ⚠️ PROBLÈME
[ADMIN REDIRECT] ...
[ADMIN RENDER] Blocage: profile === null  ← SE RÉPÈTE
```

**CAS C - Session invalide** (pas un blocage):
```
[ADMIN SESSION] { hasSession: false, ... }  ← ⚠️ Magic Link cassé
[ADMIN REDIRECT] Pas de session → /login
```

**CAS D - Tout fonctionne**:
```
[ADMIN INIT] ...
[ADMIN SESSION] { hasSession: true, ... }
[ADMIN PROFILE] { hasProfile: true, role: "admin_jtec", ... }
[ADMIN SUCCESS] Profile valide, setState(profile)
[ADMIN RENDER] Profile chargé, affichage vue admin  ← ✅ SUCCÈS
[ADMIN REQUESTS] Chargement des demandes, filter = pending
```

---

## 🔧 CORRECTIONS PROPOSÉES

### Si diagnostic = CAS A (composant démonté)

**Fichier**: [pages/admin/jetc.js](pages/admin/jetc.js#L50)

**Changement**: Retirer `router` des dépendances useEffect

**Ligne 50, AVANT**:
```javascript
  }, [router]);
```

**Ligne 50, APRÈS**:
```javascript
  }, []);
```

**Explication**: 
- Le useEffect doit s'exécuter UNE SEULE FOIS au montage
- `router` dans les dépendances force un re-run à chaque changement
- Pendant l'async, si router change → cleanup → setState annulé

---

### Si diagnostic = CAS B (erreur Supabase)

**Fichier**: [pages/admin/jetc.js](pages/admin/jetc.js#L28-L40)

**Changement**: Vérifier `profileError` explicitement

**Lignes 28-40, AJOUTER**:
```javascript
if (profileError) {
  console.error('[ADMIN ERROR] Erreur requête profile:', profileError);
  router.replace("/login");
  return;
}
```

**Avant la condition existante**:
```javascript
if (!profileData || profileData.role !== "admin_jtec") {
  ...
}
```

---

## 📊 RÉSUMÉ

| Élément | Valeur |
|---------|--------|
| **Variable bloquante** | `profile` (state AdminJetcPage) |
| **Condition bloquante** | `if (!profile)` ligne 160 |
| **Rendu bloqué** | `<p>Chargement...</p>` |
| **Cause probable #1** | useEffect cleanup avant setState (mounted = false) |
| **Cause probable #2** | Erreur Supabase non gérée (RLS ou query error) |
| **Fichiers instrumentés** | 3 (admin/jetc.js, Layout.js, lib/api.js) |
| **Build status** | ✅ RÉUSSI |

---

## ⚡ PROCHAINE ACTION

**EXÉCUTER LES TESTS** et **ANALYSER LES LOGS** pour confirmer le diagnostic.

Une fois les logs analysés:
1. **Copier les logs de la console** dans le chat
2. Je confirmerai le diagnostic précis
3. J'appliquerai la **correction minimale** adaptée

**AUCUNE MODIFICATION** ne sera faite avant d'avoir vu les logs réels.
