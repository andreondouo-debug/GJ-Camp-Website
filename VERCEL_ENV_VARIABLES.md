# Configuration des Variables d'Environnement Vercel

## Problème Identifié
Le build Vercel échoue parce que `process.env.CI = true` traite les warnings ESLint comme des erreurs.

## Solution: Configurer les Variables d'Environnement sur Vercel

### Étapes à Suivre

1. **Accéder aux Paramètres Vercel**
   - Aller sur [vercel.com](https://vercel.com)
   - Sélectionner votre projet `GJ-Camp-Website`
   - Cliquer sur **Settings** → **Environment Variables**

2. **Ajouter les Variables Suivantes**

   | Variable Name | Value | Environment |
   |--------------|-------|-------------|
   | `ESLINT_NO_DEV_ERRORS` | `true` | Production |
   | `CI` | `false` | Production |

3. **Redéployer**
   - Après avoir ajouté les variables, cliquer sur **Deployments**
   - Trouver le dernier déploiement et cliquer sur **⋮** → **Redeploy**

## Alternative: Utiliser l'Interface en Ligne de Commande

```bash
# Installer Vercel CLI si pas déjà fait
npm install -g vercel

# Se connecter
vercel login

# Ajouter les variables d'environnement
vercel env add ESLINT_NO_DEV_ERRORS
# Entrer: true
# Sélectionner: Production

vercel env add CI
# Entrer: false
# Sélectionner: Production

# Déclencher un redéploiement
vercel --prod
```

## Vérification du Déploiement

Une fois le redéploiement terminé (~3 minutes):

```bash
# Vérifier la nouvelle version du Service Worker
curl -sL https://gjsdecrpt.fr/service-worker.js | grep "CACHE_VERSION"

# Devrait afficher: const CACHE_VERSION = `v0.1.0-2026-01-16`;
```

## Variables d'Environnement Complètes Recommandées

```env
# Backend API URL
REACT_APP_API_URL=https://gj-camp-backend.onrender.com

# PayPal Client ID Production
REACT_APP_PAYPAL_CLIENT_ID=<votre_client_id_production>

# VAPID Public Key pour notifications push
REACT_APP_VAPID_PUBLIC_KEY=BMeQUOJvDDd3AbpQtNvNfPnFYA5DdRND1jX0d3grkCSSqBvBFuxBGvtMM9NHf6REg8BPu1XBbU6jF_9GU4hltEE

# Désactiver le mode strict ESLint
ESLINT_NO_DEV_ERRORS=true
CI=false
```

## Notes Importantes

- Les fichiers `.env.*` sont ignorés par git pour la sécurité
- Toutes les variables sensibles doivent être configurées via l'interface Vercel
- Les modifications de variables d'environnement nécessitent un redéploiement complet
- Vercel injecte automatiquement `CI=true`, il faut le surcharger explicitement
