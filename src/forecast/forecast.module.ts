import { FinedustModule } from '@app/finedust/finedust.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ForecastController } from './forecast.controller';
import { ForecastService } from './forecast.service';
import { MiddleForecastService } from '@forecast/middle-forecast.service';
@Module({
  imports: [HttpModule, FinedustModule],
  controllers: [ForecastController],
  providers: [ForecastService, MiddleForecastService],
})
export class ForecastModule {}
