# Create the docker image for backend 
FROM node:20-alpine

WORKDIR /user/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


# TCP port 
EXPOSE 4000

CMD ["npm", "run", "start:prod"]





