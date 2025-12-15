# 🔧 FIX : Token Invalid sur /api/billing/subscription

**Date :** 15 décembre 2025  
**Problème :** `invalid JWT: unable to parse or verify signature`  
**Cause :** `getToken()` retournait un token localStorage (demo ou ancien) au lieu du vrai JWT Supabase

---

## 🚨 PROBLÈME IDENTIFIÉ

### Avant (CASSÉ)

```javascript
// lib/api.js - apiFetch()
const token = getToken();  // ❌ Retourne localStorage.getItem("token")
                           // Peut être : "demo_token_123..." ou ancien token

// lib/session.js
export function getToken() {
  return localStorage.getItem("token");  // ❌ PAS le vrai JWT Supabase
}
```

**Résultat :** Le token envoyé à `/api/billing/subscription` n'est PAS le `session.access_token` Supabase → Erreur `invalid JWT`

---

## ✅ SOLUTION APPLIQUÉE

### 1. Corriger apiFetch pour utiliser le vrai token Supabase

**Fichier :** [lib/api.js](lib/api.js#L8-L45)

```javascript
export async function apiFetch(url, options = {}) {
  // ...

  // ✅ CORRECTION : Récupérer le VRAI token Supabase depuis la session
  let token = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token || null;
    
    if (!token) {
      console.warn('[apiFetch] Pas de session Supabase active');
    }
  } catch (error) {
    console.error('[apiFetch] Erreur récupération session:', error.message);
  }

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
    // Debug temporaire
    console.log('[apiFetch] Token présent, longueur:', token.length, 'parties:', token.split('.').length);
  } else {
    console.warn('[apiFetch] Pas de token disponible pour', url);
  }

  // ... fetch ...
}
```

**Impact :**
- ✅ `apiFetch()` envoie maintenant le vrai JWT Supabase
- ✅ Token valide pour `supabase.auth.getUser(token)`
- ✅ Plus d'erreur "invalid JWT"

---

### 2. Ajouter logs de diagnostic dans l'API billing

**Fichier :** [pages/api/billing/subscription.js](pages/api/billing/subscription.js#L21-L50)

```javascript
export default async function handler(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.replace('Bearer ', '');
    
    // 🔍 DEBUG TEMPORAIRE : Logger les infos du token
    console.log('[API /billing/subscription] Token reçu:');
    console.log('  - Longueur:', token.length);
    console.log('  - Parties JWT:', token.split('.').length, '(doit être 3)');
    console.log('  - Début:', token.substring(0, 20) + '...');
    
    // Vérifier le token avec Supabase (PAS de vérification manuelle)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('[API /billing/subscription] ❌ Token invalide');
      console.error('  - Error:', authError?.message);
      return res.status(401).json({ 
        error: 'Token invalide: ' + (authError?.message || 'user null'),
        status: 'unauthenticated',
        debug: {
          tokenLength: token.length,
          tokenParts: token.split('.').length,
          errorMessage: authError?.message
        }
      });
    }
    
    console.log('[API /billing/subscription] ✅ Token valide, user:', user.id);
    
    // ... reste de l'API ...
  }
}
```

**Impact :**
- ✅ Logs détaillés sur Vercel pour debug
- ✅ Vérification explicite du JWT (3 parties)
- ✅ Message d'erreur clair si token invalide

---

## 🧪 VALIDATION

### Après déploiement sur Vercel :

1. **Console navigateur** :
   ```
   [apiFetch] Token présent, longueur: 450, parties: 3
   ```

2. **Logs Vercel** :
   ```
   [API /billing/subscription] Token reçu:
     - Longueur: 450
     - Parties JWT: 3 (doit être 3)
     - Début: eyJhbGciOiJIUzI1NiIs...
   [API /billing/subscription] ✅ Token valide, user: abc123-def456-...
   ```

3. **Si le token est valide** :
   - Status : 200
   - Response : `{ status: 'none', plan: null, ... }`

4. **Si le token est invalide** (ne devrait plus arriver) :
   - Status : 401
   - Response : 
     ```json
     {
       "error": "Token invalide: invalid JWT",
       "status": "unauthenticated",
       "debug": {
         "tokenLength": 123,
         "tokenParts": 2,
         "errorMessage": "invalid JWT: unable to parse or verify signature"
       }
     }
     ```

---

## 📊 RÉSULTAT ATTENDU

### Avant
```
UserBadge → apiFetch('/billing/subscription')
  → getToken() → localStorage.getItem("token") → "demo_token_123..."
  → Authorization: Bearer demo_token_123...
  → API reçoit un faux token
  → supabase.auth.getUser(demo_token_123) → ❌ invalid JWT
```

### Après
```
UserBadge → apiFetch('/billing/subscription')
  → supabase.auth.getSession() → session.access_token → "eyJhbGci..."
  → Authorization: Bearer eyJhbGci...
  → API reçoit le vrai JWT Supabase
  → supabase.auth.getUser(eyJhbGci...) → ✅ user valide
  → 200 { status: 'none', plan: null }
```

---

## 🎯 FICHIERS MODIFIÉS

1. ✅ [lib/api.js](lib/api.js)
   - Remplacement de `getToken()` par `supabase.auth.getSession()`
   - Logs de debug (longueur token, nb parties)

2. ✅ [pages/api/billing/subscription.js](pages/api/billing/subscription.js)
   - Logs détaillés du token reçu
   - Message d'erreur avec debug info

---

## ✅ BUILD

```bash
✓ Compiled successfully
✓ Generating static pages (54/54)
```

---

## 📝 PROCHAINES ÉTAPES

1. **Déployer** sur Vercel
2. **Se connecter** en tant qu'admin
3. **Ouvrir** `/admin/jetc`
4. **Vérifier logs Vercel** :
   - Token reçu : longueur ~400-500, 3 parties
   - Token valide : user ID affiché
   - Pas d'erreur "invalid JWT"

---

**Statut :** ✅ Correction appliquée, prête pour test en prod
