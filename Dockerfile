# syntax=docker/dockerfile:1.7

FROM oven/bun:1 AS deps
WORKDIR /app

# Install dependencies with lockfile for reproducible builds.
COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
		bun install --frozen-lockfile

FROM oven/bun:1 AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production

# Build-time placeholders only. Real secrets come from Kubernetes at runtime.
ARG DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/courseflow
ARG JWT_ACCESS_SECRET=placeholder-access-secret
ARG JWT_RESET_PASSWORD_SECRET=placeholder-reset-secret
ENV DATABASE_URL=${DATABASE_URL}
ENV JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
ENV JWT_RESET_PASSWORD_SECRET=${JWT_RESET_PASSWORD_SECRET}
RUN bun run build

FROM oven/bun:1 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Keep runtime image small: only copy what preview needs.
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/bun.lock ./bun.lock
COPY --from=build /app/svelte.config.js ./svelte.config.js
COPY --from=build /app/vite.config.ts ./vite.config.ts
COPY --from=build /app/static ./static
COPY --from=build /app/build ./build
COPY --from=build /app/.svelte-kit ./.svelte-kit

USER bun
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
	CMD bun -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000)).then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["bun", "./build/index.js"]
