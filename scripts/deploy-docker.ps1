param(
  [string]$VpsHost = "109.235.117.49",
  [string]$User = "root",
  [string]$AppDir = "/var/www/termiz",
  [string]$SshKey = $env:DEPLOY_SSH_KEY
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

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

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Error "Нужен Docker Desktop. Или используйте GitHub Actions."
}

Write-Host "→ Next.js build..." -ForegroundColor Cyan
$env:DATABASE_URL = "postgresql://build:build@127.0.0.1:5432/build"
$env:AUTH_SECRET = "local-build-secret"
$env:NEXTAUTH_URL = "http://localhost:3000"
npm ci
npx prisma generate
npm run build

Write-Host "→ Docker build..." -ForegroundColor Cyan
docker build -t termiz:latest .

$Archive = Join-Path $env:TEMP "termiz-image.tar"
if (Test-Path $Archive) { Remove-Item $Archive -Force }
docker save termiz:latest -o $Archive

Write-Host "→ Подготовка сервера..." -ForegroundColor Cyan
ssh @sshArgs "${User}@${VpsHost}" "mkdir -p ${AppDir}"

Write-Host "→ Загрузка образа и compose..." -ForegroundColor Cyan
scp @scpArgs $Archive "${User}@${VpsHost}:${AppDir}/termiz-image.tar"
scp @scpArgs docker-compose.prod.yml "${User}@${VpsHost}:${AppDir}/"
scp @scpArgs deploy/post-deploy-docker.sh deploy/nginx-termiz.conf "${User}@${VpsHost}:${AppDir}/deploy/"

Write-Host "→ Запуск на сервере..." -ForegroundColor Cyan
ssh @sshArgs "${User}@${VpsHost}" "cd ${AppDir} && bash deploy/post-deploy-docker.sh"

Write-Host "✓ Готово: http://${VpsHost}" -ForegroundColor Green
Write-Host "  Логи: ssh ${User}@${VpsHost} 'cd ${AppDir} && docker compose -f docker-compose.prod.yml logs -f app'" -ForegroundColor Gray
