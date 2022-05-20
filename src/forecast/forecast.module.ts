import { FinedustModule } from '@app/finedust/finedust.module';
import { HttpModule } from '@nestjs/axios';
import { ForecastController } from '@forecast/forecast.controller';
import { ForecastService } from '@forecast/forecast.service';
import { MiddleForecastService } from '@forecast/middle-forecast.service';
import { ConfigModule } from '@nestjs/config';
import { AreaModule } from '@app/area/area.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [HttpModule, FinedustModule, ConfigModule, AreaModule],
  controllers: [ForecastController],
  providers: [ForecastService, MiddleForecastService],
})
export class ForecastModule {}
