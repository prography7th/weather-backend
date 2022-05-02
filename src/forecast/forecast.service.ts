import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { Day, Report, ShortInfo, Time, Weather } from '@forecast/forecast.interface';
import { FinedustService } from '@finedust/finedust.service';
import { IFinedustSummary } from '@finedust/finedust.interface';
import { dfs_xy_conv } from '@lib/gridCoordinateConverter/src';

@Injectable()
export class ForecastService {
  private CoordinateTranstormer;

  constructor(
    private httpService: HttpService,
    private finedustService: FinedustService,
    private configService: ConfigService,
  ) {
    this.CoordinateTranstormer = require('../lib/coordinateTransformer/src/index');
  }

  private groupBy(data: any[], key: string): { [key: string]: any[] } {
    return data.reduce((acc, cur) => {
      (acc[cur[key]] = acc[cur[key]] || []).push(cur);
      return acc;
    }, {});
  }

  private async requestShort(
    endPoint: string,
    baseDate: string,
    baseTime: string,
    nx: number,
    ny: number,
  ): Promise<ShortInfo[]> {
    const SHORT_SERVICE_KEY = this.configService.get('SHORT_SERVICE_KEY');

    const responseData = (
      await this.httpService
        .get(
          `${endPoint}?serviceKey=${SHORT_SERVICE_KEY}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`,
        )
        .toPromise()
    ).data;

    const {
      header: { resultCode, resultMsg },
    } = responseData.response;
    if (resultCode !== '00') {
      throw new Error(`[단기예보 조회서비스] ${resultMsg}`);
    }

    return responseData.response.body.items.item;
  }

  async getNowInfo(lat: string, lon: string): Promise<any> {
    if (!lat || !lon) throw new BadRequestException();

    // 기상청 XY좌표로 변환
    const { x, y } = dfs_xy_conv('toXY', lat, lon);

    // baseDate, baseTime 구하기
    const now = new Date().toLocaleString('en-GB', { hour12: false }).split(', ');
    const hour = parseInt(now[1].split(':')[0]);
    const [year, month, day] = now[0].split('/').reverse();
    const TODAY = `${year}${month}${day}`;
    const YESTERDAY = `${year}${month}${parseInt(day) - 1 < 10 ? `0${parseInt(day) - 1}` : parseInt(day) - 1}`;
    const baseDate = 0 < hour ? TODAY : YESTERDAY;
    const baseTime = 0 < hour ? `${hour - 1 < 10 ? `0${hour - 1}30` : `${hour - 1}30`}` : '2330';

    // 데이터 요청
    const VERY_SHORT_END_POINT = this.configService.get('VERY_SHORT_END_POINT');
    const data = await this.requestShort(VERY_SHORT_END_POINT, baseDate, baseTime, x, y);

    // 시간별 그룹화
    const groupedByTime = Object.values(this.groupBy(data, 'fcstTime'));

    // 데이터 포맷팅
    const weather = groupedByTime[0].reduce(
      (acc, cur) => {
        if (cur['category'] === 'SKY') acc['sky'] = cur['fcstValue'];
        if (cur['category'] === 'T1H') acc['tmp'] = cur['fcstValue'];
        return acc;
      },
      { time: groupedByTime[0][0]['fcstTime'] },
    );

    return weather;
  }

  private async getFineDustInfo(x: string, y: string): Promise<IFinedustSummary> {
    const converter = new this.CoordinateTranstormer(x, y);
    const region = await converter.getResult();
    const regionName = converter.convertRegionWithShortWord(region['documents'][0].region_1depth_name);
    const result = await this.finedustService.getInformation(regionName);

    return result;
  }

  async getTodayInfo(lat: string, lon: string, baseDate: string, baseTime: string): Promise<Weather> {
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

    if (!lat || !lon) throw new BadRequestException();

    // 기상청 XY좌표로 변환
    const { x, y } = dfs_xy_conv('toXY', lat, lon);

    // 날씨 데이터 요청
    const SHORT_END_POINT = this.configService.get('SHORT_END_POINT');
    const data = await this.requestShort(SHORT_END_POINT, baseDate, baseTime, x, y);

    // 날짜 & 시간별 그룹화
    const groupedByTimeAfterDate = Object.values(this.groupBy(data, 'fcstDate')).map((day) =>
      this.groupBy(day, 'fcstTime'),
    );

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
    weather['today'].report.fineDust = await this.getFineDustInfo(lon, lat);

    return weather;
  }
}
