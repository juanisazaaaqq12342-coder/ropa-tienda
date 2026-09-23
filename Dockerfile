FROM node:22-bookworm-slim AS dependencies
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
RUN npm ci

FROM dependencies AS api-build
COPY . .
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build
RUN npm run db:generate -w @luxe/api && npm run build -w @luxe/api

FROM dependencies AS api
COPY --from=api-build /app/apps/api ./apps/api
COPY --from=api-build /app/node_modules ./node_modules
RUN mkdir -p /app/storage && chown node:node /app/storage
WORKDIR /app/apps/api
USER node
EXPOSE 4000
CMD ["npm", "start"]

FROM dependencies AS web-build
COPY . .
ARG API_URL=http://api:4000
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV API_URL=$API_URL NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL NEXT_TELEMETRY_DISABLED=1
RUN npm run build -w @luxe/web

FROM dependencies AS web
COPY --from=web-build /app/apps/web ./apps/web
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app/apps/web
RUN chown -R node:node .next
USER node
EXPOSE 3000
CMD ["npm", "exec", "next", "start", "--", "--hostname", "0.0.0.0"]
