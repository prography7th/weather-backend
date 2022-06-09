import { HttpService } from '@nestjs/axios';
import { BadRequestException, CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';

import { Day, ShortInfo, TodayInfo, WeatherMetadata, Report } from '@forecast/forecast.interface';
import { FinedustService } from '@finedust/finedust.service';
import { IFinedustSummary } from '@finedust/finedust.interface';
import { dfs_xy_conv } from '@lib/gridCoordinateConverter/src';
import { AreaService } from '@app/area/area.service';

@Injectable()
export class ForecastService {
  private CoordinateTranstormer;

  constructor(
    private httpService: HttpService,
    private finedustService: FinedustService,
    private configService: ConfigService,
    private areaService: AreaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

    console.log(JSON.stringify(responseData));

    const {
      header: { resultCode, resultMsg },
    } = responseData.response;
    if (resultCode !== '00') {
      throw new BadRequestException(`[단기예보 조회서비스] ${resultMsg}`);
    }

    return responseData.response.body.items.item;
  }

  async getNowInfo(lat: string, lon: string): Promise<WeatherMetadata> {
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
    const result = groupedByTime[0].reduce(
      (acc, cur) => {
        if (cur['category'] === 'SKY') acc['sky'] = cur['fcstValue'];
        if (cur['category'] === 'T1H') acc['tmp'] = cur['fcstValue'];
        if (cur['category'] === 'PTY') acc['pty'] = cur['fcstValue'];
        return acc;
      },
      { time: groupedByTime[0][0]['fcstTime'] },
    );

    return result;
  }

  private async getFineDustInfo(x: string, y: string): Promise<IFinedustSummary> {
    const converter = new this.CoordinateTranstormer(x, y);
    const region = await converter.getResult();
    const regionName = converter.convertRegionWithShortWord(region['documents'][0].region_1depth_name);
    const result = await this.finedustService.getInformation(regionName);

    return result;
  }

  async getTodayInfo(lat: string, lon: string): Promise<TodayInfo> {
    if (!lat || !lon) throw new BadRequestException('좌표를 입력해 주세요.');

    const now = new Date().toLocaleString('en-GB', { hour12: false }).split(', ');
    const hour = parseInt(now[1].split(':')[0]);
    const [year, month, day] = now[0].split('/').reverse();
    const TODAY = `${year}${month}${day}`;
    const YESTERDAY = `${year}${month}${parseInt(day) - 1 < 10 ? `0${parseInt(day) - 1}` : parseInt(day) - 1}`;
    const baseDate = 2 < hour && hour < 24 ? TODAY : YESTERDAY;
    const baseTime = 2 < hour && hour < 24 ? '0200' : '2300';
    const areaCode = (await this.areaService.getArea(lat, lon))[0].code;

    let result: TodayInfo = await this.cacheManager.get(`${areaCode}:${baseDate}`);
    console.log(`${areaCode}:${baseDate}`);
    console.log(result);

    if (result == null) {
      result = await this.cacheMissHandler(lat, lon, baseDate, baseTime);
      this.cacheManager.set(`${areaCode}:${baseDate}`, result, {
        ttl: 60 * 60 * 24 * 2,
      });
    }
    result['today'].report.fineDust = await this.getFineDustInfo(lon, lat);

    return result;
  }

  /**
   * Cache Miss Handler
   * @author    leesky, hanna
   * @param    string lat
   * @param    string lon
   * @param    string baseDate
   * @param    string baseTime
   * @return   promise TodayInfo
   */
  private async cacheMissHandler(lat: string, lon: string, baseDate: string, baseTime: string): Promise<TodayInfo> {
    function toWeatherData(day): Day {
      const times = Object.keys(day).sort();
      const timeline: WeatherMetadata[] = times.map((time) => ({
        date: day[time][0].fcstDate,
        time: day[time][0].fcstTime,
        sky: day[time].find((item) => item.category === 'SKY').fcstValue,
        tmp: day[time].find((item) => item.category === 'TMP').fcstValue,
        pop: day[time].find((item) => item.category === 'POP').fcstValue,
        pty: day[time].find((item) => item.category === 'PTY').fcstValue,
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
    const result = weatherData.reduce((acc, cur, idx) => {
      acc[['today', 'tomorrow', 'afterTomorrow'][idx]] = cur;
      return acc;
    }, {});

    // 최대 강수확률 정보 추가
    const todayTimeline = result['today'].timeline;
    let maxPop = 0;
    let time = 'all';

    for (let i = 0; i < todayTimeline.length; i++) {
      const curPop = todayTimeline[i].pop;
      if (curPop > maxPop) {
        maxPop = curPop;
        time = todayTimeline[i].time;
      }
    }

    result['today'].report.maxPop = { value: maxPop, time };

    return result;
  }
}
