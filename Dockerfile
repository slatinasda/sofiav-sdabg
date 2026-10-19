FROM node:24

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

RUN npx playwright install --with-deps chromium

# COPY source destination
COPY . .

CMD ["npm", "start"]
