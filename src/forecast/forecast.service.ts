import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Report, Time, WeatherData } from '@forecast/forecast.interface';

@Injectable()
export class ForecastService {
  constructor(private httpService: HttpService) {}

  async getTodayInfo(nx, ny): Promise<any> {
    function groupBy(data, key) {
      return data.reduce((acc, cur) => {
        (acc[cur[key]] = acc[cur[key]] || []).push(cur);
        return acc;
      }, {});
    }

    function toWeatherData(day): WeatherData {
      const times = Object.keys(day).sort();
      const timeline: Time[] = times.map((time) => ({
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
    const baseDate = new Date().toLocaleString('en-GB', { hour12: false }).split(', ')[0].split('/').reverse().join('');
    const requestURL = `${SHORT_END_POINT}?serviceKey=${SHORT_SERVICE_KEY}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${baseDate}&base_time=0200&nx=${nx}&ny=${ny}`;

    const { item: items } = (await this.httpService.get(requestURL).toPromise()).data.response.body.items;

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
