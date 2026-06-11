#!/usr/bin/env bash
# Однократная настройка VPS под Docker-деплой (Ubuntu 24.04)
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Запустите от root: sudo bash server-setup-docker.sh"
  exit 1
fi

echo "→ Обновление"
apt update && apt upgrade -y

echo "→ Swap 2 GB"
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "→ Docker"
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable docker --now

echo "→ Nginx + firewall"
apt install -y nginx ufw
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

mkdir -p /var/www/termiz

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
    location ~ ^/api/orders/.+/stream$ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_buffering off;
        proxy_read_timeout 3600s;
    }
}
NGINX
fi

ln -sf /etc/nginx/sites-available/termiz /etc/nginx/sites-enabled/termiz
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo ""
echo "Готово."
echo "  1. Создайте /var/www/termiz/.env (deploy/env.docker.example)"
echo "  2. Деплой: npm run deploy:docker (Windows) или git push"
