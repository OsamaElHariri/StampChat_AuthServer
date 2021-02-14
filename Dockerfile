FROM node

RUN mkdir /app
WORKDIR /app

COPY src ./src
COPY knexfile.js .
COPY package.json .
COPY package-lock.json .

ENV NODE_ENV=prod

RUN npm i

CMD ["node", "src/app.js"]
