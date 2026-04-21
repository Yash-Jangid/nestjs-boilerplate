# ─── Stage 1: Production dependencies ────────────────────────────────────────
FROM node:24-alpine AS deps

WORKDIR /app

COPY package*.json ./

# --ignore-scripts prevents the `prepare` hook (is-ci || husky) from running.
# husky and is-ci are devDependencies and won't be present when --omit=dev is set.
ENV HUSKY=0
RUN npm ci --omit=dev --ignore-scripts

# ─── Stage 2: Build ───────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Skip prepare/husky hooks during build too — we invoke `npm run build` explicitly.
ENV HUSKY=0
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

# ─── Stage 3: Lean production image ──────────────────────────────────────────
FROM node:24-alpine AS production

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

# Runtime artifacts only — no devDeps, no source code
COPY --from=deps    /app/node_modules            ./node_modules
COPY --from=builder /app/dist                    ./dist
COPY --from=builder /app/src/mail/mail-templates ./src/mail/mail-templates
COPY --from=builder /app/src/i18n               ./src/i18n

# Env vars injected at runtime by Render — DATABASE_URL points to MongoDB Atlas
USER appuser

EXPOSE 3000

CMD ["node", "dist/main"]
