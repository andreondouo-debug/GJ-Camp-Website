# Script pour activer la virtualisation pour Docker Desktop
# DOIT ETRE EXECUTE EN TANT QU'ADMINISTRATEUR

Write-Host "Activation de la virtualisation pour Docker Desktop..." -ForegroundColor Cyan
Write-Host ""

# Verifier si le script est execute en tant qu'administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERREUR : Ce script doit etre execute en tant qu'Administrateur" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pour relancer en tant qu'admin :" -ForegroundColor Yellow
    Write-Host "1. Clic droit sur PowerShell" -ForegroundColor Yellow
    Write-Host "2. Executer en tant qu'administrateur" -ForegroundColor Yellow
    Write-Host "3. cd C:\Users\Moi\GJ-Camp-Website" -ForegroundColor Yellow
    Write-Host "4. .\enable-virtualization.ps1" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Appuyez sur Entree pour quitter"
    exit 1
}

Write-Host "Execution en mode Administrateur confirmee" -ForegroundColor Green
Write-Host ""

# Verifier le statut actuel
Write-Host "Verification du statut actuel..." -ForegroundColor Cyan
$computerInfo = Get-ComputerInfo
$virtEnabled = $computerInfo.CsVirtualizationFirmwareEnabled
$hyperVPresent = $computerInfo.HyperVisorPresent

Write-Host "  Virtualisation firmware : $virtEnabled"
Write-Host "  Hyper-V present : $hyperVPresent"
Write-Host ""

# Verifier si la virtualisation est activee dans le BIOS
if ($virtEnabled -eq $false) {
    Write-Host "ATTENTION : La virtualisation n'est PAS activee dans le BIOS" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "ACTIONS REQUISES :" -ForegroundColor Red
    Write-Host "1. Redemarrer votre PC" -ForegroundColor Yellow
    Write-Host "2. Appuyer sur F2, F10, Del ou Esc au demarrage" -ForegroundColor Yellow
    Write-Host "3. Chercher : Intel VT-x / AMD-V / SVM Mode" -ForegroundColor Yellow
    Write-Host "4. Activer (Enable)" -ForegroundColor Yellow
    Write-Host "5. Sauvegarder et quitter (F10)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Apres activation BIOS, relancez ce script." -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Appuyez sur Entree pour quitter"
    exit 0
}

Write-Host "Virtualisation activee dans le BIOS" -ForegroundColor Green
Write-Host ""

# Activer Hyper-V et fonctionnalites necessaires
Write-Host "Activation d'Hyper-V et des fonctionnalites Windows..." -ForegroundColor Cyan
Write-Host ""

try {
    $features = @(
        "Microsoft-Hyper-V-All",
        "VirtualMachinePlatform",
        "Microsoft-Windows-Subsystem-Linux",
        "HypervisorPlatform"
    )
    
    foreach ($feature in $features) {
        Write-Host "  Activation de $feature..." -ForegroundColor Yellow
        Enable-WindowsOptionalFeature -Online -FeatureName $feature -All -NoRestart -ErrorAction SilentlyContinue | Out-Null
        Write-Host "  $feature active" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Toutes les fonctionnalites ont ete activees !" -ForegroundColor Green
    Write-Host ""
    Write-Host "UN REDEMARRAGE EST NECESSAIRE" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Voulez-vous redemarrer maintenant ? (O/N)" -ForegroundColor Cyan
    $response = Read-Host
    
    if ($response -eq "O" -or $response -eq "o") {
        Write-Host ""
        Write-Host "Redemarrage dans 10 secondes..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        Restart-Computer -Force
    } else {
        Write-Host ""
        Write-Host "N'oubliez pas de redemarrer manuellement !" -ForegroundColor Yellow
        Write-Host ""
    }
    
} catch {
    Write-Host "Erreur : $_" -ForegroundColor Red
}

Write-Host ""
Read-Host "Appuyez sur Entree pour quitter"
