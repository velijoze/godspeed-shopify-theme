FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-fund --no-audit
COPY src ./src
ENV PORT=8080
EXPOSE 8080
CMD ["node","./src/server.js"]


