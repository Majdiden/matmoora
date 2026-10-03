# ------------------------------------------------------------
# Matmoora Meilisearch — Railway service image
# ------------------------------------------------------------
# Deployed as its own Railway service. The master key is set via the
# MEILI_MASTER_KEY env var in the Railway dashboard. Attach a Railway
# "Volume" at /meili_data so the index survives redeploys.
#
# Build on Railway by setting this as the Dockerfile path for the
# Meilisearch service.

FROM getmeili/meilisearch:v1.10

ENV MEILI_ENV=production
ENV MEILI_HTTP_ADDR=0.0.0.0:7700
ENV MEILI_NO_ANALYTICS=true
ENV MEILI_DB_PATH=/meili_data

EXPOSE 7700
VOLUME ["/meili_data"]
