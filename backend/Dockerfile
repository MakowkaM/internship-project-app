# ---------- stage 1: dependencies ----------
FROM node:20-alpine AS base

WORKDIR /app

# tylko package.json najpierw (cache layer)
COPY package*.json ./

RUN npm install --production

# ---------- stage 2: app ----------
FROM node:20-alpine

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY . .

EXPOSE 5000

CMD ["node", "index.js"]