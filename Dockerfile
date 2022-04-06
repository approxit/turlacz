FROM node:16-alpine AS build

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
COPY src/ ./src/

RUN npm ci \
    && npm run compile

FROM node:16-alpine AS final

WORKDIR /app
CMD ["node", "--experimental-modules", "--es-module-specifier-resolution=node", "index.js"]

COPY --from=build /app/package.json .
COPY --from=build /app/package-lock.json .

RUN npm ci --only=production \
    && npm cache clean --force

COPY --from=build /app/dist/ .