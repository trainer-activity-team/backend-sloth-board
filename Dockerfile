FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/generated ./src/generated
RUN npm ci --omit=dev && npm install prisma@^7.8.0 --omit=dev --no-save && npm install tsx --no-save
ENV NODE_ENV=production
ENV PATH="/app/node_modules/.bin:${PATH}"
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
