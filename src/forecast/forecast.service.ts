import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Report, Time, WeatherData } from './forecast.interface';

@Injectable()
export class ForecastService {
  constructor(private httpService: HttpService) {}

  async getShortInfo(nx, ny): Promise<any> {
    function groupBy(data, key) {
      return data.reduce((acc, cur) => {
        (acc[cur[key]] = acc[cur[key]] || []).push(cur);
        return acc;
      }, {});
    }

    function toWeatherData(day): WeatherData {
      const times = Object.keys(day).sort();

      const timeline: Time[] = times.sort().map((time) => ({
        date: day[time][0].fcstDate,
        time: day[time][0].fcstTime,
        sky: day[time].find((item) => item.category === 'SKY').fcstValue,
        tmp: day[time].find((item) => item.category === 'TMP').fcstValue,
        pop: day[time].find((item) => item.category === 'POP').fcstValue,
      }));

      const maxTmpObj = times
        .map((time) => day[time].find((item) => item.category === 'TMX'))
        .filter((item) => !!item)[0];
      const minTmpObj = times
        .map((time) => day[time].find((item) => item.category === 'TMN'))
        .filter((item) => !!item)[0];

      const report: Report = {
        maxTmp: maxTmpObj ? +maxTmpObj.fcstValue : null,
        minTmp: minTmpObj ? +minTmpObj.fcstValue : null,
      };

      return { report, timeline };
    }

    const { SHORT_END_POINT, SHORT_SERVICE_KEY } = process.env;

    // baseDate, baseTime 구하기
    const now = new Date().toLocaleString('en-GB', { hour12: false }).split(', ');
    const nowTime = now[1].split(':');
    const nowTimeHour: number = parseInt(nowTime[0]);

    let baseDate = now[0].split('/').reverse().join('');
    let baseTime = '';

    if (2 < nowTimeHour && nowTimeHour <= 5) {
      baseTime = '0200';
    } else if (5 < nowTimeHour && nowTimeHour <= 8) {
      baseTime = '0500';
    } else if (8 < nowTimeHour && nowTimeHour <= 11) {
      baseTime = '0800';
    } else if (11 < nowTimeHour && nowTimeHour <= 14) {
      baseTime = '1100';
    } else if (14 < nowTimeHour && nowTimeHour <= 17) {
      baseTime = '1400';
    } else if (17 < nowTimeHour && nowTimeHour <= 20) {
      baseTime = '1700';
    } else if (20 < nowTimeHour && nowTimeHour <= 23) {
      baseTime = '2000';
    } else {
      baseDate = new Date(
        parseInt(baseDate.slice(0, 4)),
        parseInt(baseDate.slice(5, 6)) - 1,
        parseInt(baseDate.slice(7, 8)) - 1,
      )
        .toLocaleString('en-GB', { hour12: false })
        .split(', ')[0]
        .split('/')
        .reverse()
        .join('');
      baseTime = '2300';
    }

    // 단기예보 요청
    const requestURL = `${SHORT_END_POINT}?serviceKey=${SHORT_SERVICE_KEY}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;
    const { item: items } = (await this.httpService.get(requestURL).toPromise()).data.response.body.items;

    console.log(requestURL);

    // 날짜 & 시간별 그룹화
    const groupedByTimeAfterDate = Object.values(groupBy(items, 'fcstDate')).map((day) => groupBy(day, 'fcstTime'));

    // 데이터 포맷팅
    const weatherData = groupedByTimeAfterDate.slice(0, 3).map((day) => toWeatherData(day));
    const result = weatherData.reduce((acc, cur, idx) => {
      acc[['today', 'tomorrow', 'afterTomorrow'][idx]] = cur;
      return acc;
    }, {});

    return result;
  }
}
