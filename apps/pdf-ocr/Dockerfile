FROM node:20-slim AS build
WORKDIR /app
COPY package.json tsconfig.json ./
RUN npm install
COPY src ./src
RUN npm run build

FROM node:20-slim
RUN apt-get update \
  && apt-get install -y --no-install-recommends ocrmypdf tesseract-ocr-fra tesseract-ocr-eng \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist

RUN useradd --system --create-home appuser
USER appuser

EXPOSE 3004
CMD ["node", "dist/server.js"]
