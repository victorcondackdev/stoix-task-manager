FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npm run prisma:deploy && node dist/index.js"]
