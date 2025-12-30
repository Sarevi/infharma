# Script completo para solucionar el problema de nodemailer
# Ejecuta este script en PowerShell como administrador

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  SOLUCION COMPLETA - INFHARMA EMAIL VERIFICATION" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Verificar que estamos en el directorio correcto
Write-Host "Paso 1: Verificando directorio..." -ForegroundColor Yellow
if (-not (Test-Path "server")) {
    Write-Host "ERROR: No estas en el directorio correcto" -ForegroundColor Red
    Write-Host "Ejecuta: cd C:\Users\samue\Desktop\infharma-chat" -ForegroundColor Yellow
    exit 1
}
Write-Host "OK: Directorio correcto" -ForegroundColor Green
Write-Host ""

# Paso 2: Descargar cambios de GitHub
Write-Host "Paso 2: Descargando cambios de GitHub..." -ForegroundColor Yellow
git pull origin claude/add-chat-feature-IHW0M
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo descargar cambios" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Cambios descargados" -ForegroundColor Green
Write-Host ""

# Paso 3: Limpiar e instalar dependencias del servidor
Write-Host "Paso 3: Limpiando node_modules del servidor..." -ForegroundColor Yellow
Set-Location server

if (Test-Path "node_modules") {
    Write-Host "Eliminando carpeta node_modules..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force node_modules
    Write-Host "OK: node_modules eliminado" -ForegroundColor Green
} else {
    Write-Host "OK: No habia node_modules" -ForegroundColor Green
}
Write-Host ""

# Paso 4: Limpiar package-lock.json
Write-Host "Paso 4: Limpiando package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item -Force package-lock.json
    Write-Host "OK: package-lock.json eliminado" -ForegroundColor Green
}
Write-Host ""

# Paso 5: Instalar dependencias limpias
Write-Host "Paso 5: Instalando dependencias (esto puede tomar 1-2 minutos)..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo instalar dependencias" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Dependencias instaladas correctamente" -ForegroundColor Green
Write-Host ""

# Paso 6: Verificar que crypto NO esta instalado
Write-Host "Paso 6: Verificando que 'crypto' no este instalado..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" | ConvertFrom-Json
if ($packageJson.dependencies.crypto) {
    Write-Host "ERROR: 'crypto' todavia esta en package.json" -ForegroundColor Red
    Write-Host "Esto no deberia pasar. Contacta soporte." -ForegroundColor Red
    exit 1
}
Write-Host "OK: 'crypto' no esta en las dependencias" -ForegroundColor Green
Write-Host ""

Set-Location ..

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "  ACTUALIZACION COMPLETADA EXITOSAMENTE!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANTE: Ahora reinicia los servidores:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Terminal 1 (Backend):" -ForegroundColor Cyan
Write-Host "  cd server" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 2 (Frontend):" -ForegroundColor Cyan
Write-Host "  cd client" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Despues de reiniciar, el sistema de emails funcionara." -ForegroundColor Green
Write-Host ""
