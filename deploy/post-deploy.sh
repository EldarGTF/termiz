#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/termiz"
cd "$APP_DIR"

mkdir -p data

echo "→ npm ci (production)"
npm ci --omit=dev

echo "→ prisma generate"
npx prisma generate

echo "→ prisma db push"
npx prisma db push

if [[ "${RUN_SEED:-0}" == "1" ]]; then
  echo "→ seed database"
  npx --yes tsx prisma/seed.ts
fi

chmod +x deploy/start.sh

echo "→ pm2"
if pm2 describe termiz >/dev/null 2>&1; then
  pm2 reload deploy/ecosystem.config.cjs --update-env
else
  pm2 start deploy/ecosystem.config.cjs
  pm2 save
fi

echo "✓ Deploy finished"
