#!/bin/sh
set -e

cd /app

echo "→ prisma db push"
./node_modules/.bin/prisma db push

if [ "${RUN_SEED:-0}" = "1" ]; then
  echo "→ seed database"
  ./node_modules/.bin/tsx prisma/seed.ts
fi

echo "→ start app"
exec "$@"
