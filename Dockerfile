FROM node:18

# Crear el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el package.json y package-lock.json antes de copiar todo el proyecto
COPY package.json package-lock.json ./

# Forzar la instalación de dependencias con --legacy-peer-deps
RUN npm install --legacy-peer-deps
# Instalar las dependencias
RUN npm install

# Copiar el resto de los archivos
COPY . .

# Exponer el puerto
EXPOSE 5173

# Comando para ejecutar la aplicación
CMD ["npm", "run", "dev", "--", "--host"]