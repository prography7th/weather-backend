import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ForecastService } from '@forecast/forecast.service';
import { MiddleForecastService } from '@forecast/middle-forecast.service';

@Controller('forecast')
export class ForecastController {
  constructor(private forecastService: ForecastService, private middleForecast: MiddleForecastService) {}

  //TODO: 응답 데코레이터 작성
  @ApiOperation({ summary: '지금 날씨 정보 조회' })
  @ApiQuery({
    name: 'lat',
    required: true,
    type: Number,
    description: '예보지점 위도',
  })
  @ApiQuery({
    name: 'lon',
    required: true,
    type: Number,
    description: '예보지점 경도',
  })
  @Get('now')
  getNowInfo(@Query('lat') lat: string, @Query('lon') lon: string) {
    return this.forecastService.getNowInfo(lat, lon);
  }

  //TODO: 응답 데코레이터 작성
  @ApiOperation({ summary: '오늘 날씨 정보 조회' })
  @ApiQuery({
    name: 'lat',
    required: true,
    type: Number,
    description: '예보지점 위도',
  })
  @ApiQuery({
    name: 'lon',
    required: true,
    type: Number,
    description: '예보지점 경도',
  })
  @Get('today')
  getTodayInfo(@Query('lat') lat: string, @Query('lon') lon: string) {
    // baseDate, baseTime 구하기
    const now = new Date().toLocaleString('en-GB', { hour12: false }).split(', ');
    const hour = parseInt(now[1].split(':')[0]);
    const [year, month, day] = now[0].split('/').reverse();
    const TODAY = `${year}${month}${day}`;
    const YESTERDAY = `${year}${month}${parseInt(day) - 1 < 10 ? `0${parseInt(day) - 1}` : parseInt(day) - 1}`;
    const baseDate = 2 < hour && hour < 24 ? TODAY : YESTERDAY;
    const baseTime = 2 < hour && hour < 24 ? '0200' : '2300';

    return this.forecastService.getTodayInfo(lat, lon, baseDate, baseTime);
  }

  @ApiOperation({ summary: '주간 날씨 정보 조회' })
  @ApiQuery({
    name: 'lat',
    required: true,
    type: Number,
    description: '예보지점 위도',
  })
  @ApiQuery({
    name: 'lon',
    required: true,
    type: Number,
    description: '예보지점 경도',
  })
  @Get('middle')
  getMiddleInfo(@Query('lat') lat: string, @Query('lon') lon: string) {
    return this.middleForecast.getMiddleForecastInformation(Number(lon), Number(lat));
  }
}
