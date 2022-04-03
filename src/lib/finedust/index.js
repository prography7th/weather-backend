module.exports = async function finedustGenerator() {
  require('dotenv').config();
  const END_POINT = process.env.DUST_END_POINT;
  const SERVICE_KEY = process.env.DUST_SERVICE_KEY;
  const axios = require('axios');
  const sidoNaems = [
    '서울',
    '부산',
    '대구',
    '인천',
    '광주',
    '대전',
    '울산',
    '경기',
    '강원',
    '충북',
    '충남',
    '전북',
    '전남',
    '경북',
    '경남',
    '제주',
    '세종',
  ];

  const results = sidoNaems.map(async (sidoName) => {
    let pm25Count = 0;
    let pm10Count = 0;
    let minuspm10Value = 0;
    let minuspm25Value = 0;
    let res = await axios.get(
      `${END_POINT}?sidoName=${encodeURI(
        sidoName,
      )}&returnType=JSON&serviceKey=${SERVICE_KEY}&numOfRows=1000&pageNo=1&ver=1.3`,
    );

    let items;
    if (res.data.response?.body) {
      items = res.data.response.body.items;
    } else {
      items = [[{ pm10Value: 0, pm25Value: 0 }]];
    }

    items.forEach((item) => {
      if (isNaN(Number(item.pm10Value))) minuspm10Value++;
      if (isNaN(Number(item.pm25Value))) minuspm25Value++;

      pm25Count += isNaN(Number(item.pm25Value)) ? 0 : Number(item.pm25Value);
      pm10Count += isNaN(Number(item.pm10Value)) ? 0 : Number(item.pm10Value);
    });

    return {
      sidoName,
      pm10avrg: Math.floor(pm10Count / (items.length - minuspm10Value)),
      pm25avrg: Math.floor(pm25Count / (items.length - minuspm25Value)),
    };
  });

  console.log(await Promise.all(results));
};
