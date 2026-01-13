#!/bin/bash

# Script de configuration du domaine personnalisé
# Usage: ./configure-domain.sh votredomaine.com

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
  echo "❌ Erreur: Veuillez fournir votre domaine"
  echo "Usage: ./configure-domain.sh mondomaine.com"
  exit 1
fi

echo "🌐 Configuration du domaine: $DOMAIN"
echo ""

echo "📋 ÉTAPE 1: Configuration DNS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Ajoutez ces enregistrements DNS chez votre registrar:"
echo ""
echo "Pour le Frontend (Vercel):"
echo "  Type: CNAME | Nom: www | Valeur: cname.vercel-dns.com"
echo "  Type: A    | Nom: @   | Valeur: 76.76.21.21"
echo ""
echo "Pour le Backend (Render):"
echo "  Type: CNAME | Nom: api | Valeur: gj-camp-website-1.onrender.com"
echo ""
read -p "✅ DNS configurés? (o/n) " dns_ok
if [ "$dns_ok" != "o" ]; then
  echo "⚠️  Configurez d'abord vos DNS puis relancez ce script"
  exit 1
fi

echo ""
echo "🎨 ÉTAPE 2: Vercel - Ajout du domaine"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Allez sur: https://vercel.com/dashboard"
echo "2. Projet gj-camp-website-3fuu → Settings → Domains"
echo "3. Ajoutez: www.$DOMAIN"
echo "4. Ajoutez: $DOMAIN"
echo ""
read -p "✅ Domaines ajoutés sur Vercel? (o/n) " vercel_ok

echo ""
echo "🔧 ÉTAPE 3: Render - Domaine personnalisé"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Allez sur: https://dashboard.render.com"
echo "2. Service gj-camp-website-1 → Settings → Custom Domain"
echo "3. Ajoutez: api.$DOMAIN"
echo "4. Activez HTTPS"
echo ""
read -p "✅ Domaine backend configuré? (o/n) " render_ok

echo ""
echo "🔄 ÉTAPE 4: Variables d'environnement"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Sur Render (Backend):"
echo "  FRONTEND_URL=https://www.$DOMAIN,https://$DOMAIN"
echo ""
echo "Sur Vercel (Frontend):"
echo "  REACT_APP_API_URL=https://api.$DOMAIN"
echo ""
read -p "✅ Variables configurées? (o/n) " env_ok

echo ""
echo "📄 ÉTAPE 5: Documentation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cat > DOMAIN_CONFIG.md << EOF
# Configuration Domaine: $DOMAIN

## URLs Finales
- **Frontend**: https://www.$DOMAIN et https://$DOMAIN
- **Backend API**: https://api.$DOMAIN

## DNS Configurés
\`\`\`
Type: CNAME | Nom: www | Valeur: cname.vercel-dns.com
Type: A    | Nom: @   | Valeur: 76.76.21.21
Type: CNAME | Nom: api | Valeur: gj-camp-website-1.onrender.com
\`\`\`

## Variables d'environnement

### Render (Backend)
\`\`\`
FRONTEND_URL=https://www.$DOMAIN,https://$DOMAIN
\`\`\`

### Vercel (Frontend)
\`\`\`
REACT_APP_API_URL=https://api.$DOMAIN
\`\`\`

## Tests
- Frontend: https://www.$DOMAIN
- Backend Health: https://api.$DOMAIN/api/health
- Backend Activities: https://api.$DOMAIN/api/activities

## Propagation DNS
La propagation DNS peut prendre 24-48h. Vérifiez avec:
\`\`\`
nslookup www.$DOMAIN
nslookup api.$DOMAIN
\`\`\`

Date de configuration: $(date)
EOF

echo "✅ Documentation créée: DOMAIN_CONFIG.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Configuration terminée!"
echo ""
echo "📝 Résumé:"
echo "  - Frontend: https://www.$DOMAIN"
echo "  - Backend: https://api.$DOMAIN"
echo ""
echo "⏱️  Attendez la propagation DNS (quelques minutes à 48h)"
echo ""
echo "🧪 Testez avec:"
echo "  curl https://api.$DOMAIN/api/health"
echo ""
