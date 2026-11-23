FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --include=dev --no-audit --no-fund
COPY . .
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build node node_modules/prisma/build/index.js generate && npm run build
ENV NODE_ENV=production
EXPOSE 10000
CMD ["node", "scripts/render-start.cjs"]
