FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json .
COPY tsconfig.json .
RUN npm install
ADD src/ /app/src/
ADD src/ /app/public/
RUN npm run build

FROM node:20-alpine

WORKDIR /app
COPY package*.json .
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
CMD ["node", "dist/index.js"]
