# Script de diagnostico para identificar el problema
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  DIAGNOSTICO DEL PROBLEMA DE NODEMAILER" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar directorio
Write-Host "1. Verificando directorio actual..." -ForegroundColor Yellow
$currentPath = Get-Location
Write-Host "   Directorio: $currentPath" -ForegroundColor White
if (-not (Test-Path "server\package.json")) {
    Write-Host "   ERROR: No se encuentra server/package.json" -ForegroundColor Red
    exit 1
}
Write-Host "   OK" -ForegroundColor Green
Write-Host ""

# 2. Verificar estado de Git
Write-Host "2. Verificando estado de Git..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "   ADVERTENCIA: Hay cambios sin commitear:" -ForegroundColor Yellow
    Write-Host $gitStatus -ForegroundColor White
} else {
    Write-Host "   OK: Repositorio limpio" -ForegroundColor Green
}
Write-Host ""

# 3. Verificar rama actual
Write-Host "3. Verificando rama de Git..." -ForegroundColor Yellow
$branch = git branch --show-current
Write-Host "   Rama actual: $branch" -ForegroundColor White
if ($branch -ne "claude/add-chat-feature-IHW0M") {
    Write-Host "   ERROR: Estas en la rama incorrecta" -ForegroundColor Red
    Write-Host "   Ejecuta: git checkout claude/add-chat-feature-IHW0M" -ForegroundColor Yellow
    exit 1
}
Write-Host "   OK" -ForegroundColor Green
Write-Host ""

# 4. Verificar ultimo commit
Write-Host "4. Verificando ultimo commit..." -ForegroundColor Yellow
$lastCommit = git log -1 --oneline
Write-Host "   Ultimo commit: $lastCommit" -ForegroundColor White
Write-Host ""

# 5. Verificar si crypto esta en package.json
Write-Host "5. Verificando package.json del servidor..." -ForegroundColor Yellow
$packageJsonContent = Get-Content "server\package.json" -Raw
if ($packageJsonContent -match '"crypto"') {
    Write-Host "   ERROR: 'crypto' todavia esta en package.json" -ForegroundColor Red
    Write-Host "   El codigo NO se ha actualizado correctamente" -ForegroundColor Red
} else {
    Write-Host "   OK: 'crypto' no esta en package.json" -ForegroundColor Green
}
Write-Host ""

# 6. Verificar si nodemailer esta instalado
Write-Host "6. Verificando instalacion de nodemailer..." -ForegroundColor Yellow
if (Test-Path "server\node_modules\nodemailer") {
    Write-Host "   OK: nodemailer esta instalado" -ForegroundColor Green

    # Verificar version
    $nodemailerPackage = Get-Content "server\node_modules\nodemailer\package.json" | ConvertFrom-Json
    Write-Host "   Version: $($nodemailerPackage.version)" -ForegroundColor White
} else {
    Write-Host "   ERROR: nodemailer NO esta instalado" -ForegroundColor Red
    Write-Host "   Ejecuta: cd server && npm install" -ForegroundColor Yellow
}
Write-Host ""

# 7. Verificar si crypto (corrupto) esta instalado
Write-Host "7. Verificando si 'crypto' corrupto esta instalado..." -ForegroundColor Yellow
if (Test-Path "server\node_modules\crypto") {
    Write-Host "   ERROR: El paquete 'crypto' corrupto SI esta instalado" -ForegroundColor Red
    Write-Host "   ESTE ES EL PROBLEMA!" -ForegroundColor Red
    Write-Host "   Solucion: Eliminar node_modules y reinstalar" -ForegroundColor Yellow
} else {
    Write-Host "   OK: 'crypto' no esta instalado" -ForegroundColor Green
}
Write-Host ""

# 8. Verificar si hay package-lock.json antiguo
Write-Host "8. Verificando package-lock.json..." -ForegroundColor Yellow
if (Test-Path "server\package-lock.json") {
    Write-Host "   Existe package-lock.json" -ForegroundColor White
    $packageLockContent = Get-Content "server\package-lock.json" -Raw
    if ($packageLockContent -match '"crypto"') {
        Write-Host "   ERROR: package-lock.json contiene 'crypto'" -ForegroundColor Red
        Write-Host "   Solucion: Eliminar package-lock.json y reinstalar" -ForegroundColor Yellow
    } else {
        Write-Host "   OK: package-lock.json esta limpio" -ForegroundColor Green
    }
} else {
    Write-Host "   No existe package-lock.json" -ForegroundColor White
}
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  FIN DEL DIAGNOSTICO" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
