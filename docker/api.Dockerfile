FROM node:24-bookworm-slim AS base
WORKDIR /workspace
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

FROM base AS build
RUN npm ci --workspace @requesto/api --include-workspace-root
COPY apps/api/ apps/api/
RUN NODE_ENV=production HOST=127.0.0.1 PORT=3333 \
    APP_URL=http://127.0.0.1:3333 APP_KEY=requesto-build-placeholder LOG_LEVEL=error \
    DB_HOST=127.0.0.1 DB_PORT=5432 DB_USER=requesto_build \
    DB_PASSWORD=requesto_build DB_DATABASE=requesto_build \
    npm run build --workspace @requesto/api

FROM base AS runtime
RUN npm ci --omit=dev --workspace @requesto/api && npm cache clean --force
COPY --from=build --chown=node:node /workspace/apps/api/build/ apps/api/
WORKDIR /workspace/apps/api
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3333
USER node
EXPOSE 3333
CMD ["node", "bin/server.js"]
