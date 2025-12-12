# 🚀 Guide de Déploiement - JETC_Immo

Ce guide couvre le déploiement de l'API JETC_Immo en production.

---

## 📋 Prérequis

- Compte Supabase (gratuit ou pro)
- Node.js v18+ installé
- Git installé
- Accès SSH à un serveur (si déploiement VPS)

---

## 🗄️ Configuration Supabase (Production)

### 1. Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Choisir une région proche de vos utilisateurs
4. Noter les informations:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **Anon Key:** Pour le frontend (public)
   - **Service Role Key:** Pour le backend (SECRET)

### 2. Exécuter les migrations SQL

Dans l'éditeur SQL Supabase (Dashboard > SQL Editor), exécuter **dans l'ordre**:

#### a) Schema et tables

```sql
-- 1. Initialisation
-- Copier/coller le contenu de: supabase/schema/00_init_schema.sql
-- Puis exécuter (Run)

-- 2. Tables
-- Copier/coller: supabase/schema/01_tables.sql
-- Exécuter

-- 3. Relations (Foreign Keys)
-- Copier/coller: supabase/schema/02_relations.sql
-- Exécuter

-- 4. Vues SQL
-- Copier/coller: supabase/schema/03_views.sql
-- Exécuter

-- 5. Fonctions
-- Copier/coller: supabase/schema/04_functions.sql
-- Exécuter

-- 6. Triggers
-- Copier/coller: supabase/schema/05_triggers.sql
-- Exécuter
```

#### b) Politiques RLS

Exécuter tous les fichiers de `supabase/policies/` dans l'ordre numérique:

```sql
-- 10_policies_profiles.sql
-- 11_policies_regies.sql
-- 12_policies_entreprises.sql
-- ... (jusqu'à 26_policies_logs_activite.sql)
```

#### c) Storage Buckets

```sql
-- Copier/coller: supabase/storage/storage_buckets.sql
-- Exécuter
```

### 3. Vérifier la configuration

```sql
-- Vérifier les tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Devrait retourner 17 tables

-- Vérifier les politiques RLS
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';

-- Devrait retourner ~70+ politiques

-- Vérifier les buckets
SELECT * FROM storage.buckets;

-- Devrait retourner 3 buckets (signatures, photos, documents)
```

---

## 🌐 Déploiement Cloud (Options)

### Option 1: Railway (Recommandé - Simple)

**Avantages:** Déploiement automatique, base de données incluse, certificat SSL gratuit.

#### Étapes:

1. **Installer Railway CLI:**

```bash
npm install -g @railway/cli
```

2. **Login:**

```bash
railway login
```

3. **Initialiser le projet:**

```bash
cd JETC_Immo
railway init
```

4. **Configurer les variables d'environnement:**

```bash
railway variables set SUPABASE_URL=https://xxxxx.supabase.co
railway variables set SUPABASE_ANON_KEY=eyJhbGc...
railway variables set SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
railway variables set MODE=pro
railway variables set PORT=3000
```

5. **Déployer:**

```bash
railway up
```

6. **Obtenir l'URL:**

```bash
railway domain
```

Votre API sera disponible sur: `https://jetc-immo-production.up.railway.app`

---

### Option 2: Render

**Avantages:** Gratuit jusqu'à 750h/mois, SSL automatique.

#### Étapes:

1. Aller sur [render.com](https://render.com)

2. **New > Web Service**

3. Connecter votre repo GitHub `johnnyfleury87-ctrl/JETC_Immo`

4. Configuration:
   - **Name:** jetc-immo-api
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node api/index.js`
   - **Plan:** Free (ou Starter pour production)

5. Variables d'environnement:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
MODE=pro
PORT=3000
```

6. **Create Web Service**

Deploy automatique à chaque push sur `main`.

---

### Option 3: Fly.io

**Avantages:** Infrastructure mondiale, edge computing.

#### Étapes:

1. **Installer Fly CLI:**

```bash
curl -L https://fly.io/install.sh | sh
```

2. **Login:**

```bash
flyctl auth login
```

3. **Créer `fly.toml`:**

```toml
app = "jetc-immo-api"

[build]
  builder = "heroku/buildpacks:20"

[env]
  PORT = "3000"
  MODE = "pro"

[[services]]
  http_checks = []
  internal_port = 3000
  processes = ["app"]
  protocol = "tcp"
  script_checks = []

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443
```

4. **Launch:**

```bash
flyctl launch
```

5. **Définir les secrets:**

```bash
flyctl secrets set SUPABASE_URL=https://xxxxx.supabase.co
flyctl secrets set SUPABASE_ANON_KEY=eyJhbGc...
flyctl secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

6. **Deploy:**

```bash
flyctl deploy
```

---

### Option 4: VPS Linux (Ubuntu 22.04)

**Avantages:** Contrôle total, performances optimales.

#### Étapes:

1. **Connexion SSH:**

```bash
ssh root@votre-serveur.com
```

2. **Mettre à jour le système:**

```bash
apt update && apt upgrade -y
```

3. **Installer Node.js 18:**

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
node -v  # Vérifier la version
```

4. **Installer Git:**

```bash
apt-get install -y git
```

5. **Créer un utilisateur dédié:**

```bash
adduser jetc --disabled-password --gecos ""
usermod -aG sudo jetc
su - jetc
```

6. **Cloner le projet:**

```bash
cd ~
git clone https://github.com/johnnyfleury87-ctrl/JETC_Immo.git
cd JETC_Immo
```

7. **Installer les dépendances:**

```bash
npm install --production
```

8. **Créer le fichier .env.local:**

```bash
nano .env.local
```

Contenu:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
MODE=pro
PORT=3000
```

9. **Installer PM2 (Process Manager):**

```bash
sudo npm install -g pm2
```

10. **Démarrer l'application:**

```bash
pm2 start api/index.js --name jetc-immo
pm2 save
pm2 startup  # Suivre les instructions affichées
```

11. **Vérifier le statut:**

```bash
pm2 status
pm2 logs jetc-immo
```

12. **Installer Nginx (reverse proxy):**

```bash
sudo apt-get install -y nginx
```

13. **Configurer Nginx:**

```bash
sudo nano /etc/nginx/sites-available/jetc-immo
```

Contenu:

```nginx
server {
    listen 80;
    server_name api.jetc-immo.fr;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

14. **Activer la configuration:**

```bash
sudo ln -s /etc/nginx/sites-available/jetc-immo /etc/nginx/sites-enabled/
sudo nginx -t  # Vérifier la config
sudo systemctl restart nginx
```

15. **Installer Certbot (SSL gratuit):**

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.jetc-immo.fr
```

16. **Configurer le firewall:**

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## 🔐 Sécurité Production

### 1. Variables d'environnement

**IMPORTANT:** Ne JAMAIS commiter `.env.local` dans Git.

Ajouter à `.gitignore`:

```
.env.local
.env.production
.env
```

### 2. Service Role Key

La `SUPABASE_SERVICE_ROLE_KEY` doit rester **secrète**. Elle permet de bypasser RLS.

Ne l'exposer **QUE** côté backend/serveur.

### 3. CORS (si API publique)

Modifier `api/index.js`:

```javascript
import cors from "cors";

const allowedOrigins = ["https://app.jetc-immo.fr", "https://jetc-immo.fr"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Non autorisé par CORS"));
      }
    },
  })
);
```

### 4. Rate Limiting

Installer `express-rate-limit`:

```bash
npm install express-rate-limit
```

Ajouter dans `api/index.js`:

```javascript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requêtes par IP
  message: "Trop de requêtes, réessayez plus tard",
});

app.use("/api/", limiter);
```

### 5. Helmet (sécurité headers)

```bash
npm install helmet
```

```javascript
import helmet from "helmet";
app.use(helmet());
```

---

## 📊 Monitoring

### 1. Logs avec PM2

```bash
pm2 logs jetc-immo
pm2 logs jetc-immo --lines 100
pm2 logs jetc-immo --err  # Erreurs uniquement
```

### 2. Monitoring PM2

```bash
pm2 monit  # Interface temps réel
```

### 3. Sentry (erreurs production)

```bash
npm install @sentry/node
```

Configurer dans `api/index.js`:

```javascript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://xxxxx@sentry.io/xxxxx",
  environment: process.env.MODE || "production",
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### 4. Uptime Monitoring

Services gratuits:

- [UptimeRobot](https://uptimerobot.com)
- [Pingdom](https://pingdom.com)
- [BetterUptime](https://betteruptime.com)

Configurer une alerte sur `https://api.jetc-immo.fr/api/health`

---

## 🔄 Mises à Jour

### Railway/Render

Push sur `main` → Deploy automatique

### Fly.io

```bash
flyctl deploy
```

### VPS

```bash
ssh jetc@votre-serveur.com
cd JETC_Immo
git pull origin main
npm install --production
pm2 restart jetc-immo
```

---

## 💾 Sauvegardes

### Base de données Supabase

1. Dashboard Supabase > Settings > Database
2. **Connection String** > Copier
3. Utiliser `pg_dump`:

```bash
pg_dump "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres" > backup.sql
```

### Automatiser avec cron

```bash
crontab -e
```

Ajouter:

```cron
0 2 * * * pg_dump "postgresql://..." > /backups/jetc_$(date +\%Y\%m\%d).sql
```

---

## 🐛 Troubleshooting

### Erreur: "Cannot connect to Supabase"

- Vérifier `SUPABASE_URL` dans `.env.local`
- Vérifier que le projet Supabase est actif
- Tester la connexion: `curl https://xxxxx.supabase.co`

### Erreur 403: "Access denied"

- Vérifier que RLS est bien configuré
- Vérifier le JWT token
- Vérifier les politiques SQL

### Erreur: "Port already in use"

```bash
# Trouver le processus
lsof -i :3000

# Tuer le processus
kill -9 <PID>
```

### PM2: Application crash loop

```bash
pm2 logs jetc-immo --err
pm2 delete jetc-immo
pm2 start api/index.js --name jetc-immo
```

---

## 📞 Support

- **Documentation API:** [docs/API.md](./API.md)
- **Issues GitHub:** https://github.com/johnnyfleury87-ctrl/JETC_Immo/issues
- **Email:** support@jetc-immo.fr

---

## ✅ Checklist Déploiement

- [ ] Projet Supabase créé
- [ ] Toutes les migrations SQL exécutées
- [ ] RLS activé et testé
- [ ] Storage buckets configurés
- [ ] Variables d'environnement définies
- [ ] Application déployée
- [ ] SSL/HTTPS configuré
- [ ] Monitoring configuré (Sentry, Uptime)
- [ ] Sauvegardes automatiques configurées
- [ ] Rate limiting activé
- [ ] CORS configuré
- [ ] Documentation à jour
- [ ] Tests manuels effectués
- [ ] URL communiquée à l'équipe

---

**🎉 Votre API JETC_Immo est maintenant en production !**
