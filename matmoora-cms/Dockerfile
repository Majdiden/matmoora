# ------------------------------------------------------------
# Matmoora WordPress — Railway/Docker image
# ------------------------------------------------------------
# One image that works for both the Docker Compose stack (VPS) and Railway
# single-service deploys. Railway doesn't support docker-compose; each service
# is deployed independently from its own Dockerfile. This image is the
# WordPress service — pair it with Railway's MariaDB plugin + a Meilisearch
# service (also from this repo, see Meilisearch.Dockerfile).
#
# Build:   docker build -t matmoora-cms .
# Railway: this file is auto-detected; set the env vars in RAILWAY_DEPLOY.md.

FROM wordpress:6.5-php8.2-apache

# ------------------------------------------------------------
# System tools we need at runtime (wp-cli, composer, mariadb client).
# Kept in a single layer to keep the image lean. After apt-get, we
# force Apache back to mpm_prefork — Debian re-enables mpm_event
# whenever apache2 is touched and PHP's mod_php rejects a mixed
# MPM config at startup ("More than one MPM loaded").
# ------------------------------------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates curl less default-mysql-client git unzip \
    && rm -rf /var/lib/apt/lists/* \
    && a2dismod -f mpm_event mpm_worker 2>/dev/null || true \
    && a2enmod mpm_prefork \
    && a2enmod rewrite headers

# wp-cli for provisioning + reindex commands.
RUN curl -fsSL https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar -o /usr/local/bin/wp \
    && chmod +x /usr/local/bin/wp

# ------------------------------------------------------------
# Composer-managed plugins. These come from public sources only; the paid
# ACF Pro and WPML plugins must be dropped into wp-content/plugins/ at
# deploy time via a Railway "Volume" (see RAILWAY_DEPLOY.md).
# ------------------------------------------------------------
RUN curl -fsSL https://getcomposer.org/installer | php -- \
        --install-dir=/usr/local/bin --filename=composer

WORKDIR /tmp/plugins
COPY composer.json ./
RUN composer install --no-dev --prefer-dist --no-interaction \
    && mv vendor /var/www/html/wp-content/vendor \
    && mv wp-content/plugins/* /var/www/html/wp-content/plugins/ 2>/dev/null || true

# ------------------------------------------------------------
# Ship the mu-plugins + acf-json + theme stub + entrypoint.
# ------------------------------------------------------------
WORKDIR /var/www/html
COPY wp-content/mu-plugins /var/www/html/wp-content/mu-plugins
COPY wp-content/themes/matmoora-stub /var/www/html/wp-content/themes/matmoora-stub
COPY acf-json /var/www/acf-json
COPY scripts/railway-entrypoint.sh /usr/local/bin/railway-entrypoint.sh
RUN chmod +x /usr/local/bin/railway-entrypoint.sh

# WordPress listens on 80; Railway sets $PORT dynamically.
ENV PORT=80
EXPOSE 80

ENTRYPOINT ["/usr/local/bin/railway-entrypoint.sh"]
CMD ["apache2-foreground"]
