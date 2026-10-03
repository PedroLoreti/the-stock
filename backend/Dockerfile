# syntax=docker/dockerfile:1

# ---- Build stage ----
# Also used by the `seed` service of docker-compose.yaml: it needs tsx and the TypeScript sources.
FROM node:24-slim AS builder
WORKDIR /app

# Prisma needs OpenSSL to run its schema engine.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

# The client is generated into src/generated and compiled into dist by the Nest build.
# The generator reads tsconfig.json to pick the import extension (.js), so it comes first.
# `prisma generate` only needs a syntactically valid URL; the real one comes at runtime.
COPY prisma.config.ts tsconfig.json tsconfig.build.json nest-cli.json ./
COPY prisma ./prisma
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate

COPY src ./src
RUN npm run build

# ---- Production stage ----
FROM node:24-slim AS production
WORKDIR /app
ENV PORT=3000
# NODE_ENV is left unset on purpose: in production mode the refresh cookie is marked Secure,
# which browsers only store over HTTPS (or localhost). Set it in the environment behind HTTPS.

RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# The Prisma CLI stays installed: it is an optional peer of @prisma/client, so --omit=dev keeps it.
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Compiled app (with the generated client), Prisma config, schema and migrations.
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/prisma ./prisma

# Files stay owned by root and read-only for the app user.
USER node
EXPOSE 3000

# The API answers 401 on /auth/me without a token: good enough to prove it is up.
HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=5 \
  CMD node -e "fetch('http://localhost:'+process.env.PORT+'/auth/me').then(r=>process.exit(r.status===401?0:1)).catch(()=>process.exit(1))"

# Apply pending migrations, then start the server (exec: node becomes PID 1 and gets SIGTERM).
CMD ["sh", "-c", "npx prisma migrate deploy && exec node dist/main"]
