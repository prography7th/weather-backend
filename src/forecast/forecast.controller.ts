import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ForecastService } from './forecast.service';

@Controller('forecast')
export class ForecastController {
  constructor(private forecastService: ForecastService) {}

  //TODO: 응답 데코레이터 작성
  @ApiOperation({ summary: '단기예보 조회' })
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
  @Get('short')
  getTodayInfo(@Query('nx') nx: number, @Query('ny') ny: number) {
    return this.forecastService.getShortInfo(nx, ny);
  }
}
