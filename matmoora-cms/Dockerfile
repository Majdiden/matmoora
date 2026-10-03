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

FROM wordpress:6.9-php8.3-apache

# ------------------------------------------------------------
# System tools we need at runtime (wp-cli, mariadb client, unzip).
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

# ------------------------------------------------------------
# Install the public plugins directly from wordpress.org into the
# WordPress SOURCE directory. Composer's installer-paths were silently
# producing an empty wp-content/plugins/ in build, so this is the
# simpler and more reliable path. Paid plugins (ACF Pro, WPML) still
# have to be dropped in via the WP admin — see RAILWAY_DEPLOY.md.
# ------------------------------------------------------------
WORKDIR /usr/src/wordpress/wp-content/plugins
RUN set -e; \
    for slug in wp-graphql wordpress-seo add-wpgraphql-seo wordfence; do \
      echo "[matmoora] installing ${slug}"; \
      curl -fsSL "https://downloads.wordpress.org/plugin/${slug}.latest-stable.zip" -o "/tmp/${slug}.zip"; \
      unzip -q "/tmp/${slug}.zip" -d .; \
      rm "/tmp/${slug}.zip"; \
    done; \
    echo "[matmoora] installed plugins:"; \
    ls -1

# ------------------------------------------------------------
# Ship the mu-plugins + stub theme + ACF JSON to the SOURCE dir so
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
