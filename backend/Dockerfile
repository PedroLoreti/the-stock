
FROM node:24-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY prisma.config.ts tsconfig.json tsconfig.build.json nest-cli.json ./
COPY prisma ./prisma
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate

COPY src ./src
RUN npm run build

# ---- Production stage ----
FROM node:24-slim AS production
WORKDIR /app
ENV PORT=3000

RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/prisma ./prisma

USER node
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=5 \
  CMD node -e "fetch('http://localhost:'+process.env.PORT+'/auth/me').then(r=>process.exit(r.status===401?0:1)).catch(()=>process.exit(1))"

CMD ["sh", "-c", "npx prisma migrate deploy && exec node dist/main"]
