#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/termiz"
cd "$APP_DIR"

IMAGE_ARCHIVE=""
if [[ -f termiz-image.tar.gz ]]; then
  IMAGE_ARCHIVE="termiz-image.tar.gz"
elif [[ -f termiz-image.tar ]]; then
  IMAGE_ARCHIVE="termiz-image.tar"
else
  echo "termiz-image.tar(.gz) not found"
  exit 1
fi

echo "→ docker load ($IMAGE_ARCHIVE)"
docker load -i "$IMAGE_ARCHIVE"
rm -f termiz-image.tar termiz-image.tar.gz

echo "→ docker compose up"
docker compose -f docker-compose.prod.yml up -d --remove-orphans --force-recreate

echo "→ cleanup"
docker image prune -f

if command -v nginx >/dev/null && [[ -f deploy/nginx-termiz.conf ]]; then
  echo "→ nginx"
  cp deploy/nginx-termiz.conf /etc/nginx/sites-available/termiz
  ln -sf /etc/nginx/sites-available/termiz /etc/nginx/sites-enabled/termiz
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl reload nginx
fi

echo "✓ Docker deploy finished"
docker compose -f docker-compose.prod.yml ps
