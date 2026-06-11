#!/usr/bin/env bash
set -euo pipefail
cd /var/www/termiz

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

exec npm start
