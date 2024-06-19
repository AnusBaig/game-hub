FROM node:18.16-alpine3.17

RUN  addgroup app && adduser -S -G app app
USER app

WORKDIR /app
COPY --chown=app:app package*.json .

RUN npm config set strict-ssl false
RUN npm install

COPY . .

ENV API_BASEURL=https://api.rawg.io/api/
ENV API_KEY=dc5df7919f524e57938609551e246696

EXPOSE 3500
CMD ["npm", "run", "dev"]