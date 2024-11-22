# Usa la imagen base de Python
FROM python:3.12.3

# Instala locales y configura es_ES.utf8
RUN apt-get update && \
    apt-get install -y locales && \
    sed -i '/es_ES.UTF-8/s/^# //g' /etc/locale.gen && \
    locale-gen

# Establece el locale como variables de entorno
ENV LANG es_ES.UTF-8
ENV LANGUAGE es_ES:es
ENV LC_ALL es_ES.UTF-8

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos el archivo de dependencias y lo instalamos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el resto del código
COPY . .

# Exponemos el puerto de la aplicación
EXPOSE 8000

# Entrypoint script para ejecutar migraciones y el servidor
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Comando de ejecución
ENTRYPOINT ["/entrypoint.sh"]