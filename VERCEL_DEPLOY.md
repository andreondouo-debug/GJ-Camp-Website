# Configuration Vercel - Frontend GRATUIT

## Etape 1 : Creer compte Vercel

1. Aller sur : https://vercel.com
2. Sign up with GitHub
3. Autoriser Vercel

## Etape 2 : Deployer Frontend

1. Dashboard Vercel → "Add New" → "Project"
2. Import Git Repository → Selectionner "GJ-Camp-Website"
3. Configure Project :

```
Framework Preset: Create React App
Root Directory: frontend
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

4. Environment Variables (cliquer "Add") :

```
REACT_APP_API_URL=https://gj-camp-backend-xxxx.onrender.com
REACT_APP_PAYPAL_CLIENT_ID=AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-cpwsC1a4u9RfSrQC9pqFX-FOFqWTb
```

5. Deploy → Attendre 2-3 minutes

## Etape 3 : Domaine Personnalise

1. Project Settings → Domains
2. Add : votre-domaine.com
3. Configurer DNS chez registrar :

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

HTTPS automatique avec Let's Encrypt !

## Avantages Vercel

- Ultra rapide (CDN Cloudflare)
- Toujours actif (pas de sleep)
- Deploy auto a chaque push Git
- Preview URLs pour chaque branche
- Analytics gratuit
- Support excellent

## URL finale

Votre site : https://votre-domaine.com
Vercel URL : https://gj-camp-website.vercel.app
