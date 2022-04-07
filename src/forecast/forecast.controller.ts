import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ForecastService } from '@forecast/forecast.service';

@Controller('forecast')
export class ForecastController {
  constructor(private forecastService: ForecastService) {}

  //TODO: 응답 데코레이터 작성
  @ApiOperation({ summary: '오늘 날씨 정보 조회' })
  @ApiQuery({
    name: 'nx',
    required: true,
    type: Number,
    description: '예보지점 X 좌표',
  })
  @ApiQuery({
    name: 'ny',
    required: true,
    type: Number,
    description: '예보지점 Y 좌표',
  })
  @Get('today')
  getTodayInfo(@Query('nx') nx: string, @Query('ny') ny: string) {
    return this.forecastService.getTodayInfo(nx, ny);
  }
}
