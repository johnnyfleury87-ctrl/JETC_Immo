# 🎯 GUIDE RAPIDE : Créer l'Admin JETC

**3 étapes simples - 5 minutes**

---

## 📧 ÉTAPE 1 : Magic Link (Supabase Dashboard)

```
1. Supabase Dashboard → Authentication → Users → Invite User
2. Email : johnny.fleury87@gmail.com
3. Cliquez sur "Invite User"
```

✅ Magic link envoyé automatiquement

---

## 💾 ÉTAPE 2 : Créer le profile (SQL Editor)

**Ouvrez Supabase SQL Editor** et exécutez :

```
supabase/create_admin_jetc.sql
```

✅ Profile admin créé avec :
- role = admin_jtec
- regie_id = NULL
- entreprise_id = NULL
- is_demo = false

---

## ✔️ ÉTAPE 3 : Vérifier (SQL Editor)

**Ouvrez Supabase SQL Editor** et exécutez :

```
supabase/verify_admin_jetc.sql
```

✅ Toutes les vérifications doivent passer

---

## 🔐 Connexion

1. Cliquez sur le magic link (email)
2. → Redirection automatique vers `/admin/jetc`

---

## 🛡️ Ce qui est protégé

| Route | Accès |
|-------|-------|
| `/admin/jetc` | ✅ Autorisé |
| `/locataire/*` | ❌ Bloqué |
| `/regie/*` | ❌ Bloqué |
| `/entreprise/*` | ❌ Bloqué |
| `/technicien/*` | ❌ Bloqué |

---

## 📄 Documentation complète

Consultez [README_ADMIN_JETC.md](./README_ADMIN_JETC.md) pour :
- Détails techniques
- Gestion des triggers
- FAQ
- Troubleshooting

---

**C'est tout !** 🎉
