FROM node:lts-alpine

USER node

RUN mkdir -p /home/node/app/node_modules 

WORKDIR /home/node/app

COPY ./package.json .

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]