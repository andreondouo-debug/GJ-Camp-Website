# Vérification Variables Cloudinary sur Render

## ✅ Variables à Vérifier

Se connecter à [Render Dashboard](https://dashboard.render.com) et vérifier que ces variables existent :

### Backend Service: gj-camp-website-1
```env
CLOUDINARY_CLOUD_NAME=dbouijio-1
CLOUDINARY_API_KEY=761916752995798
CLOUDINARY_API_SECRET=bX-m3vu9HSWprWpm-jfY_wbvd2s
```

## 🔍 Comment Vérifier

1. Aller sur https://dashboard.render.com
2. Cliquer sur le service **gj-camp-website-1**
3. Onglet **Environment** dans le menu de gauche
4. Chercher les variables commençant par `CLOUDINARY_`

## ⚠️ Si les Variables Manquent

Ajouter manuellement :
1. Cliquer sur **Add Environment Variable**
2. Ajouter chaque variable :
   - Key: `CLOUDINARY_CLOUD_NAME` → Value: `dbouijio-1`
   - Key: `CLOUDINARY_API_KEY` → Value: `761916752995798`
   - Key: `CLOUDINARY_API_SECRET` → Value: `bX-m3vu9HSWprWpm-jfY_wbvd2s`
3. Cliquer sur **Save Changes**
4. Le backend va redémarrer automatiquement

## 📝 Informations Cloudinary

- **Cloud Name** : dbouijio-1
- **Dashboard** : https://console.cloudinary.com
- **Dossier Photos** : `gj-camp/profile-photos/`

## 🚀 Après Déploiement

1. **Attendre le redéploiement** : ~3-5 minutes
2. **Vérifier les logs Render** : 
   - Chercher : `✅ MongoDB connecté`
   - Chercher : `🚀 Serveur démarré`
3. **Tester l'upload** :
   - Aller sur https://gjsdecrpt.fr
   - Se connecter
   - Dashboard → Upload photo de profil
   - ✅ Devrait fonctionner sans erreur 500

## 🔍 Logs Attendus

Si tout fonctionne :
```
POST /api/auth/upload-photo
🚀 Upload photo de profil vers Cloudinary: photo.jpg
✅ Upload Cloudinary réussi: https://res.cloudinary.com/dbouijio-1/...
✅ Photo de profil mise à jour: https://res.cloudinary.com/...
```

Si Cloudinary non configuré :
```
❌ Cloudinary non configuré !
→ Ajouter les variables d'environnement sur Render
```

## ✅ Tests à Effectuer

- [ ] Variables Cloudinary présentes sur Render
- [ ] Backend redéployé (commit 7674864)
- [ ] Upload photo fonctionne sans erreur 500
- [ ] Photo affichée sur dashboard
- [ ] URL commence par `https://res.cloudinary.com/dbouijio-1/`
