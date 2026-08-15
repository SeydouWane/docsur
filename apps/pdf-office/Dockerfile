FROM node:20-slim AS build
WORKDIR /app
COPY package.json tsconfig.json ./
RUN npm install
COPY src ./src
RUN npm run build

FROM node:20-slim
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
     libreoffice-writer libreoffice-impress libreoffice-calc libreoffice-core \
     fonts-liberation \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist

RUN useradd --system --create-home appuser
USER appuser
ENV HOME=/home/appuser

EXPOSE 3005
CMD ["node", "dist/server.js"]
