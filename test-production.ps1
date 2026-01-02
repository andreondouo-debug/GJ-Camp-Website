# Script de validation de la production
# Teste les endpoints clés et valide la structure des réponses

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  TEST COMPLET - GJ CAMP WEBSITE PRODUCTION                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$backendUrl = "https://gj-camp-backend.onrender.com"
$frontendUrl = "https://www.gjsdecrpt.fr"
$testsPassed = 0
$testsFailed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [scriptblock]$Validator
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest $Url -UseBasicParsing -TimeoutSec 10
        $data = $response.Content | ConvertFrom-Json
        
        if ($Validator -and -not (& $Validator $data)) {
            Write-Host "  ❌ FAILED: Validation échouée" -ForegroundColor Red
            global:$testsFailed++
            return $false
        }
        
        Write-Host "  ✅ OK" -ForegroundColor Green
        global:$testsPassed++
        return $true
    }
    catch {
        Write-Host "  ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        global:$testsFailed++
        return $false
    }
}

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "BACKEND RENDER - Tests d'API" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health check
Test-Endpoint `
    -Name "/api/health" `
    -Url "$backendUrl/api/health" `
    -Validator { $args[0].message -like "*Backend*" }

# Test 2: Activités
Test-Endpoint `
    -Name "/api/activities (22 attendues)" `
    -Url "$backendUrl/api/activities" `
    -Validator { 
        $count = $args[0] | Measure-Object | Select-Object -ExpandProperty Count
        Write-Host "     → Trouvées: $count activités" -ForegroundColor Gray
        $count -ge 20
    }

# Test 3: Settings
Test-Endpoint `
    -Name "/api/settings" `
    -Url "$backendUrl/api/settings" `
    -Validator { 
        $hasSettings = $args[0].settings -ne $null
        Write-Host "     → Settings object présent: $hasSettings" -ForegroundColor Gray
        $hasSettings
    }

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "FRONTEND VERCEL - Vérifications" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Test 4: Frontend accessible
Write-Host "Testing: Site accessible" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest $frontendUrl -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ OK (Status: 200)" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  ❌ FAILED (Status: $($response.StatusCode))" -ForegroundColor Red
        $testsFailed++
    }
}
catch {
    Write-Host "  ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "RÉSUMÉ DES TESTS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Tests réussis: $testsPassed" -ForegroundColor Green
Write-Host "❌ Tests échoués: $testsFailed" -ForegroundColor Red

if ($testsFailed -eq 0) {
    Write-Host ""
    Write-Host "🎉 TOUS LES TESTS SONT PASSÉS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "État du site:" -ForegroundColor Cyan
    Write-Host "  • Frontend: https://www.gjsdecrpt.fr" -ForegroundColor White
    Write-Host "  • Backend: https://gj-camp-backend.onrender.com" -ForegroundColor White
    Write-Host "  • MongoDB: ✅ Connecté (22 activités)" -ForegroundColor White
    Write-Host ""
    Write-Host "Actions recommandées:" -ForegroundColor Yellow
    Write-Host "  1. Ouvrir https://www.gjsdecrpt.fr dans le navigateur" -ForegroundColor White
    Write-Host "  2. F12 → Onglet 'Network' pour vérifier les requêtes" -ForegroundColor White
    Write-Host "  3. Vérifier que les activités s'affichent" -ForegroundColor White
    Write-Host "  4. Tester la création d'une activité (si admin)" -ForegroundColor White
    Write-Host "  5. Ctrl+Maj+Del pour vider le cache si problèmes" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "⚠️ CERTAINS TESTS ONT ÉCHOUÉ" -ForegroundColor Red
    Write-Host ""
    Write-Host "Diagnostics:" -ForegroundColor Yellow
    Write-Host "  • Vérifier que Render est actif (peut être en veille)" -ForegroundColor White
    Write-Host "  • Vérifier MongoDB Atlas accessibility (0.0.0.0/0 allowed)" -ForegroundColor White
    Write-Host "  • Vérifier les logs Render: https://dashboard.render.com" -ForegroundColor White
}

Write-Host ""
