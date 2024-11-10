# Usa una imagen base ligera y compatible con Puppeteer
FROM node:20

# Instalar las dependencias necesarias para Puppeteer/Chromium
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    gnupg \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk1.0-0 \
    libpangocairo-1.0-0 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxi6 \
    libgbm1 \
    libgdk-pixbuf2.0-0 \
    libcups2 \
    libdrm2 \
    libxrandr2 \
    libxinerama1 \
    libpangoft2-1.0-0 \
    libwoff1 \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Establecer el directorio de trabajo
WORKDIR /usr/src/app

# Copiar archivos del proyecto
COPY package*.json ./
COPY . .

# Instalar dependencias del proyecto
RUN npm install

# Exponer el puerto 3000
EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]
