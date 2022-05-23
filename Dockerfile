FROM node:16.14.0

WORKDIR /app

ADD package.json /app/package.json

# 타임존 설정
ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN npm install

ADD . /app
RUN npm run build
RUN node ./dist/main.js --max-old-space-size=1024

CMD ["npm", "run", "start"]
