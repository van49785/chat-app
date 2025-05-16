FROM node:24-Slim
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
# CMD ["node", "index.js"]
