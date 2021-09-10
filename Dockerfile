FROM node:14.17.6-stretch

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

# COPY source destination
COPY . .

CMD ["npm", "start"]
