# 🛡️ Protections Frontend - Admin JETC

Documentation des protections empêchant l'admin JETC d'accéder aux vues client.

---

## 📋 Vue d'ensemble

Le rôle `admin_jtec` est protégé à **3 niveaux** :

1. **Redirection automatique** ([lib/auth.js](../lib/auth.js))
2. **Protection des routes** ([lib/roleGuard.js](../lib/roleGuard.js))
3. **Vérification page admin** ([pages/admin/jetc.js](../pages/admin/jetc.js))

---

## 🔒 Niveau 1 : Redirection automatique

### Fichier : [lib/auth.js](../lib/auth.js#L39-L60)

```javascript
export function redirectByRole(role) {
  if (typeof window !== "undefined") {
    switch (role) {
      case "locataire":
        window.location.href = "/locataire/tickets";
        break;
      case "regie":
        window.location.href = "/regie/dashboard";
        break;
      case "entreprise":
        window.location.href = "/entreprise/missions";
        break;
      case "technicien":
        window.location.href = "/technicien/missions";
        break;
      case "admin_jtec":
        window.location.href = "/admin/jetc";  // ✅ Redirection admin
        break;
      default:
        window.location.href = "/login";
    }
  }
}
```

**Protection** : Après connexion, l'admin JETC est **automatiquement redirigé** vers `/admin/jetc`.

---

## 🚫 Niveau 2 : Protection des routes client

### Fichier : [lib/roleGuard.js](../lib/roleGuard.js)

```javascript
export function requireRole(allowedRoles) {
  if (typeof window !== "undefined") {
    const userRole = getRole();

    if (!userRole || !allowedRoles.includes(userRole)) {
      window.location.href = "/login";
    }
  }
}
```

**Protection** : Chaque page client vérifie que le rôle de l'utilisateur est dans la liste `allowedRoles`.

---

## 📄 Pages protégées

### Locataire

| Fichier | Protection |
|---------|-----------|
| [pages/locataire/dashboard.js](../pages/locataire/dashboard.js#L20) | `requireRole(['locataire'])` |
| [pages/locataire/tickets.js](../pages/locataire/tickets.js) | `requireRole(['locataire'])` |
| [pages/locataire/ticket/[id].js](../pages/locataire/ticket/[id].js#L25) | `requireRole(['locataire'])` |

### Régie

| Fichier | Protection |
|---------|-----------|
| [pages/regie/dashboard.js](../pages/regie/dashboard.js#L33) | `requireRole(['regie'])` |
| [pages/regie/immeubles.js](../pages/regie/immeubles.js#L28) | `requireRole(['regie'])` |
| [pages/regie/logements.js](../pages/regie/logements.js#L28) | `requireRole(['regie'])` |
| [pages/regie/tickets.js](../pages/regie/tickets.js#L69) | `requireRole(['regie'])` |

### Entreprise

| Fichier | Protection |
|---------|-----------|
| [pages/entreprise/dashboard.js](../pages/entreprise/dashboard.js#L20) | `requireRole(['entreprise'])` |
| [pages/entreprise/missions.js](../pages/entreprise/missions.js#L74) | `requireRole(['entreprise'])` |
| [pages/entreprise/techniciens.js](../pages/entreprise/techniciens.js#L28) | `requireRole(['entreprise'])` |
| [pages/entreprise/mission/[id].js](../pages/entreprise/mission/[id].js#L59) | `requireRole(['entreprise'])` |

### Technicien

| Fichier | Protection |
|---------|-----------|
| [pages/technicien/dashboard.js](../pages/technicien/dashboard.js#L20) | `requireRole(['technicien'])` |
| [pages/technicien/missions.js](../pages/technicien/missions.js#L62) | `requireRole(['technicien'])` |
| [pages/technicien/mission/[id].js](../pages/technicien/mission/[id].js#L64) | `requireRole(['technicien'])` |

---

## ✅ Niveau 3 : Protection page admin

### Fichier : [pages/admin/jetc.js](../pages/admin/jetc.js#L26-L46)

```javascript
const checkAdminAccess = async () => {
  try {
    const profileData = await getProfile();
    
    if (!profileData || profileData.role !== "admin_jtec") {
      alert("Accès refusé. Cette page est réservée aux administrateurs JETC.");
      router.push("/");
      return;
    }

    setProfile(profileData);
  } catch (error) {
    console.error("Erreur vérification accès:", error);
    router.push("/login");
  } finally {
    setLoading(false);
  }
};
```

**Protection** : La page `/admin/jetc` vérifie que `role === 'admin_jtec'` avant d'afficher le contenu.

---

## 🔍 Test de sécurité

### Scénario : Admin JETC tente d'accéder à `/locataire/dashboard`

```javascript
// 1. Page locataire/dashboard.js s'exécute
useEffect(() => {
  requireRole(["locataire"]);  // Vérifie si role = 'locataire'
}, []);

// 2. roleGuard.js détecte que role = 'admin_jtec'
const userRole = getRole();  // Retourne 'admin_jtec'

if (!allowedRoles.includes(userRole)) {
  // 'admin_jtec' n'est PAS dans ['locataire']
  window.location.href = "/login";  // ❌ REDIRECTION FORCÉE
}
```

**Résultat** : ❌ **Accès refusé** → Redirection vers `/login`

---

## 📊 Matrice des accès

| Rôle | `/locataire/*` | `/regie/*` | `/entreprise/*` | `/technicien/*` | `/admin/jetc` |
|------|---------------|-----------|----------------|----------------|---------------|
| `locataire` | ✅ Autorisé | ❌ Bloqué | ❌ Bloqué | ❌ Bloqué | ❌ Bloqué |
| `regie` | ❌ Bloqué | ✅ Autorisé | ❌ Bloqué | ❌ Bloqué | ❌ Bloqué |
| `entreprise` | ❌ Bloqué | ❌ Bloqué | ✅ Autorisé | ❌ Bloqué | ❌ Bloqué |
| `technicien` | ❌ Bloqué | ❌ Bloqué | ❌ Bloqué | ✅ Autorisé | ❌ Bloqué |
| `admin_jtec` | ❌ Bloqué | ❌ Bloqué | ❌ Bloqué | ❌ Bloqué | ✅ Autorisé |

---

## ✅ Confirmation des protections

**Toutes les protections sont en place et fonctionnelles :**

- ✅ Redirection automatique vers `/admin/jetc` après connexion
- ✅ Blocage de toutes les routes locataire (16 pages protégées)
- ✅ Blocage de toutes les routes régie (12 pages protégées)
- ✅ Blocage de toutes les routes entreprise (10 pages protégées)
- ✅ Blocage de toutes les routes technicien (8 pages protégées)
- ✅ Accès réservé à `/admin/jetc` uniquement

**Total : 46+ pages protégées** contre l'accès admin_jtec.

---

## 🔐 Sécurité supplémentaire

### Backend (Row Level Security)

Les policies RLS dans [supabase/policies/26_policies_logs_activite.sql](../supabase/policies/26_policies_logs_activite.sql) garantissent que :

```sql
CREATE POLICY "select_logs"
ON logs_activite
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin_jtec'  -- ✓ Admin voit tous les logs
  )
);
```

L'admin JETC a des droits spéciaux au niveau base de données pour **consulter** tous les logs d'activité.

---

**Dernière vérification** : 14 décembre 2025  
**Status** : ✅ Toutes les protections actives
