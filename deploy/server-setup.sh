#!/usr/bin/env bash
# Однократная настройка VPS (Ubuntu 24.04)
# Запуск: bash server-setup.sh

set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Запустите от root: sudo bash server-setup.sh"
  exit 1
fi

echo "→ Обновление системы"
apt update && apt upgrade -y

echo "→ Swap 2 GB"
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "→ Пакеты"
apt install -y git curl nginx ufw

echo "→ Node.js 20"
if ! command -v node >/dev/null || [[ $(node -v | cut -d. -f1 | tr -d v) -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi

echo "→ pm2"
npm install -g pm2
pm2 startup systemd -u root --hp /root || true

echo "→ Firewall"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "→ Каталог приложения"
mkdir -p /var/www/termiz/data

echo "→ Nginx"
if [[ -f /var/www/termiz/deploy/nginx-termiz.conf ]]; then
  cp /var/www/termiz/deploy/nginx-termiz.conf /etc/nginx/sites-available/termiz
else
  cat >/etc/nginx/sites-available/termiz <<'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name _;
    client_max_body_size 10M;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX
fi
ln -sf /etc/nginx/sites-available/termiz /etc/nginx/sites-enabled/termiz
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo ""
echo "Готово. Дальше:"
echo "  1. mkdir -p /var/www/termiz && создайте /var/www/termiz/.env (см. deploy/env.example)"
echo "  2. Залейте проект: .\\scripts\\deploy-vps.ps1 (Windows) или git push (GitHub Actions)"
echo "  3. Первый раз: RUN_SEED=1 bash /var/www/termiz/deploy/post-deploy.sh"
