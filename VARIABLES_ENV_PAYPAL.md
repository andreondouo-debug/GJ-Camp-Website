# ⚡ Configuration RAPIDE - Variables d'environnement

## 🔵 VERCEL (Frontend)

### Allez sur : https://vercel.com/votre-projet/settings/environment-variables

Ajoutez ces 2 variables (Environment: **Production**) :

```
REACT_APP_PAYPAL_SANDBOX_CLIENT_ID = AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-cpwsC1a4u9RfSrQC9pqFX-FOFqWTb

REACT_APP_PAYPAL_LIVE_CLIENT_ID = VOTRE_CLIENT_ID_LIVE (à obtenir sur developer.paypal.com)
```

⚠️ **Supprimez** l'ancienne variable `REACT_APP_PAYPAL_CLIENT_ID` si elle existe

---

## 🟢 RENDER (Backend)

### Allez sur : https://dashboard.render.com/votre-service/env

Ajoutez ces 4 variables :

```
PAYPAL_SANDBOX_CLIENT_ID = AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-cpwsC1a4u9RfSrQC9pqFX-FOFqWTb

PAYPAL_SANDBOX_CLIENT_SECRET = EBGL8OQ0k2EvtVS1CVXvuJ99Lv42EN61bSkOgh3nStxB4f0Yx7Z-ScRzoYTSLEfb_M_OK9qnKPWm3WjV

PAYPAL_LIVE_CLIENT_ID = VOTRE_CLIENT_ID_LIVE

PAYPAL_LIVE_CLIENT_SECRET = VOTRE_CLIENT_SECRET_LIVE
```

⚠️ **Supprimez** les anciennes variables `PAYPAL_CLIENT_ID` et `PAYPAL_CLIENT_SECRET` si elles existent

---

## 🔑 Obtenir credentials Live

1. https://developer.paypal.com
2. Basculez en mode **Live** (toggle en haut)
3. **My Apps & Credentials** → **Create App**
4. Copiez **Client ID** et **Client Secret**

---

## ✅ Vérification

Après configuration :
1. Redéployez Vercel si nécessaire
2. Render redémarre automatiquement
3. Allez sur https://gjsdecrpt.fr/parametres
4. Onglet **💳 Paiements**
5. Basculez entre Sandbox et Live
6. Vérifiez le badge sur le formulaire d'inscription

---

## 🧪 Test Sandbox

Carte de test :
- **Visa** : `4032039847809776`
- **Expiration** : `12/2027`
- **CVV** : `123`

---

## 📖 Documentation complète

Voir `CONFIGURATION_PAYPAL_SANDBOX_LIVE.md`
