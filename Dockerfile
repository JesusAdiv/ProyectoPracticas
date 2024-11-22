# Usa una imagen base de Node.js
FROM node:18 as build

# Establece el directorio de trabajo
WORKDIR /app

# Copia solo los archivos esenciales para instalar dependencias
COPY client/package*.json ./client/


# Instala dependencias ignorando conflictos si es necesario



# Cambia al directorio `client` y instala las dependencias
WORKDIR /app/client
RUN npm install --legacy-peer-deps

# Copia todos los archivos de la carpeta `client`
COPY client/ ./

# Construye la aplicación
RUN npm run build

# Usa una imagen base ligera para servir la aplicación
FROM nginx:alpine

# Copia los archivos generados al directorio de Nginx
COPY --from=build /app/client/dist /usr/share/nginx/html

# Expone el puerto 80
EXPOSE 80

# Comando por defecto para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
