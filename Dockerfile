FROM node:18-bullseye

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

# COPY source destination
COPY . .

CMD ["npm", "start"]
