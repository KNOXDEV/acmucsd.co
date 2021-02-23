FROM node:lts-alpine AS base
WORKDIR /app
COPY package.json .
COPY package-lock.json .

FROM base AS dependencies
RUN apk add --no-cache python2 make gcc g++
RUN npm set progress=false && npm config set depth 0
RUN npm install

FROM base AS production
COPY --from=dependencies /app/node_modules ./node_modules
COPY static ./static
COPY app.js .
COPY *.html .
EXPOSE 80
CMD ["npm", "run", "start:prod"]
