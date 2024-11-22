# Usa una imagen base de Node.js para construir el proyecto
FROM node:18 as build

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia el package.json y package-lock.json al contenedor
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia todo el código fuente al contenedor
COPY . ./

# Construye la aplicación para producción
RUN npm run build

# Usa una imagen ligera de Nginx para servir los archivos estáticos
FROM nginx:alpine

# Copia los archivos construidos al directorio predeterminado de Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Exponer el puerto 80 para servir el frontend
EXPOSE 80

# Comando predeterminado para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]