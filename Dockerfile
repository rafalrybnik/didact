# syntax=docker/dockerfile:1

FROM node:20-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ openssl && rm -rf /var/lib/apt/lists/*

COPY . .

# Keep installs reproducible and include the Linux native bindings recorded in the lockfile.
RUN npm ci --include=optional

RUN npx prisma generate
RUN npm run build

FROM node:20-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
ENV HOST=0.0.0.0
ENV PORT=3000

# Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node .output/server/index.mjs"]
