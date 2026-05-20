#!/usr/bin/env bash
# Nightly database backup (TECH_SPEC §16.4). Intended for self-managed
# deployments — managed hosts like Wevrlabs run their own backups.
#
# Schedule via host cron, for example:
#   0 3 * * * /opt/matmoora-cms/scripts/backup-db.sh
#
# Required env:
#   BACKUP_DIR          Local directory for the daily dump
#   BACKUP_RETENTION    Days to keep (default 30)
#   B2_BUCKET           Backblaze B2 bucket (or set up restic + an S3 target)
#
# Assumes the project's docker-compose stack is running on the same host.
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION="${BACKUP_RETENTION:-30}"
TS="$(date +%Y%m%d-%H%M%S)"
DUMP="${BACKUP_DIR}/wordpress-${TS}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "==> Dumping database to ${DUMP}"
docker compose exec -T db sh -c \
  'exec mysqldump --single-transaction --quick --routines --triggers \
                  -uroot -p"$(cat /run/secrets/db_root_password)" wordpress' \
  | gzip -c > "$DUMP"

echo "==> Pruning local backups older than ${RETENTION} days"
find "$BACKUP_DIR" -name 'wordpress-*.sql.gz' -mtime "+${RETENTION}" -delete

if [[ -n "${B2_BUCKET:-}" ]]; then
  echo "==> Uploading to off-site (${B2_BUCKET})"
  # Hook in restic or rclone here. Leaving as a stub so the off-site target
  # remains a deployment-time choice (TECH_SPEC §21 Q7).
fi

echo "==> Done."
