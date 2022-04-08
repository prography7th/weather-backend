import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ForecastService } from '@forecast/forecast.service';
import { MiddleForecastService } from '@forecast/middle-forecast.service';

@Controller('forecast')
export class ForecastController {
  constructor(private forecastService: ForecastService, private middleForecast: MiddleForecastService) {}

  //TODO: 응답 데코레이터 작성
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
  getMiddleInfo(@Query('lat') lat: string, @Query('lon') lon: string) {
    return this.forecastService.getTodayInfo(lat, lon);
  }

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
  @Get('middle')
  getTodayInfo(@Query('lat') lat: string, @Query('lon') lon: string) {
    return this.middleForecast.getMiddleForecastInformation(Number(lon), Number(lat));
  }
}
