# 🔧 Configuration PayPal Sandbox/Live - Vercel & Render

## 📋 Vue d'ensemble

Votre site peut maintenant basculer entre **mode Sandbox** (test) et **mode Live** (production) depuis l'interface admin (`/parametres` → onglet 💳 Paiements).

Pour que cela fonctionne correctement, vous devez configurer **DEUX paires de credentials PayPal** :
- **Sandbox** : Pour les tests (carte virtuelle)
- **Live** : Pour les vraies transactions

---

## 🔑 1. Obtenir vos credentials PayPal

### Mode Sandbox (Test) - ✅ DÉJÀ CONFIGURÉ

Vous avez déjà vos credentials sandbox :
```
Client ID: AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-cpwsC1a4u9RfSrQC9pqFX-FOFqWTb
Client Secret: EBGL8OQ0k2EvtVS1CVXvuJ99Lv42EN61bSkOgh3nStxB4f0Yx7Z-ScRzoYTSLEfb_M_OK9qnKPWm3WjV
```

### Mode Live (Production) - ⚠️ À OBTENIR

1. **Connectez-vous** : https://developer.paypal.com
2. **Passez en mode Live** : Cliquez sur le toggle "Sandbox/Live" en haut
3. **Créez une app** :
   - Allez dans "My Apps & Credentials"
   - Cliquez "Create App" (section Live)
   - Nom : "GJ Camp Production"
4. **Copiez vos credentials Live** :
   - Client ID (commence par `A...`)
   - Client Secret (cliquez "Show" pour le révéler)

---

## ☁️ 2. Configuration VERCEL (Frontend)

### Variables d'environnement à ajouter :

1. Allez sur https://vercel.com/votre-projet/settings/environment-variables

2. Ajoutez ces 2 variables :

| Nom | Valeur | Environnement |
|-----|--------|---------------|
| `REACT_APP_PAYPAL_SANDBOX_CLIENT_ID` | `AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-cpwsC1a4u9RfSrQC9pqFX-FOFqWTb` | Production |
| `REACT_APP_PAYPAL_LIVE_CLIENT_ID` | `VOTRE_CLIENT_ID_LIVE` | Production |

### ⚠️ Important :
- Supprimez l'ancienne variable `REACT_APP_PAYPAL_CLIENT_ID` si elle existe
- Redéployez après avoir ajouté les variables

---

## 🖥️ 3. Configuration RENDER (Backend)

### Variables d'environnement à ajouter :

1. Allez sur https://dashboard.render.com/votre-service/env

2. Ajoutez ces 4 variables :

| Nom | Valeur |
|-----|--------|
| `PAYPAL_SANDBOX_CLIENT_ID` | `AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-cpwsC1a4u9RfSrQC9pqFX-FOFqWTb` |
| `PAYPAL_SANDBOX_CLIENT_SECRET` | `EBGL8OQ0k2EvtVS1CVXvuJ99Lv42EN61bSkOgh3nStxB4f0Yx7Z-ScRzoYTSLEfb_M_OK9qnKPWm3WjV` |
| `PAYPAL_LIVE_CLIENT_ID` | `VOTRE_CLIENT_ID_LIVE` |
| `PAYPAL_LIVE_CLIENT_SECRET` | `VOTRE_CLIENT_SECRET_LIVE` |

### ⚠️ Important :
- Supprimez les anciennes variables `PAYPAL_CLIENT_ID` et `PAYPAL_CLIENT_SECRET` si elles existent
- Render redémarrera automatiquement après modification

---

## 🧪 4. Tester en mode Sandbox

1. Allez sur https://gjsdecrpt.fr/parametres
2. Onglet **💳 Paiements**
3. Sélectionnez **🧪 SANDBOX**
4. Enregistrez
5. Allez sur le formulaire d'inscription
6. Vérifiez que le badge dit **"🧪 Mode TEST (Sandbox)"**
7. Utilisez une carte de test PayPal :
   - Visa : `4032039847809776`
   - Expiration : `12/2027` | CVV : `123`

---

## 🔴 5. Basculer en mode Live (Production)

### ⚠️ ATTENTION : En mode Live, les transactions sont RÉELLES !

1. **Obtenez vos credentials Live** (voir section 1)
2. **Configurez-les sur Vercel et Render** (voir sections 2 et 3)
3. **Allez sur** https://gjsdecrpt.fr/parametres
4. **Onglet 💳 Paiements**
5. **Sélectionnez 🔴 LIVE**
6. **Enregistrez**
7. **Vérifiez** que le badge dit **"🔴 Mode PRODUCTION (Live)"**

---

## 📊 6. Vérification

### Logs backend (Render)
```
💳 PayPal Client - Mode: SANDBOX
```
ou
```
💳 PayPal Client - Mode: LIVE
```

### Badge frontend
- Sandbox : **🧪 Mode TEST (Sandbox)** (fond bleu)
- Live : **🔴 Mode PRODUCTION (Live)** (fond rouge)

---

## 🔐 7. Sécurité

✅ **Bonnes pratiques :**
- Ne JAMAIS commiter les credentials dans Git
- Utilisez TOUJOURS les variables d'environnement
- Testez en Sandbox avant de passer en Live
- Surveillez les logs de transactions dans Render

❌ **À NE PAS FAIRE :**
- Passer en mode Live sans avoir configuré les vraies credentials
- Laisser le mode Live activé pendant les tests
- Partager vos credentials Live publiquement

---

## 🆘 8. Dépannage

### Erreur "Client ID PayPal non configuré"
→ Vérifiez que les variables d'environnement sont bien configurées sur Vercel/Render

### Le badge ne change pas
→ Videz le cache du navigateur et rechargez la page

### Les paiements ne fonctionnent pas en Live
→ Vérifiez que vos credentials Live sont corrects et que votre compte PayPal est bien vérifié

### Comment revenir en Sandbox ?
→ Allez sur `/parametres` → 💳 Paiements → Sélectionnez 🧪 SANDBOX → Enregistrez

---

## 📞 Support

- **Documentation PayPal** : https://developer.paypal.com/docs/
- **Sandbox Test Cards** : https://developer.paypal.com/tools/sandbox/card-testing/

---

✅ **Configuration terminée !** Vous pouvez maintenant basculer entre Sandbox et Live en un clic.
