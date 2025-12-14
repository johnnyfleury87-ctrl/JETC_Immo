# 🔐 Configuration Admin JETC

Guide complet pour créer et configurer l'utilisateur administrateur JETC.

---

## 📋 Vue d'ensemble

**Email** : `johnny.fleury87@gmail.com`  
**Rôle** : `admin_jtec`  
**Accès** : `/admin/jetc` uniquement  
**Restrictions** : Aucun accès aux vues locataire/régie/entreprise/technicien

---

## 🚀 Procédure d'installation (3 étapes)

### **ÉTAPE 1 : Créer l'utilisateur dans Supabase Auth**

1. Allez dans **Supabase Dashboard**
2. **Authentication** → **Users** → **Invite User**
3. **Email** : `johnny.fleury87@gmail.com`
4. Cliquez sur **Invite User**
5. ✅ Supabase envoie automatiquement le magic link

> ⚠️ **IMPORTANT** : Ne créez PAS de mot de passe. L'authentification se fait uniquement par magic link.

---

### **ÉTAPE 2 : Créer le profile admin JETC**

1. Ouvrez **Supabase SQL Editor**
2. Copiez-collez le contenu du fichier :
   ```
   supabase/create_admin_jetc.sql
   ```
3. Exécutez le script
4. ✅ Le profile admin est créé avec les bonnes contraintes

**Le script fait automatiquement :**
- ✓ Vérifie que l'utilisateur existe dans `auth.users`
- ✓ Crée ou met à jour le profile vers `admin_jtec`
- ✓ Respecte la contrainte `check_role_consistency`
- ✓ Ne désactive AUCUN trigger
- ✓ N'insère PAS de rôle locataire par défaut

---

### **ÉTAPE 3 : Vérifier la configuration**

1. Ouvrez **Supabase SQL Editor**
2. Copiez-collez le contenu du fichier :
   ```
   supabase/verify_admin_jetc.sql
   ```
3. Exécutez le script
4. ✅ Vérifiez que toutes les validations passent

---

## 🔐 Connexion

1. Consultez vos emails (`johnny.fleury87@gmail.com`)
2. Cliquez sur le **magic link** reçu de Supabase
3. ✅ Vous êtes automatiquement redirigé vers `/admin/jetc`

---

## 🛡️ Protections en place

### ✅ Accès autorisé

| Route | Protection |
|-------|-----------|
| `/admin/jetc` | ✓ Vérification `role === 'admin_jtec'` |

### ❌ Accès refusé (redirection automatique vers `/login`)

| Route | Protection | Fichier |
|-------|-----------|---------|
| `/locataire/*` | `requireRole(['locataire'])` | [lib/roleGuard.js](../lib/roleGuard.js) |
| `/regie/*` | `requireRole(['regie'])` | [lib/roleGuard.js](../lib/roleGuard.js) |
| `/entreprise/*` | `requireRole(['entreprise'])` | [lib/roleGuard.js](../lib/roleGuard.js) |
| `/technicien/*` | `requireRole(['technicien'])` | [lib/roleGuard.js](../lib/roleGuard.js) |

---

## 🔍 Détails techniques

### Contrainte `check_role_consistency`

```sql
CONSTRAINT check_role_consistency CHECK (
  (role = 'admin_jtec') OR
  (role IN ('regie', 'locataire') AND regie_id IS NOT NULL) OR
  (role IN ('entreprise', 'technicien') AND entreprise_id IS NOT NULL)
)
```

✅ **admin_jtec** : Aucune liaison requise (pas de `regie_id` ni `entreprise_id`)

### Redirection automatique

Fichier : [lib/auth.js](../lib/auth.js)

```javascript
case "admin_jtec":
  window.location.href = "/admin/jetc";
  break;
```

### Protection page admin

Fichier : [pages/admin/jetc.js](../pages/admin/jetc.js)

```javascript
if (!profileData || profileData.role !== "admin_jtec") {
  alert("Accès refusé. Cette page est réservée aux administrateurs JETC.");
  router.push("/");
  return;
}
```

---

## ⚠️ Gestion du trigger `handle_new_user()`

### Problème potentiel

Le trigger `on_auth_user_created` insère automatiquement un profile avec `role = 'locataire'` lors de la création d'un utilisateur dans `auth.users`.

Cela peut causer un conflit avec `check_role_consistency` car un locataire DOIT avoir un `regie_id`.

### Solution implémentée

Le script [create_admin_jetc.sql](./create_admin_jetc.sql) :

1. **Ne désactive PAS** le trigger (préserve la logique métier)
2. **Met à jour** le profile existant vers `admin_jtec` si nécessaire
3. **Respecte** toutes les contraintes SQL

---

## 📊 Tests de vérification

### URLs à tester (vous devez être **BLOQUÉ**)

```
http://localhost:3000/locataire/dashboard
http://localhost:3000/locataire/tickets
http://localhost:3000/regie/dashboard
http://localhost:3000/regie/immeubles
http://localhost:3000/entreprise/dashboard
http://localhost:3000/entreprise/missions
http://localhost:3000/technicien/dashboard
http://localhost:3000/technicien/missions
```

**Résultat attendu** : Redirection vers `/login`

### URL à tester (vous devez avoir **ACCÈS**)

```
http://localhost:3000/admin/jetc
```

**Résultat attendu** : 
- ✓ Page accessible
- ✓ Liste des demandes d'adhésion visible
- ✓ Votre nom "Johnny Fleury" affiché dans le UserBadge

---

## 📁 Fichiers modifiés/créés

| Fichier | Description |
|---------|-------------|
| [supabase/create_admin_jetc.sql](./create_admin_jetc.sql) | Script de création de l'admin JETC |
| [supabase/verify_admin_jetc.sql](./verify_admin_jetc.sql) | Script de vérification de la configuration |
| [lib/auth.js](../lib/auth.js) | Redirection vers `/admin/jetc` ✅ |
| [lib/roleGuard.js](../lib/roleGuard.js) | Protection des routes client ✅ |
| [pages/admin/jetc.js](../pages/admin/jetc.js) | Page admin avec vérification du rôle ✅ |

---

## ❓ FAQ

### **Q : Le trigger `handle_new_user()` va créer un locataire par défaut ?**

**R** : Oui, mais le script `create_admin_jetc.sql` le détecte et met à jour le profile vers `admin_jtec` automatiquement.

### **Q : Pourquoi ne pas désactiver le trigger ?**

**R** : Désactiver le trigger casserait la logique métier pour les vrais utilisateurs (locataires, régies, entreprises). Le script gère intelligemment la mise à jour.

### **Q : Dois-je créer une régie ou une entreprise ?**

**R** : Non. L'admin JETC est isolé et n'appartient à aucune entité. C'est un super-administrateur global.

### **Q : Dois-je créer une subscription ?**

**R** : Non. L'admin JETC n'a pas besoin d'abonnement. Il gère les demandes d'adhésion des autres entités.

### **Q : Que se passe-t-il si j'essaie d'accéder à `/locataire/dashboard` ?**

**R** : La fonction `requireRole(['locataire'])` détecte que vous êtes `admin_jtec` et vous redirige vers `/login`.

---

## ✅ Checklist finale

- [ ] Utilisateur créé via magic link dans Supabase Dashboard
- [ ] Script `create_admin_jetc.sql` exécuté sans erreur
- [ ] Script `verify_admin_jetc.sql` affiche "✅ CONFIGURATION CORRECTE"
- [ ] Magic link reçu par email
- [ ] Connexion réussie → redirection vers `/admin/jetc`
- [ ] Accès refusé aux vues client (locataire/régie/entreprise/technicien)

---

## 🆘 En cas de problème

1. **Exécutez le script de vérification** : `verify_admin_jetc.sql`
2. **Consultez les messages d'erreur** détaillés dans les RAISE NOTICE
3. **Relancez le script de création** : `create_admin_jetc.sql` (il est idempotent)

---

**Dernière mise à jour** : 14 décembre 2025
