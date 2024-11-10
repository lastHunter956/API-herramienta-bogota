# Usar una imagen base que soporte Puppeteer
FROM node:20

# Instalar las dependencias necesarias para Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    libnss3 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxrandr2 \
    libxi6 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libcups2 \
    libgbm1 \
    libasound2 \
    fonts-liberation \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libdrm2 \
    libnspr4 \
    libxss1 \
    && rm -rf /var/lib/apt/lists/*

# Crear un directorio para la aplicación
WORKDIR /usr/src/app

# Copiar los archivos del proyecto
COPY package*.json ./
COPY . .

# Instalar las dependencias del proyecto
RUN npm install

# Exponer el puerto en el que se ejecutará la API
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
