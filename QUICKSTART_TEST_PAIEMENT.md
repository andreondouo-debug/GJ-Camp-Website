# 🚀 Quick Start - Test Paiement Carte

## Démarrage Rapide

```bash
# Option 1: Script automatique
./test-paiement-carte.sh

# Option 2: Manuel
# Terminal 1
cd backend && npm run dev

# Terminal 2  
cd frontend && npm start
```

## 💳 Cartes de Test (Copier-Coller)

**Visa** (recommandé):
```
Numéro: 4032039847809776
CVV: 123
Expiration: 12/2028
```

**Mastercard**:
```
Numéro: 5425233430109903
CVV: 123
Expiration: 12/2028
```

**American Express**:
```
Numéro: 378282246310005
CVV: 1234
Expiration: 12/2028
```

## 📱 Procédure

1. **Ouvrir** http://localhost:3000
2. **Se connecter** avec un compte utilisateur
3. **Aller** sur "Inscription au Camp"
4. **Remplir** le formulaire d'inscription
5. **Cliquer** sur le bouton PayPal bleu
6. **Choisir** "Payer par carte de crédit ou débit"
7. **Copier** une carte de test ci-dessus
8. **Valider** le paiement

## ✅ Résultat Attendu

- ✅ Message de succès
- ✅ Redirection automatique
- ✅ Inscription dans "Mes Inscriptions"
- ✅ Transaction dans les logs backend

## 🔍 Debug

Si problème:
```bash
# Vérifier que MongoDB est démarré
brew services start mongodb-community

# Vérifier les logs backend
# Regarder le terminal où tourne `npm run dev`

# Vider le cache navigateur
# Cmd+Shift+R (Mac) ou Ctrl+Shift+R (Windows)
```

## 📚 Documentation Complète

- **Guide détaillé**: [TEST_PAIEMENT_CARTE.md](TEST_PAIEMENT_CARTE.md)
- **Guide visuel**: Ouvrir `test-paiement-carte.html` dans un navigateur
- **PayPal Developer**: https://developer.paypal.com/dashboard

## ⚠️ Important

🔴 Mode: **SANDBOX** (test uniquement)  
🔴 Cartes réelles: **NE PAS UTILISER**  
🔴 Production: **Utiliser le script configure-paypal-production.sh**
