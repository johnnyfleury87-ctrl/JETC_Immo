# Configuration des Buckets Supabase Storage

Ce dossier contient la configuration des buckets de stockage pour :

## Buckets prévus

### 1. photos_tickets
- **Usage** : Photos attachées aux tickets créés par les locataires
- **Accès** : Privé (RLS)
- **Format** : `{ticket_id}/{uuid}.jpg`

### 2. photos_missions
- **Usage** : Photos d'intervention prises par les techniciens
- **Accès** : Privé (RLS)
- **Format** : `{mission_id}/{uuid}.jpg`

### 3. signatures
- **Usage** : Signatures numériques (technicien, locataire)
- **Accès** : Privé (RLS)
- **Format** : `{mission_id}/signature_{role}.png`

## Mode DEMO/PRO

En mode DEMO, utiliser des buckets séparés :
- `photos_tickets_demo`
- `photos_missions_demo`
- `signatures_demo`

## Configuration à faire dans Supabase

1. Créer les buckets via l'interface Supabase Storage
2. Définir les policies RLS dans `/supabase/policies/storage/`
3. Configurer les routes API dans `/api/files/`

Note : Cette configuration sera effectuée lors de l'étape correspondante (après étape 9).
