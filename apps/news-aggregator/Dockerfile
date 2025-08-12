FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --no-fund --no-audit
COPY src ./src
CMD ["node","./src/index.js"]


