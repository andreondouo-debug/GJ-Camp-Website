# Guide d'activation de la virtualisation dans le BIOS

## Etape 1 : Acceder au BIOS

### Touche BIOS selon les marques :

**HP** : F10, Esc ou F2
**Dell** : F2 ou F12
**Lenovo** : F1, F2 ou bouton Novo
**Asus** : F2 ou Del
**Acer** : F2 ou Del
**MSI** : Del ou F2
**Gigabyte** : Del
**Toshiba** : F2 ou F12

### Comment acceder :

1. ETEINDRE completement votre PC (pas veille)
2. ALLUMER le PC
3. APPUYER RAPIDEMENT ET REPETITIVEMENT sur la touche BIOS
   - Commencer a appuyer des que vous voyez le logo
   - Appuyer plusieurs fois par seconde
4. Le menu BIOS devrait apparaitre

## Etape 2 : Trouver l'option de virtualisation

### Intel (VT-x) :
Chercher dans les menus :
- Advanced > CPU Configuration
- Security > Virtualization
- System Configuration > Virtualization Technology
- Processor > Intel Virtualization Technology

**Nom de l'option :**
- Intel VT-x
- Intel Virtualization Technology
- Virtualization Technology
- VT-x

### AMD (AMD-V) :
Chercher dans les menus :
- Advanced > CPU Configuration
- Security > Virtualization
- Processor > SVM Mode

**Nom de l'option :**
- AMD-V
- SVM Mode
- AMD Virtualization
- Secure Virtual Machine

## Etape 3 : Activer

1. Utiliser les fleches du clavier pour naviguer
2. Trouver l'option de virtualisation
3. Appuyer sur ENTREE
4. Selectionner "Enabled" ou "On"
5. Appuyer sur ENTREE pour confirmer

## Etape 4 : Sauvegarder et quitter

1. Appuyer sur F10 (ou suivre instructions a l'ecran)
2. Confirmer "Save and Exit" : Appuyer sur ENTREE ou Y (Yes)
3. Le PC redemarrera automatiquement

## Etape 5 : Verifier apres redemarrage

Ouvrir PowerShell et taper :

```powershell
Get-ComputerInfo | Select-Object CsVirtualizationFirmwareEnabled
```

Si resultat = **True** : Virtualisation activee !

## Etape 6 : Activer Hyper-V

Executer en tant qu'Administrateur :

```powershell
cd C:\Users\Moi\GJ-Camp-Website
.\enable-virtualization.ps1
```

Le script activera automatiquement Hyper-V et proposera de redemarrer.

## Problemes courants

### Je ne trouve pas l'option
- Chercher "Virtual", "VT", "SVM"
- Regarder dans TOUS les sous-menus Advanced/Security/CPU
- Certains BIOS cachent cette option dans "Advanced Mode" (F7)

### L'option est grisee (non modifiable)
- Verifier qu'aucun autre parametre ne la bloque
- Desactiver "Secure Boot" temporairement
- Verifier que vous etes en mode "Advanced" pas "Easy Mode"

### Apres activation, Docker dit toujours "non detecte"
1. Verifier avec : Get-ComputerInfo | Select-Object CsVirtualizationFirmwareEnabled
2. Si False : Retourner dans BIOS, l'option n'a pas ete sauvegardee
3. Si True : Executer enable-virtualization.ps1 pour activer Hyper-V

## Aide visuelle

La plupart des BIOS modernes ressemblent a ceci :

```
┌─────────────────────────────────────────┐
│  BIOS Setup Utility                     │
├─────────────────────────────────────────┤
│  > Main                                 │
│  > Advanced                             │  <- ICI
│    > CPU Configuration                  │
│      Intel VT-x      [Disabled] <- ICI  │
│  > Security                             │
│  > Boot                                 │
│  > Exit                                 │
└─────────────────────────────────────────┘
```

Appuyer ENTREE sur "Disabled" et choisir "Enabled"

## Apres activation

Une fois la virtualisation activee et Windows redemarrage :

```powershell
# 1. Verifier
Get-ComputerInfo | Select-Object CsVirtualizationFirmwareEnabled

# 2. Activer Hyper-V
.\enable-virtualization.ps1

# 3. Redemarrer Windows

# 4. Lancer Docker Desktop

# 5. Tester Docker
docker --version
docker-compose up -d --build
```

---

BESOIN D'AIDE ? Dites-moi :
- Votre marque de PC
- Ce que vous voyez dans le BIOS
- Les menus disponibles
