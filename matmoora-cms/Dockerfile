# ------------------------------------------------------------
# Matmoora WordPress — Railway/Docker image
# ------------------------------------------------------------
# One image for both the Docker Compose stack (VPS) and Railway. Railway
# doesn't support docker-compose; each service deploys independently from
# its own Dockerfile. Pair this with Railway's MariaDB plugin and the
# Meilisearch service in ./meilisearch/.
#
# IMPORTANT: the official wordpress:apache base declares /var/www/html as
# a VOLUME. Writes there at build time are discarded on container start;
# the base entrypoint copies files from /usr/src/wordpress/ instead. All
# plugins / mu-plugins / themes / ACF JSON therefore live under
# /usr/src/wordpress/ so they survive first boot.

FROM wordpress:6.5-php8.2-apache

# ------------------------------------------------------------
# System tools we need at runtime (wp-cli, composer, mariadb client).
# Also force Apache to mpm_prefork — Debian re-enables mpm_event behind
# our back and PHP's mod_php rejects a mixed MPM config at startup.
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

# Composer, used to install the public WP plugins.
RUN curl -fsSL https://getcomposer.org/installer | php -- \
        --install-dir=/usr/local/bin --filename=composer

# ------------------------------------------------------------
# Install the public plugins into the WordPress SOURCE directory, not
# into /var/www/html (which the base image's VOLUME wipes on start).
# ACF Pro and WPML are paid and must be dropped in via the WP admin;
# see RAILWAY_DEPLOY.md.
# ------------------------------------------------------------
WORKDIR /tmp/matmoora-plugins
COPY composer.json ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-autoloader \
    && mkdir -p /usr/src/wordpress/wp-content/plugins \
    && mv wp-content/plugins/* /usr/src/wordpress/wp-content/plugins/ \
    && cd / && rm -rf /tmp/matmoora-plugins

# ------------------------------------------------------------
# Ship the mu-plugins + acf-json + stub theme to the SOURCE dir so
# first-boot extraction carries them into /var/www/html. The ACF JSON
# directory sits one level above wp-content so the mu-plugin's
# WP_CONTENT_DIR/../acf-json resolves correctly.
# ------------------------------------------------------------
COPY wp-content/mu-plugins /usr/src/wordpress/wp-content/mu-plugins
COPY wp-content/themes/matmoora-stub /usr/src/wordpress/wp-content/themes/matmoora-stub
COPY acf-json /usr/src/wordpress/acf-json

# Entrypoint.
WORKDIR /var/www/html
COPY scripts/railway-entrypoint.sh /usr/local/bin/railway-entrypoint.sh
RUN chmod +x /usr/local/bin/railway-entrypoint.sh

ENV PORT=80
EXPOSE 80

ENTRYPOINT ["/usr/local/bin/railway-entrypoint.sh"]
CMD ["apache2-foreground"]
