# 🔐 Connexion Admin JETC - Magic Link

Documentation du système de connexion par magic link pour les administrateurs JETC.

---

## ✅ Modifications apportées

### Fichier modifié : [pages/login.js](../pages/login.js)

La page de connexion détecte automatiquement si l'email correspond à un compte `admin_jtec` et adapte l'interface.

---

## 🎯 Fonctionnement

### Pour les utilisateurs normaux (locataire, régie, entreprise, technicien)

```
1. Saisir email
2. Saisir mot de passe
3. Choisir thème
4. Cliquer sur "Se connecter"
→ Connexion classique via API
```

### Pour les administrateurs JETC (admin_jtec)

```
1. Saisir email (ex: johnny.fleury87@gmail.com)
→ Détection automatique du rôle admin_jtec
→ Le champ mot de passe disparaît
→ Message d'information affiché

2. Cliquer sur "📧 Recevoir un lien de connexion"
→ Magic link envoyé par email

3. Ouvrir l'email
→ Cliquer sur le lien

4. Redirection automatique
→ Connexion établie
→ Redirection vers /admin/jetc
```

---

## 🔍 Détection automatique

### Quand vous tapez l'email

```javascript
// Après 500ms (debounce)
const { data } = await supabase
  .from('profiles')
  .select('role')
  .eq('email', email)
  .single();

if (data.role === 'admin_jtec') {
  // Masquer le champ mot de passe
  // Afficher le bouton magic link
}
```

**Résultat :**
- ✅ Détection en temps réel
- ✅ Interface adaptée automatiquement
- ✅ Aucune confusion pour l'utilisateur

---

## 📧 Envoi du magic link

### Code utilisé

```javascript
const { error } = await supabase.auth.signInWithOtp({
  email: email,
  options: {
    emailRedirectTo: `${window.location.origin}/login`
  }
});
```

**Ce qui se passe :**
1. Supabase génère un lien unique sécurisé
2. Email envoyé automatiquement par Supabase
3. Le lien contient un token temporaire
4. Redirection vers `/login` après clic

---

## 🔄 Retour du magic link

### Workflow

```
1. User clique sur le lien (email)
   ↓
2. Supabase valide le token
   ↓
3. Session créée automatiquement
   ↓
4. Page /login charge la session
   ↓
5. Profile récupéré depuis la DB
   ↓
6. Redirection vers /admin/jetc
```

### Code de gestion

```javascript
useEffect(() => {
  const handleMagicLinkCallback = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      // Récupérer le profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      // Sauvegarder session + profile
      saveSession({ token: session.access_token, role: profile.role });
      saveProfile(profile);

      // Redirection automatique
      redirectByRole(profile.role); // → /admin/jetc
    }
  };

  handleMagicLinkCallback();
}, []);
```

---

## 🎨 Interface utilisateur

### État : Email admin détecté

![Admin Detection]

```
┌─────────────────────────────────────┐
│         Connexion                   │
├─────────────────────────────────────┤
│ Email                               │
│ [johnny.fleury87@gmail.com      ]  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🔐 Connexion administrateur     │ │
│ │ Un lien de connexion sécurisé   │ │
│ │ vous sera envoyé par email      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [📧 Recevoir un lien de connexion] │
└─────────────────────────────────────┘
```

### État : Magic link envoyé

```
┌─────────────────────────────────────┐
│ ✅ Un lien de connexion vous a      │
│    été envoyé par email.            │
│    Consultez votre boîte mail       │
│    (johnny.fleury87@gmail.com)      │
└─────────────────────────────────────┘
```

---

## 🔒 Sécurité

### Avantages du magic link

✅ **Pas de mot de passe stocké**
- Aucun risque de fuite
- Aucun hash à gérer
- Aucune réinitialisation nécessaire

✅ **Token temporaire**
- Expire après utilisation
- Valide 1 heure maximum
- Lié à l'email uniquement

✅ **Validé côté Supabase**
- Vérification automatique
- Impossible de forger un lien
- Protection contre le replay

---

## 🧪 Tests

### Test 1 : Email admin

```
1. Aller sur /login
2. Taper : johnny.fleury87@gmail.com
3. Attendre 500ms

✅ Résultat attendu :
   - Champ mot de passe disparaît
   - Message "Connexion administrateur" s'affiche
   - Bouton devient "📧 Recevoir un lien de connexion"
```

### Test 2 : Email non-admin

```
1. Aller sur /login
2. Taper : user@example.com
3. Attendre 500ms

✅ Résultat attendu :
   - Champ mot de passe visible
   - Champ thème visible
   - Bouton reste "Se connecter"
```

### Test 3 : Envoi du magic link

```
1. Email admin saisi
2. Cliquer sur "📧 Recevoir un lien de connexion"

✅ Résultat attendu :
   - Message de succès affiché
   - Email reçu (vérifier inbox)
   - Lien cliquable présent dans l'email
```

### Test 4 : Connexion via magic link

```
1. Ouvrir l'email
2. Cliquer sur le lien

✅ Résultat attendu :
   - Redirection vers /login
   - Session créée automatiquement
   - Redirection finale vers /admin/jetc
   - Nom "Johnny Fleury" visible dans UserBadge
```

---

## ❌ Erreurs résolues

### Avant

```
❌ "Unexpected end of JSON input"
   - Causé par l'appel API avec mot de passe vide
   - Backend retournait 401 sans JSON

❌ Champ mot de passe requis
   - Admin obligé de saisir un mot de passe (qui n'existe pas)
```

### Après

```
✅ Détection automatique du rôle
✅ Interface adaptée (pas de mot de passe)
✅ Magic link envoyé par Supabase
✅ Connexion fonctionnelle
✅ Aucune erreur JSON
```

---

## 🔄 Flux complet (schéma)

```
┌─────────────────────────────────────────────────────────────┐
│                    CONNEXION ADMIN JETC                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Saisir email    │
                    │ johnny.fleury87 │
                    │ @gmail.com      │
                    └────────┬────────┘
                             │
                             ▼
                ┌────────────────────────┐
                │ Vérification en base   │
                │ role === 'admin_jtec'? │
                └────────┬───────────────┘
                         │
                         ▼ OUI
                ┌────────────────────────┐
                │ Interface admin        │
                │ - Pas de mot de passe  │
                │ - Bouton magic link    │
                └────────┬───────────────┘
                         │
                         ▼
                ┌────────────────────────┐
                │ Clic sur le bouton     │
                │ supabase.auth          │
                │ .signInWithOtp()       │
                └────────┬───────────────┘
                         │
                         ▼
                ┌────────────────────────┐
                │ Email envoyé par       │
                │ Supabase Auth          │
                └────────┬───────────────┘
                         │
                         ▼
                ┌────────────────────────┐
                │ User ouvre l'email     │
                │ Clique sur le lien     │
                └────────┬───────────────┘
                         │
                         ▼
                ┌────────────────────────┐
                │ Supabase valide token  │
                │ Crée la session        │
                └────────┬───────────────┘
                         │
                         ▼
                ┌────────────────────────┐
                │ Récupération profile   │
                │ depuis profiles table  │
                └────────┬───────────────┘
                         │
                         ▼
                ┌────────────────────────┐
                │ Sauvegarde session     │
                │ localStorage           │
                └────────┬───────────────┘
                         │
                         ▼
                ┌────────────────────────┐
                │ redirectByRole()       │
                │ → /admin/jetc          │
                └────────────────────────┘
```

---

## 📊 Variables d'environnement requises

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Ces variables doivent être définies dans `.env.local`.

---

## 🎯 Résumé des fonctionnalités

| Fonctionnalité | Status |
|----------------|--------|
| Détection automatique admin | ✅ |
| Masquage champ mot de passe | ✅ |
| Envoi magic link | ✅ |
| Gestion retour magic link | ✅ |
| Redirection /admin/jetc | ✅ |
| Message de confirmation | ✅ |
| Gestion erreurs | ✅ |
| Debounce email (500ms) | ✅ |
| Support utilisateurs normaux | ✅ |

---

**Dernière mise à jour** : 14 décembre 2025  
**Status** : ✅ Production ready
