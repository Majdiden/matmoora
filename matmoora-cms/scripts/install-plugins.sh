#!/usr/bin/env bash
# Install the planned plugin set on a fresh WordPress (TECH_SPEC §3).
#
# Use cases:
#   - Initial bootstrap on a managed host that allows SSH + WP-CLI (Wevrlabs
#     usually does).
#   - Spinning up a fresh local stack from `docker compose -f
#     docker-compose.local.yml up`.
#
# Plugins from the WordPress.org directory are installed directly. Plugins
# that need a paid license (ACF Pro, WPML, WPGraphQL for ACF, WPGraphQL Yoast)
# are listed but skipped — drop their .zip files into `./plugin-archives/`
# and re-run this script to install + activate them.
set -euo pipefail

if ! command -v wp >/dev/null 2>&1; then
  echo "wp-cli not found on PATH. Install: https://wp-cli.org/" >&2
  exit 1
fi

ARCHIVES_DIR="${ARCHIVES_DIR:-./plugin-archives}"

# slug | source (`org`, `zip`, or `paid`) | optional zip filename
PLUGINS=(
  "wp-graphql|org"
  "wpgraphql-acf|org"
  "wordpress-seo|org"
  "add-wpgraphql-seo|org"
  "akismet|org"
  "wordfence|org"
  "advanced-custom-fields-pro|paid|advanced-custom-fields-pro.zip"
  "sitepress-multilingual-cms|paid|sitepress-multilingual-cms.zip"
  "wp-graphql-wpml|paid|wp-graphql-wpml.zip"
)

for entry in "${PLUGINS[@]}"; do
  IFS='|' read -r slug source zip <<<"$entry"

  case "$source" in
    org)
      if wp plugin is-installed "$slug" >/dev/null 2>&1; then
        echo "==> $slug already installed"
      else
        echo "==> Installing $slug from wp.org"
        wp plugin install "$slug" --activate
      fi
      ;;
    paid)
      local_zip="${ARCHIVES_DIR}/${zip}"
      if [[ -f "$local_zip" ]]; then
        echo "==> Installing $slug from $local_zip"
        wp plugin install "$local_zip" --activate --force
      else
        echo "==> Skipping $slug (place ${zip} in ${ARCHIVES_DIR}/ to install)"
      fi
      ;;
  esac
done

echo
echo "Done. Verify with: wp plugin list"
echo "Don't forget to add any newly-installed plugin to plugins.lock."
