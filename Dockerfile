# Usa la imagen oficial de Node.js
FROM node:18

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el package.json y package-lock.json antes de copiar todo el proyecto
COPY package.json package-lock.json ./

# Forzar la instalación de dependencias con --legacy-peer-deps
RUN npm install --legacy-peer-deps

# Copia todos los archivos de tu proyecto
COPY . .

# Expone el puerto 5173 para tu aplicación React
EXPOSE 5173

# Ejecuta la aplicación en el contenedor
CMD ["npm", "start"]
