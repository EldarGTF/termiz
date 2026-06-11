# Однократная настройка SSH-ключа для деплоя (пароль спросит SSH, не храните его в файлах)
param(
  [string]$VpsHost = "109.235.117.49",
  [string]$User = "root"
)

$ErrorActionPreference = "Stop"
$keyPath = "$env:USERPROFILE\.ssh\id_ed25519_termiz"
$keyPub = "$keyPath.pub"

if (-not (Test-Path $keyPath)) {
  Write-Host "→ Создаём SSH-ключ..." -ForegroundColor Cyan
  ssh-keygen -t ed25519 -f $keyPath -N '""' -C "termiz-deploy"
}

Write-Host ""
Write-Host "→ Скопируйте ключ на сервер (введите пароль root ОДИН раз):" -ForegroundColor Yellow
Write-Host "  ssh -i $keyPath ${User}@${VpsHost} `"mkdir -p ~/.ssh && chmod 700 ~/.ssh`"" -ForegroundColor Gray

$pub = Get-Content $keyPub -Raw
$pub = $pub.Trim()
ssh -i $keyPath -o StrictHostKeyChecking=accept-new "${User}@${VpsHost}" "echo '$pub' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"

Write-Host "✓ Ключ установлен. Проверка:" -ForegroundColor Green
ssh -i $keyPath -o BatchMode=yes "${User}@${VpsHost}" "echo SSH OK && uname -a"

Write-Host ""
Write-Host "Добавьте в deploy или используйте:" -ForegroundColor Cyan
Write-Host "  `$env:DEPLOY_SSH_KEY = `"$keyPath`"" -ForegroundColor Gray
Write-Host "  .\scripts\deploy-vps.ps1 -SshKey `"$keyPath`"" -ForegroundColor Gray
