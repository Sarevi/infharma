# Script para actualizar InFHarma con la corrección de nodemailer
# Ejecuta este script en PowerShell

Write-Host "🔄 Actualizando InFHarma..." -ForegroundColor Cyan
Write-Host ""

# 1. Detener procesos (el usuario debe hacer Ctrl+C en las terminales)
Write-Host "⚠️  IMPORTANTE: Detén los servidores (Ctrl+C en ambas terminales)" -ForegroundColor Yellow
Write-Host "Presiona ENTER cuando hayas detenido ambos servidores..."
Read-Host

# 2. Descargar cambios de GitHub
Write-Host ""
Write-Host "📥 Descargando cambios de GitHub..." -ForegroundColor Cyan
git pull origin claude/add-chat-feature-IHW0M

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al descargar cambios" -ForegroundColor Red
    exit 1
}

# 3. Limpiar e instalar dependencias del servidor
Write-Host ""
Write-Host "🧹 Limpiando dependencias antiguas del servidor..." -ForegroundColor Cyan
Set-Location server

if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules
    Write-Host "✅ node_modules eliminado" -ForegroundColor Green
}

Write-Host ""
Write-Host "📦 Instalando dependencias del servidor..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ ¡Actualización completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Ahora ejecuta estos comandos:" -ForegroundColor Cyan
Write-Host ""
Write-Host "En la terminal 1 (Backend):" -ForegroundColor Yellow
Write-Host "  cd server" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "En la terminal 2 (Frontend):" -ForegroundColor Yellow
Write-Host "  cd client" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🎉 El sistema de verificación de email debería funcionar correctamente" -ForegroundColor Green
Write-Host ""

Set-Location ..
