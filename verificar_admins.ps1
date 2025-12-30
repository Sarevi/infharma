# Script para verificar usuarios administradores automaticamente
# Ejecuta este script en PowerShell

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  VERIFICACION DE USUARIOS ADMINISTRADORES" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Este script verificara las cuentas de administrador:" -ForegroundColor Yellow
Write-Host "  - admin@infharma.com" -ForegroundColor White
Write-Host "  - maria.garcia@hospital.com" -ForegroundColor White
Write-Host ""

Write-Host "Presiona ENTER para continuar..."
Read-Host

Write-Host ""
Write-Host "Ejecutando script SQL..." -ForegroundColor Cyan

# Ejecutar el script SQL
psql -U postgres -d infharma_db -f verificar_admins.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "  VERIFICACION COMPLETADA EXITOSAMENTE" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ahora puedes hacer login con:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Usuario 1:" -ForegroundColor Cyan
    Write-Host "  Email: admin@infharma.com" -ForegroundColor White
    Write-Host "  Password: admin123" -ForegroundColor White
    Write-Host ""
    Write-Host "Usuario 2:" -ForegroundColor Cyan
    Write-Host "  Email: maria.garcia@hospital.com" -ForegroundColor White
    Write-Host "  Password: maria123" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERROR: No se pudo verificar los usuarios" -ForegroundColor Red
    Write-Host "Verifica que PostgreSQL este corriendo y que la base de datos exista" -ForegroundColor Yellow
    Write-Host ""
}
