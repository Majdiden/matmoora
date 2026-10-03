# ------------------------------------------------------------
# Matmoora Meilisearch — Railway service image
# ------------------------------------------------------------
# Deployed as its own Railway service (see README.md in this folder).
# The master key is set via the MEILI_MASTER_KEY env var in the Railway
# dashboard. Attach a Railway Volume at /meili_data so the index
# survives redeploys.

FROM getmeili/meilisearch:v1.10

ENV MEILI_ENV=production
# Railway sets $PORT dynamically; Meilisearch reads MEILI_HTTP_ADDR.
# The CMD below adapts at runtime via `sh -c`.
ENV MEILI_NO_ANALYTICS=true
ENV MEILI_DB_PATH=/meili_data

# NOTE: no Docker VOLUME directive — Railway rejects it. Attach a
# Railway Volume at /meili_data via the dashboard instead (see README).
EXPOSE 7700

CMD ["sh", "-c", "exec meilisearch --http-addr 0.0.0.0:${PORT:-7700} --master-key \"${MEILI_MASTER_KEY}\" --db-path /meili_data"]
