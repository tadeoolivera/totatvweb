FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY server/ ./server/
WORKDIR /app/server
EXPOSE 3000
CMD ["node", "server.js"]
