# Script Configuration Automatique Vercel
# Execute ce script pour configurer automatiquement les variables d'environnement

Write-Host "Configuration Production Vercel + Render" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Verifier si backend Render est actif
Write-Host "1. Verification Backend Render..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://gj-camp-backend.onrender.com/api/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "   OK Backend Render ACTIF" -ForegroundColor Green
    }
} catch {
    Write-Host "   ERREUR Backend Render INACTIF (peut etre en veille)" -ForegroundColor Red
    Write-Host "   Attente 30 secondes pour reveil..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
}

# Verifier MongoDB via backend
Write-Host ""
Write-Host "2. Verification MongoDB..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://gj-camp-backend.onrender.com/api/activities" -UseBasicParsing
    $activities = ($response.Content | ConvertFrom-Json)
    $count = $activities.Count
    Write-Host "   OK MongoDB CONNECTE ($count activites)" -ForegroundColor Green
} catch {
    Write-Host "   ERREUR MongoDB non accessible" -ForegroundColor Red
}

# Verifier configuration locale
Write-Host ""
Write-Host "3. Verification Fichiers Configuration..." -ForegroundColor Yellow

$envFiles = @(
    "frontend\.env",
    "frontend\.env.production",
    "frontend\.env.development"
)

foreach ($file in $envFiles) {
    $fullPath = "c:\Users\Moi\GJ-Camp-Website\$file"
    if (Test-Path $fullPath) {
        Write-Host "   OK $file existe" -ForegroundColor Green
        
        # Verifier contenu
        $content = Get-Content $fullPath -Raw
        if ($file -eq "frontend\.env" -or $file -eq "frontend\.env.production") {
            if ($content -like "*gj-camp-backend.onrender.com*") {
                Write-Host "      -> Pointe vers PRODUCTION OK" -ForegroundColor Green
            } else {
                Write-Host "      -> ATTENTION Ne pointe PAS vers production!" -ForegroundColor Red
            }
        }
        if ($file -eq "frontend\.env.development") {
            if ($content -like "*localhost:5000*") {
                Write-Host "      -> Pointe vers LOCAL OK" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "   ERREUR $file manquant" -ForegroundColor Red
    }
}

# Instructions Vercel
Write-Host ""
Write-Host "4. Configuration Vercel (MANUEL)" -ForegroundColor Yellow
Write-Host ""
Write-Host "   ETAPES A SUIVRE:" -ForegroundColor Cyan
Write-Host "   1. Ouvrir: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "   2. Selectionner votre projet GJ-Camp" -ForegroundColor White
Write-Host "   3. Aller dans: Settings -> Environment Variables" -ForegroundColor White
Write-Host ""
Write-Host "   4. AJOUTER/MODIFIER ces variables:" -ForegroundColor White
Write-Host "      Variable: REACT_APP_API_URL" -ForegroundColor Gray
Write-Host "      Value:    https://gj-camp-backend.onrender.com" -ForegroundColor Gray
Write-Host "      Env:      Production only" -ForegroundColor Gray
Write-Host "" -ForegroundColor Gray
Write-Host "      Variable: REACT_APP_PAYPAL_CLIENT_ID" -ForegroundColor Gray
Write-Host "      Value:    AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-cpwsC1a4u9RfSrQC9pqFX-FOFqWTb" -ForegroundColor Gray
Write-Host "      Env:      Production only" -ForegroundColor Gray
Write-Host ""
Write-Host "   5. Cliquer 'Save' pour chaque variable" -ForegroundColor White
Write-Host ""

# Proposer git push
Write-Host "5. Deploiement" -ForegroundColor Yellow
Write-Host ""
$deploy = Read-Host "   Voulez-vous deployer maintenant? (o/n)"

if ($deploy -eq "o" -or $deploy -eq "O") {
    Write-Host ""
    Write-Host "   Commit + Push vers GitHub..." -ForegroundColor Cyan
    
    Set-Location "c:\Users\Moi\GJ-Camp-Website"
    
    git add frontend/.env frontend/.env.production frontend/.env.development
    git commit -m "Config: Separer environnements local/production"
    git push origin main
    
    Write-Host "   OK Deploye! Vercel va builder automatiquement..." -ForegroundColor Green
    Write-Host ""
    Write-Host "   Suivre le deploiement:" -ForegroundColor Cyan
    Write-Host "      https://vercel.com/dashboard" -ForegroundColor White
    Write-Host ""
    Write-Host "   Build prend environ 2-3 minutes" -ForegroundColor Yellow
    Write-Host ""
    
} else {
    Write-Host "   Deploiement annule" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Pour deployer plus tard:" -ForegroundColor Cyan
    Write-Host "   cd c:\Users\Moi\GJ-Camp-Website" -ForegroundColor White
    Write-Host "   git add ." -ForegroundColor White
    Write-Host "   git commit -m 'Config production'" -ForegroundColor White
    Write-Host "   git push origin main" -ForegroundColor White
}

# Resume final
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "RESUME" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend Render:  OK https://gj-camp-backend.onrender.com" -ForegroundColor Green
Write-Host "Frontend Vercel: A configurer (voir etapes ci-dessus)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Une fois configure:" -ForegroundColor Cyan
Write-Host "  -> Site production: https://gjsdecrpt.fr" -ForegroundColor White
Write-Host "  -> Pas besoin de npm start!" -ForegroundColor White
Write-Host "  -> Tout fonctionne dans le cloud" -ForegroundColor White
Write-Host ""
Write-Host "Pour developpement local:" -ForegroundColor Cyan
Write-Host "  -> cd backend && npm run dev" -ForegroundColor White
Write-Host "  -> cd frontend && npm start" -ForegroundColor White
Write-Host "  -> http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Documentation complete:" -ForegroundColor Cyan
Write-Host "   CONFIGURATION_PRODUCTION.md" -ForegroundColor White
Write-Host ""
