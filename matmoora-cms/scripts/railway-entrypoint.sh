#!/usr/bin/env bash
# ------------------------------------------------------------
# Matmoora WordPress — Railway entrypoint
# ------------------------------------------------------------
# Railway doesn't run docker-compose; the DB and Meilisearch are separate
# services with their own env vars. This script normalises the Railway
# variables into what wordpress:apache expects, drops the Matmoora ACF
# JSON path into place, waits for the DB, then hands off to the stock
# WordPress entrypoint.

set -euo pipefail

# Railway MariaDB plugin exposes MYSQL_URL (mysql://user:pass@host:port/db).
# Translate it into the discrete vars the base image reads.
if [[ -n "${MYSQL_URL:-}" ]]; then
  export WORDPRESS_DB_HOST="$(echo "$MYSQL_URL" | awk -F[/:@] '{print $6":"$7}')"
  export WORDPRESS_DB_USER="$(echo "$MYSQL_URL" | awk -F[/:@] '{print $4}')"
  export WORDPRESS_DB_PASSWORD="$(echo "$MYSQL_URL" | awk -F[/:@] '{print $5}')"
  export WORDPRESS_DB_NAME="$(echo "$MYSQL_URL" | awk -F[/:@] '{print $8}')"
fi

# Honour Railway's dynamic $PORT when set.
if [[ -n "${PORT:-}" && "${PORT}" != "80" ]]; then
  sed -i "s/80/${PORT}/g" /etc/apache2/ports.conf /etc/apache2/sites-available/*.conf
fi

# Point ACF JSON sync at the repo-mounted directory. The mu-plugin reads
# WP_CONTENT_DIR/../acf-json — matches the layout we copy in the Dockerfile.
mkdir -p /var/www/acf-json
chown -R www-data:www-data /var/www/acf-json

# Wait for the DB to accept connections (Railway may boot WP first).
if [[ -n "${WORDPRESS_DB_HOST:-}" ]]; then
  echo "[matmoora] waiting for MariaDB at ${WORDPRESS_DB_HOST}…"
  for i in {1..60}; do
    if mysql -h "${WORDPRESS_DB_HOST%:*}" -P "${WORDPRESS_DB_HOST##*:}" \
         -u "${WORDPRESS_DB_USER}" -p"${WORDPRESS_DB_PASSWORD}" \
         -e "SELECT 1" >/dev/null 2>&1; then
      echo "[matmoora] DB ready."
      break
    fi
    sleep 2
  done
fi

# Hand off to the stock WordPress entrypoint, which handles wp-config.php
# generation, salts, filesystem perms, etc.
exec docker-entrypoint.sh "$@"
