# Usa una imagen base ligera y compatible con Puppeteer
FROM node:20

# Instala las dependencias del sistema requeridas por Puppeteer
RUN apt-get update && apt-get install -y \
  libnss3 \
  libxss1 \
  libasound2 \
  fonts-liberation \
  libdrm2 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libglib2.0-0 \
  libgtk-3-0 \
  libxshmfence1 \
  xdg-utils \
  --no-install-recommends && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

# Establece el directorio de trabajo
WORKDIR /usr/src/app

# Copia los archivos necesarios
COPY package*.json ./
COPY . .

# Instala las dependencias de Node.js
RUN npm install

# Exponer el puerto donde correrá la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
