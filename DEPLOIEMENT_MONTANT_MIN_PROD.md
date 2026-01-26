# 🚀 Déploiement Paramètres Montant Minimum - Production

## ✅ Étapes Complétées

1. ✅ **Code modifié** :
   - Backend : Montants min/max configurables via Settings
   - Frontend : Nouvel onglet "🎫 Inscription" dans Paramètres

2. ✅ **Commit créé** : `60676db`

3. ✅ **Push GitHub** : Code sur `main`

## ⏳ En Cours (Automatique)

### Render (Backend)
- URL : https://dashboard.render.com/web/srv-ctdq6bq3esus73ak6e9g
- Status : Déploiement automatique en cours...
- Temps estimé : **3-5 minutes**

### Vercel (Frontend)
- URL : https://vercel.com/andreondouo-debugs-projects/gj-camp-website-frontend
- Status : Déploiement automatique en cours...
- Temps estimé : **2-3 minutes**

## 📋 Prochaines Étapes (Vous)

### 1. Attendre les Déploiements (~5 min)

Vérifiez :
- Render : https://gj-camp-backend.onrender.com/api/health
- Vercel : https://gjsdecrpt.fr

### 2. Configurer le Montant Minimum

1. Allez sur : **https://gjsdecrpt.fr/parametres**
2. Connectez-vous en tant qu'admin
3. Cliquez sur l'onglet **"🎫 Inscription"**
4. Changez :
   - **Montant minimum** : `1` (au lieu de 20)
   - **Montant maximum** : `120` (garder)
5. Cliquez sur **"💾 Enregistrer"**

### 3. Tester le Paiement en Production

1. Allez sur : **https://gjsdecrpt.fr/inscription**
2. Remplissez le formulaire
3. **Montant** : Mettez `1€`
4. Cliquez sur PayPal
5. **Utilisez votre vraie carte** (paiement réel de 1€)
6. Validez

⚠️ **C'est un VRAI paiement** - Vous serez débité de 1€ + frais PayPal (~0.38€)

## 💰 Coûts du Test

- Montant : 1.00€
- Frais PayPal : 0.38€
- **Total débité** : 1.38€

Vous pouvez rembourser après sur : https://www.paypal.com/activity

## 🔄 Pour Revenir à la Normale

Après vos tests, retournez dans Paramètres et remettez :
- **Montant minimum** : `20€`

## 📊 Suivi des Déploiements

### Vérifier Render
```bash
curl https://gj-camp-backend.onrender.com/api/health
# Doit retourner: {"message":"✅ Backend fonctionnel"}
```

### Vérifier Vercel
```bash
curl -I https://gjsdecrpt.fr
# Doit retourner: HTTP/2 200
```

## ⏱️ Timeline

- ✅ **00:00** - Push GitHub
- ⏳ **00:00-05:00** - Déploiements automatiques
- ⏳ **00:05** - Configurer les paramètres sur le site
- ⏳ **00:06** - Tester le paiement de 1€
- ✅ **00:07** - Test terminé !

**Temps total estimé : 7 minutes**
