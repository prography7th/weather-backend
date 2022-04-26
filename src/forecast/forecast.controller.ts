import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ForecastService } from '@forecast/forecast.service';
import { MiddleForecastService } from '@forecast/middle-forecast.service';
import { NowInfoDto } from './dto/now-info.dto';
import { TodayInfoDto } from './dto/today-info.dto';
import { ApiResponseWithDto } from '@app/common/decorators/api-response-with-dto.decorator';
import { MiddleInfoDto } from './dto/middle-info.dto';

const latMetadata = {
  name: 'lat',
  required: true,
  type: Number,
  description: '예보지점 위도',
  example: '37.48685107621001',
};

const lonMetadata = {
  name: 'lon',
  required: true,
  type: Number,
  description: '예보지점 경도',
  example: '126.83860422707822',
};

@ApiTags('Weather')
@Controller('forecast')
export class ForecastController {
  constructor(private forecastService: ForecastService, private middleForecast: MiddleForecastService) {}

  @ApiResponseWithDto(NowInfoDto)
  @ApiOperation({ summary: '지금 날씨 정보 조회' })
  @ApiQuery(latMetadata)
  @ApiQuery(lonMetadata)
  @Get('now')
  getNowInfo(@Query('lat') lat: string, @Query('lon') lon: string) {
    return this.forecastService.getNowInfo(lat, lon);
  }

  @ApiResponseWithDto(TodayInfoDto)
  @ApiOperation({ summary: '오늘 날씨 정보 조회' })
  @ApiQuery(latMetadata)
  @ApiQuery(lonMetadata)
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

  @ApiResponseWithDto(MiddleInfoDto)
  @ApiOperation({ summary: '주간 날씨 정보 조회' })
  @ApiQuery(latMetadata)
  @ApiQuery(lonMetadata)
  @Get('middle')
  getMiddleInfo(@Query('lat') lat: string, @Query('lon') lon: string) {
    return this.middleForecast.getMiddleForecastInformation(Number(lon), Number(lat));
  }
}
