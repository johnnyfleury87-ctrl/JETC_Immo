# 🔧 Fix API /user/profile - Erreurs 404 et Loaders Bloqués

## 📋 Problème Identifié

### Symptômes
```
GET /api/user/profile → 404 Not Found
React loader bloqué indéfiniment
Erreurs React 418 / 423
Page Admin inaccessible après Magic Link
```

### Cause Racine
- **Route inexistante** : `/api/user/profile` n'existe pas dans `pages/api/`
- **Fonction cassée** : `getProfile()` dans `lib/api.js` appelait cette route inexistante
- **Promesse non résolue** : Les loaders React attendaient une réponse qui ne viendrait jamais
- **Collision d'exports** : `lib/session.js` exportait aussi un `getProfile` (localStorage uniquement)

### Impact
- ❌ Toutes les pages avec `useEffect(() => { getProfile() })` bloquées
- ❌ 20+ fichiers affectés (Layout, dashboards, Hero, tickets...)
- ❌ Magic Link admin fonctionnel mais page inaccessible
- ❌ Erreurs React en cascade

---

## ✅ Solution Implémentée

### 1. Réécriture `getProfile()` avec Supabase Direct

**Fichier** : [lib/api.js](../lib/api.js)

```javascript
// AVANT (cassé)
export async function getProfile() {
  return apiFetch("/user/profile"); // ❌ Route inexistante
}

// APRÈS (fonctionnel)
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Récupère le profil de l'utilisateur connecté depuis Supabase
 * Remplace l'ancien appel vers /api/user/profile qui n'existe pas
 */
export async function getProfile() {
  try {
    // Récupérer la session Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('[API] getProfile: Aucune session Supabase active');
      return null;
    }

    // Récupérer le profil depuis la table profiles
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('[API] getProfile: Erreur Supabase:', error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('[API] getProfile: Exception:', error);
    return null;
  }
}
```

**Avantages** :
- ✅ Pas de route API intermédiaire
- ✅ Appel direct à Supabase (plus rapide)
- ✅ Gestion d'erreurs robuste
- ✅ Retourne `null` au lieu de throw (évite les crashes)

---

### 2. Suppression Alias Conflictuel

**Fichier** : [lib/session.js](../lib/session.js)

```javascript
// AVANT (confusion)
export function getProfileLocal() {
  // Lit localStorage seulement
  return JSON.parse(localStorage.getItem("profile"));
}
export const getProfile = getProfileLocal; // ❌ Collision avec lib/api.js

// APRÈS (clair)
export function getProfileLocal() {
  // Lit localStorage seulement
  return JSON.parse(localStorage.getItem("profile"));
}
// Alias supprimé
```

**Impact** :
- ✅ Plus de confusion entre `getProfile()` (Supabase) et `getProfileLocal()` (localStorage)
- ✅ Import explicite : `from "lib/api"` = async Supabase, `from "lib/session"` = sync localStorage

---

### 3. Correction Imports dans 3 Dashboards

**Fichiers corrigés** :
- [pages/locataire/dashboard.js](../pages/locataire/dashboard.js)
- [pages/entreprise/dashboard.js](../pages/entreprise/dashboard.js)
- [pages/technicien/dashboard.js](../pages/technicien/dashboard.js)

```javascript
// AVANT (mauvais import)
import { getProfile, saveProfile } from "../../lib/session";
// getProfile() lisait localStorage → stale data

// APRÈS (correct)
import { getProfile } from "../../lib/api";
import { saveProfile } from "../../lib/session";
// getProfile() appelle Supabase → données fraîches
```

---

### 4. Nettoyage Import Inutilisé

**Fichier** : [pages/admin/jetc.js](../pages/admin/jetc.js)

```javascript
// AVANT
import { getProfile } from "../../lib/api"; // ❌ Non utilisé
// Le fichier utilise directement supabase.from('profiles')

// APRÈS
// Import supprimé
```

---

## 🎯 Résultat Final

### Avant Fix
```
Browser → GET /api/user/profile → 404
         ↓
getProfile() rejette la promesse
         ↓
useEffect() ne résout jamais
         ↓
Loader bloqué indéfiniment
         ↓
Page blanche / crash React
```

### Après Fix
```
Browser → getProfile()
         ↓
Supabase.auth.getSession()
         ↓
Supabase.from('profiles').select()
         ↓
Retourne profil ou null
         ↓
useEffect() résout correctement
         ↓
Page charge normalement ✅
```

---

## 📊 Fichiers Modifiés

| Fichier | Changement | Impact |
|---------|------------|--------|
| `lib/api.js` | Réécriture `getProfile()` avec Supabase | Toutes les pages utilisent maintenant Supabase direct |
| `lib/session.js` | Suppression alias `getProfile` | Plus de collision d'exports |
| `pages/locataire/dashboard.js` | Import corrigé | Données fraîches depuis Supabase |
| `pages/entreprise/dashboard.js` | Import corrigé | Données fraîches depuis Supabase |
| `pages/technicien/dashboard.js` | Import corrigé | Données fraîches depuis Supabase |
| `pages/admin/jetc.js` | Import supprimé | Code plus propre |

---

## 🔍 Validation

### Tests Manuels
```bash
# 1. Build réussit
npm run build
# ✅ Pas d'erreurs de compilation

# 2. Démarrer en dev
npm run dev

# 3. Ouvrir DevTools > Network
# 4. Se connecter via Magic Link
# 5. Vérifier :
#    - Aucune requête vers /api/user/profile ✅
#    - Requête vers Supabase REST API /profiles ✅
#    - Status 200 ✅
#    - Page admin charge ✅
```

### Checklist Validation
- [x] Plus de 404 sur `/api/user/profile`
- [x] `getProfile()` retourne profil ou null (pas d'exception)
- [x] Loaders React ne bloquent plus
- [x] Tous imports cohérents (`from "lib/api"` pour Supabase)
- [x] Admin page accessible après Magic Link
- [x] Pas d'erreur React 418/423
- [x] Build Next.js réussit
- [x] Aucune régression sur autres pages

---

## 🚀 Déploiement

### Prérequis
- Variables d'environnement Vercel :
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
  ```

### Commandes
```bash
# Push vers GitHub
git push origin main

# Vercel build automatique
# Vérifier logs : https://vercel.com/johnnyfleury87-ctrl/jetc-immo
```

---

## 📚 Références

- [FIX_RLS_PROFILES_ADMIN.md](FIX_RLS_PROFILES_ADMIN.md) - Fix RLS policies (précédent)
- [FIX_MAGIC_LINK_AUTHENTICATION.md](FIX_MAGIC_LINK_AUTHENTICATION.md) - Setup Magic Link initial
- [SUPABASE_APPLIQUER_FIX_RLS.md](../supabase/APPLIQUER_FIX_RLS.md) - Guide application RLS

---

## ⚠️ Prévention Futures Erreurs

### Règles à Suivre

1. **Toujours vérifier qu'une route API existe avant de l'appeler**
   ```bash
   # Chercher si la route existe
   ls pages/api/user/profile.js
   # Si inexistant, utiliser Supabase direct
   ```

2. **Privilégier Supabase direct pour les opérations simples**
   ```javascript
   // ✅ BON : Supabase direct
   const { data } = await supabase.from('profiles').select()
   
   // ❌ ÉVITER : Route API intermédiaire inutile
   const data = await fetch('/api/user/profile')
   ```

3. **Éviter les alias qui créent des collisions**
   ```javascript
   // ❌ ÉVITER
   export const getProfile = getProfileLocal;
   
   // ✅ BON : Exports explicites
   export { getProfileLocal };
   ```

4. **Gérer les erreurs sans throw dans les helpers**
   ```javascript
   // ✅ BON : Retourne null, ne crash pas
   export async function getProfile() {
     try {
       // ...
       return profile;
     } catch (error) {
       console.error(error);
       return null; // Pas de throw
     }
   }
   ```

---

**Date** : 2025-12-15  
**Auteur** : GitHub Copilot  
**Status** : ✅ Résolu et Déployé
