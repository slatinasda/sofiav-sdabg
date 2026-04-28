FROM node:24

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

# COPY source destination
COPY . .

CMD ["npm", "start"]
