FROM node:13.12.0-alpine3.11

# Default Env variables
ENV PORT 4000
ENV HOST 0.0.0.0
ENV TEZOS_NODE https://api.tezos.org.ua

WORKDIR /home/node/app
COPY package*.json ./
ENV NODE_ENV=production

#RUN npm ci --only=production
RUN npm i
COPY . .
RUN npm run build
USER node
EXPOSE 3000
CMD [ "npm", "run", "start" ]