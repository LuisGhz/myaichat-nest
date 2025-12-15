FROM node:22-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM node:22-alpine as production
WORKDIR /app
COPY --from=build /app/dist /app/dist
RUN npm ci --omit=dev
CMD ["node", "dist/main"]
EXPOSE 3000