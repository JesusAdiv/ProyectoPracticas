# Use ab specific node version
FROM node:20.13.1 As build
WORKDIR /app
COPY package*.json ./
# like npm install but get all the specific versions what you have
RUN npm ci
ENV NODE_OPTIONS=--max-old-space-size=4096
# Copy all the code of the project
COPY . .
RUN npm run build



# Todo Stage 2 
# use the nginx server
FROM nginx:alpine
# Copy all the statics files generateds by Vite to the Nginx directory
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
# Start ngingx
CMD ["nginx", "-g", "daemon off;"]

