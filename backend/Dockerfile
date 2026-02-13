FROM node:18-alpine

WORKDIR /app

# INSTALL CURL and NETCAT HERE
RUN apk add --no-cache curl netcat-openbsd

COPY package*.json ./
RUN npm install

COPY . .

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["/entrypoint.sh"]