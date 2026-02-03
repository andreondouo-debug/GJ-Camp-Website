# 🚀 Déploiement Manuel sur Render - Guide Rapide

## 🎯 Problème

Le push GitHub a été fait mais le service Render **`gj-camp-website-1`** ne s'est pas automatiquement redéployé avec les nouvelles modifications.

## ✅ Solution : Redéploiement Manuel

### Étape 1 : Accéder au Dashboard Render

1. Aller sur : **https://dashboard.render.com**
2. Se connecter avec ton compte

### Étape 2 : Trouver le Service

1. Dans la liste des services, chercher : **`gj-camp-website-1`**
2. Cliquer dessus pour ouvrir les détails

### Étape 3 : Forcer le Redéploiement

1. En haut à droite, cliquer sur le bouton **"Manual Deploy"** 
2. Sélectionner la branche **`main`**
3. Cliquer sur **"Deploy latest commit"**

```
╔════════════════════════════════════════╗
║  Manual Deploy                         ║
║                                        ║
║  Branch: main                          ║
║  Commit: 80598c9 (Fix routes paiement) ║
║                                        ║
║  [ Deploy latest commit ]              ║
╚════════════════════════════════════════╝
```

### Étape 4 : Attendre le Déploiement

Le déploiement prend environ **2-3 minutes**. Tu verras :

```
🔄 Building...
🔧 Installing dependencies...
✅ Build complete
🚀 Deploying...
✅ Live
```

### Étape 5 : Vérifier

Une fois le statut à **"Live"** (point vert), tester :

```bash
# Test 1 : Backend répond
curl https://api.gjsdecrpt.fr/api/health
# ✅ Devrait retourner: {"message":"✅ Backend fonctionnel"}

# Test 2 : Route corrigée existe
curl https://api.gjsdecrpt.fr/api/registrations/mes-inscriptions
# ❌ Devrait retourner erreur auth (mais pas 404 "Route non trouvée")

# Test 3 : Route camp-with-account
curl -X POST https://api.gjsdecrpt.fr/api/registrations/camp-with-account
# ❌ Devrait retourner erreur validation (mais pas 404)
```

## 🔍 Vérification depuis le Dashboard

### Logs en Direct

1. Dans le service **`gj-camp-website-1`**
2. Onglet **"Logs"**
3. Chercher :
   ```
   🚀 Serveur démarré sur le port 5000
   ✅ MongoDB connecté avec succès
   ```

### Variables d'Environnement

1. Onglet **"Environment"**
2. Vérifier que ces variables existent :
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `FRONTEND_URL`
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`

## 🎯 Test Final - Inscription avec PayPal

Une fois le service redéployé :

1. Aller sur **https://www.gjsdecrpt.fr/inscription**
2. Remplir le formulaire
3. Montant : **20€**
4. Cliquer sur **"Valider mon inscription"**
5. ✅ **Le bouton PayPal devrait s'afficher (plus d'erreur 404 !)**

## ⚙️ Activer les Déploiements Automatiques

Pour éviter ce problème à l'avenir :

1. Dans le service **`gj-camp-website-1`**
2. Onglet **"Settings"**
3. Section **"Build & Deploy"**
4. Vérifier **"Auto-Deploy"** : `Yes`
5. Branche : `main`

Si c'était déjà activé, le problème peut venir de :
- Webhook GitHub non configuré
- Service en mode "Suspended" (gratuit)
- Erreur lors du build précédent

## 🆘 Si le Redéploiement Échoue

### Erreur : "Build failed"

1. Regarder les logs de build
2. Vérifier `package.json` dans `/backend`
3. Vérifier que toutes les dépendances sont installables

### Erreur : "Service starting"

Attendre 2-3 minutes. Les services gratuits Render peuvent être lents au démarrage.

### Erreur : "Out of memory"

Le service gratuit Render a 512MB de RAM. Si le build échoue, essayer de :
- Réduire les dépendances
- Utiliser un plan payant

## 📝 Checklist

- [ ] Connexion à dashboard.render.com
- [ ] Service `gj-camp-website-1` trouvé
- [ ] Clic sur "Manual Deploy"
- [ ] Branche `main` sélectionnée
- [ ] "Deploy latest commit" cliqué
- [ ] Statut passe à "Live" (point vert)
- [ ] Test `curl https://api.gjsdecrpt.fr/api/health` OK
- [ ] Test inscription sur https://www.gjsdecrpt.fr/inscription OK

---

**Créé le** : 3 février 2026  
**Commit déployé** : `80598c9` (Fix routes paiement)
