import { HttpService } from '@nestjs/axios';
import { BadRequestException, CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
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
    const { x, y } = (await this.areaService.getArea(lat, lon))[0];

    // baseDate, baseTime 구하기
    const now = new Date().toLocaleString('en-GB', { hour12: false }).split(', ');
    const hour = parseInt(now[1].split(':')[0]);
    const [year, month, day] = now[0].split('/').reverse();
    const TODAY = `${year}${month}${day}`;
    const YESTERDAY = this.getYesterDay();
    const baseDate = 0 < hour ? TODAY : YESTERDAY;
    const baseTime = 0 < hour ? `${hour - 1 < 10 ? `0${hour - 1}30` : `${hour - 1}30`}` : '2330';
    const grid = `${String(x).padStart(3, '0')}${String(y).padStart(3, '0')}`;

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

    //최대 최소 온도 추가
    const [maxTmp, minTmp] = await this.getTmpInfo(lat, lon);
    result.maxTmp = maxTmp;
    result.minTmp = minTmp;

    //어제와 날씨 차이 확인
    result.diff = await this.getDiff(result, `${grid}:base`);

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
    const YESTERDAY = this.getYesterDay();
    const baseDate = 2 < hour && hour < 24 ? TODAY : YESTERDAY;
    const baseTime = 2 < hour && hour < 24 ? '0200' : '2300';
    const { x, y } = (await this.areaService.getArea(lat, lon))[0];
    const grid = `${String(x).padStart(3, '0')}${String(y).padStart(3, '0')}`;

    let result: TodayInfo = await this.cacheManager.get(`${grid}:${baseDate}`);

    Logger.log(`${grid}:${baseDate}`);
    Logger.log(result);

    if (result == null) {
      result = await this.cacheMissHandler(lat, lon, baseDate, baseTime);
      this.cacheManager.set(`${grid}:${baseDate}`, result, {
        ttl: 60 * 60 * 4,
      });
    }
    result['today'].report.fineDust = await this.getFineDustInfo(lon, lat);

    const { maxTmp, minTmp } = result.today.report;
    if (maxTmp == null || minTmp == null) {
      const [max, min] = this.getTmpRough(result);
      result.today.report.maxTmp = max;
      result.today.report.minTmp = min;
    }
    return result;
  }

  private async getDiff(now: WeatherMetadata, gridKey: string): Promise<number> {
    const { time, tmp } = now;
    const yesterDay = this.getYesterDay();
    const baseData = await this.cacheManager.get<TodayInfo>(gridKey);
    let diff: number;
    let result: WeatherMetadata;

    for (let key in baseData) {
      if (baseData[key].timeline[0].date !== yesterDay) continue;
      result = baseData[key].timeline.filter((v) => v.time === time)[0];
      diff = Number(tmp) - Number(result.tmp);
      break;
    }
    return diff ? diff : 0;
  }

  private async getTmpInfo(lat: string, lon: string): Promise<Array<number>> {
    const todayInfo = await this.getTodayInfo(lat, lon);
    const { maxTmp, minTmp } = todayInfo.today.report;
    if (maxTmp == null || minTmp == null) {
      return this.getTmpRough(todayInfo);
    }
    return [maxTmp, minTmp];
  }

  private getTmpRough(todayInfo: TodayInfo): number[] {
    const arr: number[] = [];
    todayInfo.today.timeline.forEach((v) => {
      arr.push(Number(v.tmp));
    });
    return [Math.max(...arr), Math.min(...arr)];
  }

  private getYesterDay(): string {
    const now = new Date().toLocaleString('en-GB', { hour12: false }).split(', ');
    const [year, month, day] = now[0].split('/').reverse();
    const yesterDay = `${year}${month}${parseInt(day) - 1 < 10 ? `0${parseInt(day) - 1}` : parseInt(day) - 1}`;
    return yesterDay;
  }

  /**
   * @description Cache Miss Handler
   * @author    leesky, hanna
   * @param    {string} lat
   * @param    {string} lon
   * @param    {string} baseDate
   * @param    {string} baseTime
   * @return   {Promise<TodayInfo>}
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
