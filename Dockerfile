FROM node:16-alpine AS build

WORKDIR /app

COPY package*.json .
RUN npm install
ADD src/ /app/src/
ADD src/ /app/public/
RUN npm run build

FROM node:16-alpine

WORKDIR /app
COPY package*.json .
RUN npm ci --only=production
COPY --from=build /app/dist ./dist
CMD ["node", "dist/index.js"]
