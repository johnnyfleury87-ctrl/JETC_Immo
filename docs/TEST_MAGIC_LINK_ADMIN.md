# Test du Magic Link Admin - Guide de Validation

## Objectif
Vérifier que le flux de connexion par Magic Link pour admin_jtec fonctionne correctement et redirige automatiquement vers `/admin/jetc`.

## Pré-requis
- ✅ Profile admin_jtec existe dans `public.profiles` (email: johnny.fleury87@gmail.com)
- ✅ Auth Supabase configuré correctement
- ✅ Variables d'environnement NEXT_PUBLIC_SUPABASE_* définies

## Flux de Test Complet

### 1. Démarrer l'application
```bash
cd /workspaces/JETC_Immo
npm run dev
```

### 2. Accéder à la page d'accueil
- URL: `http://localhost:3000`
- Action: Faire un **clic droit** sur le logo JETC en haut à gauche
- Résultat attendu: **Aucun message visible** (opération silencieuse)

### 3. Vérifier l'envoi de l'email
- Consulter votre boîte mail: `johnny.fleury87@gmail.com`
- Email reçu de: Supabase Auth
- Sujet: "Magic Link - Confirm your email"
- Contenu: Lien de connexion sécurisé

### 4. Cliquer sur le lien Magic Link
- Action: Cliquer sur le bouton "Confirm your email" dans l'email
- Navigation: Browser ouvre `http://localhost:3000/...#access_token=...`
- Résultat attendu: **Redirection automatique vers `/admin/jetc`**

### 5. Vérifier la console navigateur
Ouvrir DevTools (F12) et vérifier les logs:
```
[AUTH] Event: SIGNED_IN Session: true
[AUTH] Profile chargé: admin_jtec
[AUTH] Redirection vers /admin/jetc
```

### 6. Vérifier la page admin
- URL finale: `http://localhost:3000/admin/jetc`
- Contenu visible:
  - ✅ Titre: "Administration JETC"
  - ✅ Liste des demandes d'adhésion
  - ✅ Filtres: En attente / Validées / Refusées
  - ✅ Aucune erreur 404 dans la console
  - ✅ Aucune URL contenant "undefined"

## Points de Vérification Critiques

### ❌ Erreurs à NE PLUS voir
- ❌ "Unexpected token '<'" (parsing HTML en tant que JSON)
- ❌ URLs contenant `/api/admin/undefined/...`
- ❌ Fetch avec `profile.id` = undefined
- ❌ Redirection vers `/login` au lieu de `/admin/jetc`
- ❌ Boucle de redirection infinie

### ✅ Comportements corrects
- ✅ Un seul listener `onAuthStateChange` actif (dans `_app.js`)
- ✅ Profile chargé AVANT tout appel API
- ✅ Guards `if (!profile?.id)` présents dans tous les handlers
- ✅ `router.replace()` utilisé (pas de pollution historique)
- ✅ Session Supabase vérifiée en premier

## Test Alternatif: Via /login

### 1. Accéder à /login
- URL: `http://localhost:3000/login`
- Saisir: `johnny.fleury87@gmail.com`
- Observer: Détection automatique du rôle admin_jtec
- Interface: Formulaire passe en mode "Magic Link"

### 2. Envoyer le Magic Link
- Cliquer: "Recevoir un lien de connexion"
- Message: "✅ Un lien de connexion vous a été envoyé par email"
- Champ mot de passe: **MASQUÉ** (non disponible pour admin)

### 3. Suivre le lien
- Même processus que ci-dessus (étapes 3-6)

## Test de Sécurité

### Guard sur login par mot de passe
1. Sur `/login`, saisir `johnny.fleury87@gmail.com`
2. Tenter d'entrer un mot de passe
3. Résultat attendu: Message d'erreur "Les administrateurs doivent utiliser le lien de connexion envoyé par email"

### Guard sur accès sans session
1. Ouvrir un navigateur en navigation privée
2. Accéder directement à `http://localhost:3000/admin/jetc`
3. Résultat attendu: Redirection immédiate vers `/login`

### Guard sur rôle incorrect
1. Se connecter avec un compte non-admin (ex: regie@test.com)
2. Tenter d'accéder à `/admin/jetc` via URL directe
3. Résultat attendu: Alert "Accès refusé" + redirection vers `/`

## Résolution de Problèmes

### Problème: Reste sur /login après clic sur Magic Link
**Solution:**
- Vérifier que `_app.js` contient le listener `onAuthStateChange`
- Vérifier les logs console: `[AUTH] Event: SIGNED_IN`
- Si pas de log, vérifier les variables d'environnement Supabase

### Problème: Erreur "Unexpected token '<'"
**Solution:**
- Vérifier que `checkAdminAccess()` s'exécute AVANT `loadRequests()`
- Vérifier `authChecked === true` avant tout fetch
- Vérifier guards `if (!profile?.id)` dans tous les handlers

### Problème: URL contient "undefined"
**Solution:**
- Ajouter `console.log(profile)` avant chaque `fetch()`
- Vérifier que `profile.id` existe et n'est pas undefined
- Vérifier l'ordre d'exécution des useEffect

## Validation Finale

Tous les tests doivent passer:
- [ ] Clic droit sur logo → email reçu
- [ ] Clic sur Magic Link → redirection /admin/jetc
- [ ] Page admin charge sans erreur
- [ ] Aucune URL avec "undefined"
- [ ] Aucune erreur JSON parsing
- [ ] Login par mot de passe bloqué pour admin
- [ ] Accès sans session bloqué
- [ ] Logs console corrects

**Date du test:** _____________  
**Testeur:** _____________  
**Résultat:** ✅ PASS / ❌ FAIL  
**Remarques:** _____________________________________________
