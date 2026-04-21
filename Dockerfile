# ─── Stage 1: Install production dependencies ────────────────────────────────
FROM node:24-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# ─── Stage 2: Build ───────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─── Stage 3: Lean production image ──────────────────────────────────────────
FROM node:24-alpine AS production

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

# Runtime artifacts only
COPY --from=deps    /app/node_modules          ./node_modules
COPY --from=builder /app/dist                  ./dist
COPY --from=builder /app/src/mail/mail-templates ./src/mail/mail-templates
COPY --from=builder /app/src/i18n              ./src/i18n

# Env vars are injected at runtime by Render — no .env file needed
# DATABASE_URL points to MongoDB Atlas — no postgres, no wait-for-it

USER appuser

EXPOSE 3000

CMD ["node", "dist/main"]
