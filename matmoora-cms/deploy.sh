#!/usr/bin/env bash
# Deploy the Matmoora CMS on the VPS — TECH_SPEC §18.3.
# Pulls the latest config, snapshots the database, then rebuilds containers.
set -euo pipefail

cd "$(dirname "$0")"

echo "==> Pulling latest config"
git pull --ff-only

echo "==> Pre-deploy database snapshot"
mkdir -p backups
TS="$(date +%Y%m%d-%H%M%S)"
docker compose exec -T db sh -c \
  'exec mysqldump -uroot -p"$(cat /run/secrets/db_root_password)" wordpress' \
  > "backups/pre-deploy-${TS}.sql"

echo "==> Rebuilding and restarting containers"
docker compose up -d --build

echo "==> Done. Running containers:"
docker compose ps
