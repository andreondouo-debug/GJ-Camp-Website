# 👥 Guide : Comment ajouter des responsables de jeunesse

## 📍 Accès à la page de gestion

1. **Connectez-vous** avec un compte **Admin** ou **Responsable**
2. Cliquez sur **GESTION** dans le menu
3. Sélectionnez **👥 Responsables Campus**
4. Vous arrivez sur : `https://gjsdecrpt.fr/gestion/responsables-campus`

## ➕ Ajouter un nouveau responsable

### Étape 1 : Cliquer sur "➕ Ajouter un responsable"

### Étape 2 : Remplir le formulaire

**Champs obligatoires (\*) :**

| Champ | Description | Exemple |
|-------|-------------|---------|
| **Campus*** | Sélectionner l'église | "Paris Est - Montreuil" |
| **Prénom*** | Prénom du responsable | "Jean" |
| **Nom*** | Nom du responsable | "Dupont" |
| **Email*** | Adresse email | "jean.dupont@example.com" |
| **Téléphone*** | Numéro de téléphone | "+33 6 12 34 56 78" |
| **Rôle** | Titre du responsable | "Responsable Jeunesse" ou "Leader GJ" |
| **Ordre** | Position d'affichage | 0 (premier), 1, 2... |
| **Actif** | Afficher sur le site | ✅ (coché par défaut) |
| **Photo** | Image du responsable | JPG/PNG (max 5MB) |

### Étape 3 : Ajouter une photo (optionnel)

1. Cliquez sur **"Choisir un fichier"**
2. Sélectionnez une photo du responsable
3. **Formats acceptés** : JPG, PNG
4. **Taille max** : 5 MB
5. **Conseil** : Photo portrait, visage centré, fond neutre

### Étape 4 : Cliquer sur "Créer"

✅ Le responsable apparaîtra immédiatement sur la page Génération Josué !

## ✏️ Modifier un responsable

1. Sur la carte du responsable, cliquez sur **✏️ (bouton jaune)**
2. Modifiez les informations
3. Cliquez sur **"Mettre à jour"**

## 🗑️ Supprimer un responsable

1. Sur la carte du responsable, cliquez sur **🗑️ (bouton rouge)**
2. Confirmez la suppression
3. ⚠️ La photo sera également supprimée de Cloudinary

## 📊 Organisation par campus

Les responsables sont **automatiquement groupés par église** sur la page Génération Josué.

**Exemple d'affichage :**

```
🏛️ Paris Est - Montreuil
   👤 Jean Dupont (Responsable Jeunesse)
   👤 Marie Martin (Leader GJ)

🏛️ Lyon Centre
   👤 Pierre Durand (Responsable Jeunesse)
```

## 💡 Conseils

### Pour plusieurs responsables par campus :
- Utilisez le champ **"Ordre"** pour définir qui apparaît en premier
- Ordre 0 = premier affiché
- Ordre 1 = deuxième, etc.

### Pour les photos :
- **Dimensions recommandées** : 400x400 pixels (carré)
- **Recadrage automatique** : centré sur le visage
- **Stockage** : Cloudinary (sécurisé)

### Pour désactiver temporairement :
- Décochez **"Actif"** au lieu de supprimer
- Le responsable reste en base mais invisible sur le site

## 🔐 Permissions

| Rôle | Accès |
|------|-------|
| **Admin** | ✅ Créer/Modifier/Supprimer |
| **Responsable** | ✅ Créer/Modifier/Supprimer |
| **Référent** | ❌ Pas d'accès |
| **Utilisateur** | ❌ Pas d'accès |

## 🌐 Voir le résultat

Après avoir ajouté des responsables, allez sur :
👉 **https://gjsdecrpt.fr/generation-josue**

Les responsables apparaîtront dans la section **"Groupes de Jeunesse par Église"**

## 🐛 Résolution de problèmes

**Problème** : Le responsable n'apparaît pas sur la page
- ✅ Vérifiez que **"Actif"** est coché
- ✅ Vérifiez que le campus est bien sélectionné
- ✅ Rechargez la page (Ctrl+F5)

**Problème** : La photo ne s'affiche pas
- ✅ Vérifiez la taille du fichier (< 5MB)
- ✅ Vérifiez le format (JPG ou PNG)
- ✅ Réessayez l'upload

**Problème** : Erreur lors de la création
- ✅ Tous les champs obligatoires sont remplis ?
- ✅ Le campus existe dans la liste ?
- ✅ L'email est valide ?

## 📞 Support

En cas de problème, contactez l'administrateur système.
