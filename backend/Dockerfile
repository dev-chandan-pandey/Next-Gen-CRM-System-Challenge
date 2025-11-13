# backend/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run prisma:generate
EXPOSE 5000
CMD ["node", "src/server.js"]
