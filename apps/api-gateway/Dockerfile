# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /usr/src/app
RUN npm install -g pnpm

# ---- Dependencies ----
FROM base AS dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# ---- Build ----
FROM base AS build
COPY . .
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
RUN pnpm run build api-gateway

# ---- Release ----
FROM base AS release
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod
COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/apps/api-gateway/main"]
