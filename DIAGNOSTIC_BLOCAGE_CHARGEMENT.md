# DIAGNOSTIC BLOCAGE "Chargement..."

## POINTS DE CONTRÔLE INSTRUMENTÉS

### 1. Fichier: `pages/admin/jetc.js`

**Composant bloquant**: AdminJetcPage  
**Condition de blocage**: `if (!profile)` ligne 160

#### Console logs ajoutés:

```javascript
[ADMIN INIT] Démarrage vérification
[ADMIN SESSION] { hasSession, userId, error }
[ADMIN PROFILE] { hasProfile, role, email, error }
[ADMIN REDIRECT] Profile invalide ou pas admin_jtec → /login
[ADMIN SUCCESS] Profile valide, setState(profile)
[ADMIN UNMOUNTED] Composant démonté avant setState
[ADMIN CLEANUP] Composant démonté
[ADMIN RENDER] Blocage: profile === null
[ADMIN RENDER] Profile chargé, affichage vue admin
[ADMIN REQUESTS] Chargement des demandes
```

#### Scénarios de blocage possibles:

**A. Session nulle**
- `session === null` → redirect /login (pas de blocage)
- Log: `[ADMIN SESSION] { hasSession: false }`

**B. Profile invalide**
- `profileData === null` → redirect /login (pas de blocage)  
- `profileData.role !== "admin_jtec"` → redirect /login (pas de blocage)
- Log: `[ADMIN REDIRECT]`

**C. Composant démonté prématurément**
- `mounted === false` avant `setProfile()`
- Log: `[ADMIN UNMOUNTED]`
- **CAUSE**: useEffect cleanup exécuté pendant l'async
- **RÉSULTAT**: profile reste null indéfiniment

**D. Erreur Supabase silencieuse**
- Error dans getSession() mais pas de throw
- Error dans profiles query mais pas de throw
- Log: `[ADMIN PROFILE] { error: {...} }`

---

### 2. Fichier: `components/Layout.js`

**Composant**: Layout (wrapper global)  
**État bloquant**: `loading === true` (non utilisé dans render mais existe)

#### Console logs ajoutés:

```javascript
[LAYOUT INIT] Chargement du profile
[LAYOUT PROFILE] { hasUser, role, email }
```

#### Impact potentiel:

Le Layout charge **aussi** le profile via `getProfile()` depuis `lib/api.js`.

**CONFLIT POSSIBLE**: 
- AdminJetcPage charge le profile en interne
- Layout charge AUSSI le profile en parallèle
- Si Layout bloque ou ralentit → cascade de retard

**Note**: Layout ne bloque PAS le render (pas de guard `if (loading)`), mais les 2 appels parallèles à Supabase peuvent causer race conditions.

---

### 3. Fichier: `lib/api.js`

**Fonction**: `getProfile()`  
**Utilisée par**: Layout.js

#### Console logs ajoutés:

```javascript
[API getProfile] Début récupération
[API getProfile] Session { hasSession, userId, error }
[API getProfile] Résultat { hasProfile, role, email, error }
```

#### Points de blocage:

**A. Session check multiple**
- AdminJetcPage appelle `supabase.auth.getSession()` directement
- Layout appelle `getProfile()` qui appelle AUSSI `supabase.auth.getSession()`
- **DOUBLON**: 2 appels getSession() pour la même page

**B. RLS policies**
- Si RLS bloque la requête `profiles.select()` silencieusement
- `error !== null` MAIS pas de throw
- Fonction retourne `null` sans alerter

---

## HYPOTHÈSES DE BLOCAGE PAR PRIORITÉ

### 🔴 PRIORITÉ 1: Composant démonté prématurément

**Fichier**: `pages/admin/jetc.js`  
**Ligne**: 17-50

**Condition**:
```javascript
useEffect(() => {
  let mounted = true;
  async function init() {
    // ... await async calls ...
    if (mounted) {  // ← VÉRIFICATION
      setProfile(profileData);
    }
  }
  init();
  return () => { mounted = false; }; // ← CLEANUP
}, [router]);
```

**Blocage si**:
- `router` change PENDANT l'async (navigation détectée)
- useEffect cleanup exécuté → `mounted = false`
- `setProfile()` jamais appelé
- profile reste `null` indéfiniment
- Affichage bloqué sur "Chargement..."

**Log diagnostic**:  
`[ADMIN UNMOUNTED] Composant démonté avant setState`

**Correction minimale**:
Retirer la dépendance `[router]` du useEffect pour éviter le re-run.

---

### 🟠 PRIORITÉ 2: Erreur Supabase silencieuse

**Fichier**: `pages/admin/jetc.js`  
**Ligne**: 28-33

**Condition**:
```javascript
const { data: profileData, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', session.user.id)
  .single();

if (!profileData || profileData.role !== "admin_jtec") {
  router.replace("/login");
  return;
}
```

**Blocage si**:
- `profileError !== null` MAIS `profileData !== null` (données partielles)
- `profileData.role === undefined` (colonne manquante)
- Redirect /login déclenché MAIS router.replace() échoue silencieusement
- Composant reste monté avec profile = null

**Log diagnostic**:  
`[ADMIN PROFILE] { hasProfile: true, role: undefined, error: {...} }`

**Correction minimale**:
Vérifier `profileError` explicitement avant de vérifier `profileData`.

---

### 🟡 PRIORITÉ 3: Double chargement profile (Layout + AdminJetcPage)

**Fichiers**: 
- `components/Layout.js` ligne 16-23
- `pages/admin/jetc.js` ligne 17-50

**Condition**:
- Layout appelle `getProfile()` (lib/api.js)
- AdminJetcPage appelle `supabase.auth.getSession()` + `supabase.from('profiles')`
- 2 appels parallèles à Supabase
- Race condition possible si RLS policies ralentissent une requête

**Log diagnostic**:
```
[LAYOUT INIT] Chargement du profile
[ADMIN INIT] Démarrage vérification
[API getProfile] Début récupération
[ADMIN SESSION] { hasSession: true, userId: "..." }
[API getProfile] Session { hasSession: true, userId: "..." }
```

**Impact**: Pas un blocage direct, mais peut masquer d'autres problèmes.

**Correction minimale**:
Aucun changement nécessaire si les logs montrent que les 2 réussissent.

---

## TESTS À EFFECTUER

### Test 1: Vérifier si le composant se démonte

1. Ouvrir DevTools Console
2. Naviguer vers `/admin/jetc` après Magic Link
3. Chercher dans les logs:

**SI BLOCAGE PAR DÉMONTAGE**:
```
[ADMIN INIT] Démarrage vérification
[ADMIN SESSION] { hasSession: true, userId: "..." }
[ADMIN PROFILE] { hasProfile: true, role: "admin_jtec", ... }
[ADMIN CLEANUP] Composant démonté  ← ⚠️ AVANT setState
[ADMIN RENDER] Blocage: profile === null  ← ♾️ BOUCLE
```

**CORRECTION**: Retirer `[router]` des dépendances useEffect.

---

### Test 2: Vérifier les erreurs Supabase

1. Chercher dans les logs:

**SI ERREUR SUPABASE**:
```
[ADMIN PROFILE] { 
  hasProfile: false, 
  role: undefined, 
  error: { code: "...", message: "..." } 
}
```

**CORRECTION**: Vérifier les RLS policies pour `profiles` table.

---

### Test 3: Vérifier la session

1. Chercher dans les logs:

**SI SESSION INVALIDE**:
```
[ADMIN SESSION] { hasSession: false, userId: undefined }
[ADMIN REDIRECT] Pas de session → /login
```

**RÉSULTAT**: Le redirect fonctionne, pas de blocage (Magic Link cassé).

---

## CORRECTION MINIMALE PROPOSÉE

### Si diagnostic = PRIORITÉ 1 (composant démonté)

**Fichier**: `pages/admin/jetc.js`  
**Ligne**: 50

**AVANT**:
```javascript
}, [router]);
```

**APRÈS**:
```javascript
}, []); // Retirer router des dépendances
```

**Explication**: 
- Le useEffect doit s'exécuter UNE SEULE FOIS au mount
- `router` dans les dépendances force un re-run si router change
- Pendant l'async, si router change → cleanup → mounted = false
- setState jamais appelé → profile reste null

---

### Si diagnostic = PRIORITÉ 2 (erreur Supabase)

**Fichier**: `pages/admin/jetc.js`  
**Ligne**: 28-40

**AVANT**:
```javascript
const { data: profileData, error: profileError } = await supabase...;

if (!profileData || profileData.role !== "admin_jtec") {
  router.replace("/login");
  return;
}
```

**APRÈS**:
```javascript
const { data: profileData, error: profileError } = await supabase...;

if (profileError) {
  console.error('[ADMIN ERROR] Erreur requête profile:', profileError);
  router.replace("/login");
  return;
}

if (!profileData || profileData.role !== "admin_jtec") {
  router.replace("/login");
  return;
}
```

---

## COMMANDES POUR TESTER

```bash
# Build et démarrage dev
npm run dev

# Ouvrir navigateur
$BROWSER http://localhost:3000/admin/jetc

# Ouvrir DevTools Console
# Regarder les logs [ADMIN ...] [LAYOUT ...] [API ...]
```

---

## RÉSUMÉ

**Variable bloquante**: `profile` (state dans AdminJetcPage)  
**Condition bloquante**: `if (!profile)` ligne 160  
**Cause probable #1**: useEffect cleanup exécuté avant setState (mounted = false)  
**Cause probable #2**: Erreur Supabase silencieuse (RLS ou query error)  
**Correction minimale #1**: Retirer `router` des dépendances useEffect  
**Correction minimale #2**: Vérifier `profileError` explicitement

**PROCHAINE ÉTAPE**: Exécuter `npm run dev` et analyser les console.logs pour confirmer le diagnostic.
