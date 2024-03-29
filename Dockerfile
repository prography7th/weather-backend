FROM node:16.14.0

WORKDIR /app

ADD package.json /app/package.json

# 타임존 설정
ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN npm install --legacy-peer-deps

ADD . /app
RUN npm run build

CMD ["node", "--max-old-space-size=800", "./dist/src/main.js"]
