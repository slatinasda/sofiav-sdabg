FROM node:12.14.0-stretch

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# COPY source destination
COPY . .

CMD ["npm", "start"]
