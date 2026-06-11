param(
  [string]$VpsHost = "109.235.117.49",
  [string]$User = "root",
  [string]$AppDir = "/var/www/termiz",
  [string]$SshKey = $env:DEPLOY_SSH_KEY
)

function Get-SshArgs() {
  if ($SshKey -and (Test-Path $SshKey)) {
    return @("-i", $SshKey, "-o", "StrictHostKeyChecking=accept-new")
  }
  return @("-o", "StrictHostKeyChecking=accept-new")
}

$sshArgs = Get-SshArgs
$scpArgs = @()
if ($SshKey -and (Test-Path $SshKey)) {
  $scpArgs = @("-i", $SshKey)
}

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host "→ Сборка на локальной машине..." -ForegroundColor Cyan
npm ci
npx prisma generate
npm run build

Write-Host "→ Упаковка..." -ForegroundColor Cyan
$Release = Join-Path $env:TEMP "termiz-release"
if (Test-Path $Release) { Remove-Item $Release -Recurse -Force }
New-Item -ItemType Directory -Path $Release | Out-Null

Copy-Item -Recurse .next, public, package.json, package-lock.json, prisma, next.config.ts, deploy $Release
Set-Location $Release
npm ci --omit=dev
npx prisma generate
Set-Location $Root

$Archive = Join-Path $env:TEMP "termiz-release.tar.gz"
if (Test-Path $Archive) { Remove-Item $Archive -Force }

# tar из Git for Windows или WSL
$tar = Get-Command tar -ErrorAction SilentlyContinue
if (-not $tar) {
  Write-Error "Нужен tar (Git for Windows). Установите Git или используйте GitHub Actions."
}
tar -czf $Archive -C $Release .

Write-Host "→ Подготовка каталога на сервере..." -ForegroundColor Cyan
ssh @sshArgs "${User}@${VpsHost}" "mkdir -p ${AppDir}/data"

Write-Host "→ Загрузка на $User@${VpsHost}..." -ForegroundColor Cyan
scp @scpArgs $Archive "${User}@${VpsHost}:${AppDir}/termiz-release.tar.gz"

Write-Host "→ Распаковка и перезапуск..." -ForegroundColor Cyan
ssh @sshArgs "${User}@${VpsHost}" @"
set -e
cd $AppDir
tar -xzf termiz-release.tar.gz
rm -f termiz-release.tar.gz
bash deploy/post-deploy.sh
"@

Write-Host "✓ Готово: http://${VpsHost}" -ForegroundColor Green
