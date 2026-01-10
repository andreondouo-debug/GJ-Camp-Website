# 📧 Configuration des Emails - GJ Camp

## 🔴 Problème Actuel
Le backend utilise **Ethereal** (service de test) → les emails ne sont PAS envoyés aux vraies adresses.

---

## ✅ Solution : Configurer Gmail

### Étape 1 : Créer un mot de passe d'application Gmail

1. **Aller sur** : https://myaccount.google.com/security
2. **Activer la validation en 2 étapes** (si pas déjà fait)
3. **Rechercher** : "Mots de passe des applications"
4. **Créer un nouveau mot de passe** :
   - Application : "GJ Camp Website"
   - Type : "Autre (nom personnalisé)"
5. **Copier le mot de passe généré** (16 caractères sans espaces)
   - Exemple : `abcd efgh ijkl mnop`

### Étape 2 : Configurer Render Backend

1. **Aller sur** : https://dashboard.render.com
2. **Sélectionner** : `gj-camp-backend`
3. **Environment** → Modifier les variables :

```env
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=gjcontactgj0@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop   ← Votre mot de passe d'application
EMAIL_FROM=gjcontactgj0@gmail.com
```

4. **Save** → Le backend va redémarrer (2-3 min)

### Étape 3 : Tester

```bash
# Réveiller le backend
curl https://gj-camp-website-1.onrender.com/api/health

# Faire une inscription test
# → Email doit arriver dans la vraie boîte mail !
```

---

## 📋 Types d'emails envoyés

1. **Email de vérification** (inscription compte)
   - Lien pour confirmer l'email
   - Expire après 24h

2. **Email de confirmation d'inscription** (après paiement)
   - Récapitulatif inscription
   - Montant payé / restant
   - Accès au programme

3. **Email de validation paiement espèces**
   - Confirmation par responsable
   - Statut paiement

4. **Email réinitialisation mot de passe**
   - Lien pour changer le mot de passe

---

## 🔧 Alternative : SendGrid (Plus professionnel)

### Avantages
- ✅ Gratuit jusqu'à 100 emails/jour
- ✅ Meilleure délivrabilité
- ✅ Statistiques d'envoi
- ✅ Templates HTML

### Configuration

1. **Créer compte** : https://signup.sendgrid.com
2. **Générer API Key** : Settings → API Keys
3. **Configurer Render** :

```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@gj-camp.fr
```

---

## 🧪 Vérifier la configuration actuelle

### Local
```bash
cd backend
cat .env | grep EMAIL
```

### Production (Render)
1. Dashboard Render → `gj-camp-backend`
2. Environment → Voir les variables EMAIL_*

---

## ⚠️ Important

- **NE JAMAIS** commit les mots de passe dans Git
- **TOUJOURS** utiliser des variables d'environnement
- **TESTER** avec une vraie adresse email avant production
- **VÉRIFIER** que les emails n'arrivent pas dans SPAM

---

## 📝 Checklist

- [ ] Mot de passe d'application Gmail créé
- [ ] Variables EMAIL_* configurées sur Render
- [ ] Backend redémarré
- [ ] Test inscription effectué
- [ ] Email reçu dans la boîte mail
- [ ] Email pas dans SPAM
- [ ] UptimeRobot configuré (bonus)

---

**Temps estimé**: 10-15 minutes
**Priorité**: 🔴 HAUTE (sans ça, pas d'emails de confirmation)
