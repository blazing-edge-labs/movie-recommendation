FROM node:8-alpine

RUN \
  apk add --no-cache --virtual .build make gcc g++ python

EXPOSE 80
ENV \
  PORT=80 \
  NODE_ENV=production

WORKDIR /node
COPY . /node
RUN \
  npm i --build-from-source && \
  npm run build

RUN \
  rm -rf /root && \
  apk del .build

CMD node --optimize_for_size --max_old_space_size=200 -r babel-register index.js
