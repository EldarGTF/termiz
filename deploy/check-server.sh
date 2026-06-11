#!/usr/bin/env bash
# Диагностика на VPS: bash deploy/check-server.sh
set -euo pipefail

cd /var/www/termiz

echo "=== docker ps ==="
docker compose -f docker-compose.prod.yml ps

echo ""
echo "=== curl app :3000 ==="
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:3000 || echo "нет ответа"

echo ""
echo "=== app logs (last 40 lines) ==="
docker compose -f docker-compose.prod.yml logs app --tail 40

echo ""
echo "=== postgres logs (last 15 lines) ==="
docker compose -f docker-compose.prod.yml logs postgres --tail 15

echo ""
echo "=== .env exists? ==="
test -f .env && echo "yes" || echo "NO — создайте /var/www/termiz/.env"
