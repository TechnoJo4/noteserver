FROM node:20 AS build

WORKDIR /app

COPY package.json .
COPY tsconfig.json .
ADD src/ /app/src/
RUN npm install
RUN npm run build

FROM node:20

WORKDIR /app
COPY footer.html .
COPY package*.json .
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
ADD public/ /app/public/
CMD ["node", "dist/index.js"]
