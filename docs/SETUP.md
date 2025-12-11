# 🔧 Scripts d'installation JETC_Immo

Ce dossier contient les scripts pour installer et configurer rapidement le projet.

---

## 📦 Installation Locale

### Script automatique
```bash
chmod +x setup.sh
./setup.sh
```

### Installation manuelle
```bash
# 1. Installer les dépendances
npm install

# 2. Copier les variables d'environnement
cp .env.example .env.local

# 3. Éditer .env.local avec vos clés Supabase
nano .env.local

# 4. Exécuter les migrations SQL (voir ci-dessous)

# 5. Démarrer le serveur
npm run dev
```

---

## 🗄️ Migrations SQL

### Option 1: Fichiers individuels (recommandé)

Dans le **Dashboard Supabase > SQL Editor**, exécuter **dans l'ordre**:

#### 1. Schema de base
```sql
-- supabase/schema/00_init_schema.sql
-- supabase/schema/01_tables.sql
-- supabase/schema/02_relations.sql
-- supabase/schema/03_views.sql
-- supabase/schema/04_functions.sql
-- supabase/schema/05_triggers.sql
```

#### 2. Politiques RLS (dans l'ordre numérique)
```sql
-- supabase/policies/10_policies_profiles.sql
-- supabase/policies/11_policies_regies.sql
-- supabase/policies/12_policies_entreprises.sql
-- supabase/policies/13_policies_immeubles.sql
-- supabase/policies/14_policies_logements.sql
-- supabase/policies/15_policies_locataires.sql
-- supabase/policies/16_policies_tickets.sql
-- supabase/policies/17_policies_missions.sql
-- supabase/policies/18_policies_factures.sql
-- supabase/policies/19_policies_messages.sql
-- supabase/policies/20_policies_notifications.sql
-- supabase/policies/21_policies_plans.sql
-- supabase/policies/22_policies_subscriptions.sql
-- supabase/policies/23_policies_preferences_utilisateur.sql
-- supabase/policies/24_policies_parametres_application.sql
-- supabase/policies/25_policies_webhooks.sql
-- supabase/policies/26_policies_logs_activite.sql
```

#### 3. Storage
```sql
-- supabase/storage/storage_buckets.sql
```

#### 4. (Optionnel) Données de démo
```sql
-- supabase/demo/seed_demo.sql
```

### Option 2: Script consolidé

Utiliser `supabase/migration_complete.sql` si vous préférez un seul fichier (plus lent).

---

## ✅ Vérification

### Vérifier les tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Attendu:** 17 tables
- profiles
- regies
- entreprises
- immeubles
- logements
- locataires
- tickets
- missions
- techniciens
- factures
- messages
- notifications
- plans
- subscriptions
- preferences_utilisateur
- parametres_application
- webhooks
- logs_activite

### Vérifier les vues
```sql
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public';
```

**Attendu:** 9 vues
- vue_stats_globales
- vue_abonnements_par_plan
- vue_tickets_par_statut
- vue_missions_par_statut
- vue_factures_par_statut
- vue_top_regies
- vue_top_entreprises
- vue_evolution_mensuelle
- vue_abonnements_expirant

### Vérifier RLS
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Attendu:** ~70+ politiques RLS

### Vérifier les buckets Storage
```sql
SELECT * FROM storage.buckets;
```

**Attendu:** 3 buckets
- signatures
- photos
- documents

### Test API
```bash
# Health check
curl http://localhost:3000/api/health

# Devrait retourner:
# {"status":"healthy","database":"connected","mode":"demo"}
```

---

## 🚀 Démarrage

```bash
# Développement (avec hot reload)
npm run dev

# Production
npm start
```

Le serveur démarre sur `http://localhost:3000`

---

## 📚 Documentation

- **API complète:** [docs/API.md](../docs/API.md)
- **Déploiement:** [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)
- **README:** [README.md](../README.md)

---

## 🐛 Résolution de problèmes

### "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Database connection failed"
Vérifier dans `.env.local`:
- `SUPABASE_URL` est correct
- `SUPABASE_SERVICE_ROLE_KEY` est correct
- Le projet Supabase est actif

### "Port 3000 already in use"
```bash
# Trouver le processus
lsof -i :3000

# Tuer le processus
kill -9 <PID>

# Ou changer le port
PORT=3001 npm run dev
```

### Migrations SQL échouent
- Vérifier que vous êtes dans le bon projet Supabase
- Exécuter les fichiers dans l'ordre exact
- Si erreur "already exists", ignorer et continuer
- Vérifier les logs dans Dashboard > Database > Logs

---

## 📞 Support

- **Issues GitHub:** https://github.com/johnnyfleury87-ctrl/JETC_Immo/issues
- **Email:** support@jetc-immo.fr

---

## ✅ Checklist Installation

- [ ] Node.js v18+ installé
- [ ] Dépendances npm installées
- [ ] Fichier .env.local créé et configuré
- [ ] Projet Supabase créé
- [ ] Migrations schema exécutées (6 fichiers)
- [ ] Politiques RLS exécutées (17 fichiers)
- [ ] Storage buckets créés
- [ ] Serveur démarre sans erreur
- [ ] Health check répond
- [ ] Documentation lue

**🎉 Installation complète !**
