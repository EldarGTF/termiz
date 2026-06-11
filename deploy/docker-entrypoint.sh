#!/bin/sh
set -e

cd /app

echo "→ wait for database"
TRIES=0
until npx prisma db push; do
  TRIES=$((TRIES + 1))
  if [ "$TRIES" -ge 15 ]; then
    echo "prisma db push failed after ${TRIES} attempts"
    exit 1
  fi
  echo "database not ready, retry ${TRIES}/15..."
  sleep 3
done

if [ "${RUN_SEED:-0}" = "1" ]; then
  echo "→ seed database"
  set +e
  npx --yes tsx prisma/seed.ts
  SEED_EXIT=$?
  set -e
  if [ "$SEED_EXIT" -ne 0 ]; then
    echo "seed finished with code $SEED_EXIT (continuing startup)"
  fi
fi

echo "→ start app on :${PORT:-3000}"
if [ "$#" -eq 0 ]; then
  set -- node server.js
fi
exec "$@"
