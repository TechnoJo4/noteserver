FROM node:20 AS build

WORKDIR /app

COPY package.json .
COPY tsconfig.json .
ADD src/ /app/src/
ADD public/ /app/public/
RUN npm install
RUN npm run build

FROM node:20

WORKDIR /app
COPY package*.json .
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
CMD ["node", "dist/index.js"]
