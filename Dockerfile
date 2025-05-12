# Imagem compacta do Node.js slim
FROM node:18-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY src ./src

# Porta que o Express vai usar
EXPOSE 3002

CMD ["npm", "start"]
