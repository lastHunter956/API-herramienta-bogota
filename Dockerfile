# Usa una imagen base oficial de Node.js
FROM node:20

# Instalar dependencias necesarias para Puppeteer
RUN apt-get update && apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libatspi2.0-0 \
  libcups2 \
  libdbus-1-3 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  --no-install-recommends && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

# Crear y establecer directorio de trabajo
WORKDIR /usr/src/app

# Copiar archivos de la aplicación
COPY package*.json ./
COPY . .

# Instalar dependencias
RUN npm install

# Exponer el puerto en el que la API escuchará
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]