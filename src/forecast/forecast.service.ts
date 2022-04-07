import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Day, Report, Time } from '@forecast/forecast.interface';
import { FinedustService } from '@app/finedust/finedust.service';
import { IFinedustSummary } from '@app/finedust/finedust.interface';

@Injectable()
export class ForecastService {
  private CoordinateTranstormer;

  constructor(private httpService: HttpService, private finedustService: FinedustService) {
    this.CoordinateTranstormer = require('../lib/coordinateTransformer/src/index');
  }

  private async getFineDustInfo(x: string, y: string): Promise<IFinedustSummary> {
    const converter = await new this.CoordinateTranstormer(x, y);
    // const region = await converter.getResultWithTypeH();
    const region = await converter.getResult();
    const regionName = converter.convertRegionWithShortWord(region['documents'][0].region_1depth_name);
    const result = await this.finedustService.getInformation(regionName);

    return result;
  }

  async getTodayInfo(nx: string, ny: string): Promise<any> {
    function groupBy(data, key) {
      return data.reduce((acc, cur) => {
        (acc[cur[key]] = acc[cur[key]] || []).push(cur);
        return acc;
      }, {});
    }

    function toWeatherData(day): Day {
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

    if (!nx || !ny) throw new BadRequestException();

    try {
      const { SHORT_END_POINT, SHORT_SERVICE_KEY } = process.env;

      // baseDate, baseTime 구하기
      const now = new Date().toLocaleString('en-GB', { hour12: false }).split(', ');
      const hour = parseInt(now[1].split(':')[0]);
      const [year, month, day] = now[0].split('/').reverse();
      const TODAY = `${year}${month}${day}`;
      const YESTERDAY = `${year}${month}${parseInt(day) - 1 < 10 ? `0${parseInt(day) - 1}` : parseInt(day) - 1}`;
      const baseDate = 2 < hour && hour < 24 ? TODAY : YESTERDAY;
      const baseTime = 2 < hour && hour < 24 ? '0200' : '2300';

      const requestUrl = `${SHORT_END_POINT}?serviceKey=${SHORT_SERVICE_KEY}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${parseInt(
        nx,
      )}&ny=${parseInt(ny)}`;
      const { item: items } = (await this.httpService.get(requestUrl).toPromise()).data.response.body.items;

      // 날짜 & 시간별 그룹화
      const groupedByTimeAfterDate = Object.values(groupBy(items, 'fcstDate')).map((day) => groupBy(day, 'fcstTime'));

      // 데이터 포맷팅
      const weatherData = groupedByTimeAfterDate.slice(0, 3).map((day) => toWeatherData(day));
      const weather = weatherData.reduce((acc, cur, idx) => {
        acc[['today', 'tomorrow', 'afterTomorrow'][idx]] = cur;
        return acc;
      }, {});

      // 최대 강수확률 정보 추가
      const todayTimeline = weather['today'].timeline;
      let maxPop = 0;
      let time = 'all';

      for (let i = 0; i < todayTimeline.length; i++) {
        const curPop = todayTimeline[i].pop;
        if (curPop > maxPop) {
          maxPop = curPop;
          time = todayTimeline[i].time;
        }
      }

      weather['today'].report.maxPop = { value: maxPop, time };

      // 미세먼지 정보 추가
      // weather['today'].report.fineDust = await this.getFineDustInfo(nx, ny);
      weather['today'].report.fineDust = await this.getFineDustInfo('128.8875970893', '35.88795706523');

      return weather;
    } catch (err) {
      if (err.statusCode == 400) throw new BadRequestException();
      console.error(err);
      throw new Error(err);
    }
  }
}
