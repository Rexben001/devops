FROM node:alpine
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY ./ ./
RUN npm i --openssl-legacy-provider
CMD ["npm", "run", "start"]