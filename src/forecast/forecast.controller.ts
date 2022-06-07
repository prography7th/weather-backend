import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ForecastService } from '@forecast/forecast.service';
import { MiddleForecastService } from '@forecast/middle-forecast.service';
import { NowInfoDto } from './dto/now-info.dto';
import { TodayInfoDto, WeatherMetadata } from './dto/today-info.dto';
import { ApiResponseWithDto } from '@app/common/decorators/api-response-with-dto.decorator';
import { MDay, MiddleInfoDto } from './dto/middle-info.dto';

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

  @ApiResponse({ description: 'Today > timeline 아이템 스키마', type: WeatherMetadata })
  @ApiResponseWithDto(TodayInfoDto)
  @ApiOperation({ summary: '오늘 날씨 정보 조회' })
  @ApiQuery(latMetadata)
  @ApiQuery(lonMetadata)
  @Get('today')
  getTodayInfo(@Query('lat') lat: string, @Query('lon') lon: string) {
    console.log(lat, lon);
    return this.forecastService.getTodayInfo(lat, lon);
  }

  @ApiResponse({ description: 'Middle > informations 아이템 스키마', type: MDay })
  @ApiResponseWithDto(MiddleInfoDto)
  @ApiOperation({ summary: '주간 날씨 정보 조회' })
  @ApiQuery(latMetadata)
  @ApiQuery(lonMetadata)
  @Get('middle')
  getMiddleInfo(@Query('lat') lat: string, @Query('lon') lon: string) {
    return this.middleForecast.getMiddleForecastInformation(Number(lon), Number(lat));
  }
}
