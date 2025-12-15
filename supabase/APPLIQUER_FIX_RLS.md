# 🚀 Guide Rapide : Appliquer le Fix RLS Profiles

## ⚡ Commandes Rapides

### Option 1 : Supabase CLI (Recommandé)
```bash
# Depuis la racine du projet
cd /workspaces/JETC_Immo
supabase db push
```

### Option 2 : Dashboard Supabase
1. Ouvrir [Supabase Dashboard](https://app.supabase.com)
2. Sélectionner votre projet JETC_Immo
3. Aller dans **SQL Editor**
4. Copier tout le contenu de `supabase/migrations/04_fix_profiles_rls_policies.sql`
5. Coller dans l'éditeur et **Run**

## ✅ Validation Post-Application

### 1. Vérifier les Policies (SQL Editor)
```sql
-- Doit retourner 9 policies
SELECT * FROM pg_policies WHERE tablename='profiles';

-- Doit retourner TRUE
SELECT COUNT(*) = 9 FROM pg_policies WHERE tablename='profiles';
```

### 2. Tester Query Admin Profile
```sql
-- Remplacer <admin_uuid> par votre ID admin
SELECT * FROM profiles WHERE id = '<admin_uuid>';
```
**Attendu** : 1 ligne retournée avec role='admin_jtec'

### 3. Tester via REST API
**Depuis le Dashboard > API > Auto-generated docs > profiles**
```
GET /rest/v1/profiles?id=eq.<admin_uuid>
Authorization: Bearer <anon_key>
```
**Attendu** : Status 200, JSON avec le profil admin

## 🔍 Test Connexion Magic Link Admin

1. **Accéder au site** → Page d'accueil
2. **Clic droit sur le logo** → 3 clics rapides
3. **Fenêtre magic link** apparaît
4. **Entrer email admin** → Envoyer
5. **Cliquer sur lien** dans l'email
6. **Devrait rediriger** vers `/admin/jetc` ✅
7. **Pas d'erreur 500** dans Network tab ✅
8. **Page affiche** les demandes d'adhésion ✅

## 🐛 En Cas de Problème

### Erreur "policy not found"
```sql
-- Re-créer les policies
\i supabase/migrations/04_fix_profiles_rls_policies.sql
```

### Toujours erreur 500
1. Vérifier logs Supabase : **Database > Logs > Postgres Logs**
2. Chercher "ERROR" ou "RLS policy"
3. Vérifier que RLS est activé :
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';
-- rowsecurity doit être TRUE
```

### UserBadge ne s'affiche pas
1. Vérifier Network tab : `/api/profile` ne devrait PAS être appelé pour admin
2. Console React : Aucune erreur
3. Vérifier que `components/UserBadge.js` contient :
```javascript
if (profile?.role === 'admin_jtec') return null;
```

## 📊 Checklist de Validation Complète

- [ ] Migration 04 appliquée sans erreurs
- [ ] 9 policies visibles dans pg_policies
- [ ] Query SQL directe fonctionne (SELECT * FROM profiles WHERE...)
- [ ] Query REST API retourne 200 (via Postman/Dashboard)
- [ ] Magic Link admin envoie email
- [ ] Clic sur lien redirige vers /admin/jetc
- [ ] Page admin charge sans erreur 500
- [ ] UserBadge n'appelle pas /api/profile pour admin
- [ ] Aucune erreur React dans console navigateur
- [ ] Aucune erreur dans Supabase Logs

## 🎯 Impact Attendu

| Avant | Après |
|-------|-------|
| ❌ GET /profiles → 500 | ✅ GET /profiles → 200 |
| ❌ Magic Link admin bloqué | ✅ Magic Link admin fonctionne |
| ❌ Page /admin/jetc crash | ✅ Page /admin/jetc charge |
| ❌ RLS policy IN (NULL) error | ✅ IS NOT NULL guards |

## 📚 Documentation Complète

Voir [FIX_RLS_PROFILES_ADMIN.md](../docs/FIX_RLS_PROFILES_ADMIN.md) pour :
- Explication détaillée du problème
- Analyse technique des policies
- Comparaisons avant/après
- Prévention futures erreurs RLS

---

**Durée estimée** : 5 minutes  
**Complexité** : Faible (copier-coller SQL)  
**Rollback** : Possible via `supabase db reset` (dev only)
