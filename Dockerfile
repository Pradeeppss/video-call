FROM node:20.11.1
WORKDIR /app
COPY ./package*.json ./
RUN npm install
RUN npm i -g serve
COPY . .
RUN npm run build
EXPOSE 3000
# CMD ["npm","run","preview"]
CMD ["serve", "-s","dist"]

############################################
# FROM nginx:latest
# COPY --from=react /usr/src/app/dist /usr/share/nginx/html/project/dist
# COPY --from=react /usr/src/app/project.conf /etc/nginx/conf.d/default.confṭ
