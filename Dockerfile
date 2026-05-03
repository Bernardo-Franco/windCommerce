# Monolith: Vite front + Express Api. Build from repo root

# --- Stage 1: Build the SPA VITE ---
# Produces static HTML/JS/CSS  under dist/ - copied into the final image as ./public

FROM node:22-bookworm-slim AS frontend-build
WORKDIR /app/front
COPY front/ ./

# empty = browser calls /api on the same host as the page (same domain as express).
ENV VITE_API_URL=

# Public clerk key ( safe to pass as build-arg: it is embedded in client js anyway)
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
RUN npm install --no-audit --no-fund \
    && npm run build

# --- stage 2: compile th api  ( typescript -> js) ---
# produces dist/ with index.js and the rest of the server bundle.

FROM node:22-bookworm-slim AS backend-build
WORKDIR /app
COPY back/ ./
RUN npm install --no-audit --no-fund \
    && npm run build

# --- stage 3: runtime image ( only prod deps + build assets)---
# express serves api routees and static files from public/ (the vite build from stage 1).
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY back/package.json package-lock.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

COPY --from=backend-build /app/dist ./dist
COPY --from=frontend-build /app/front/dist ./public

EXPOSE 3001
USER node

CMD ["node", "dist/index.js"]