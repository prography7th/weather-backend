import { FinedustModule } from '@app/finedust/finedust.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ForecastController } from '@forecast/forecast.controller';
import { ForecastService } from '@forecast/forecast.service';
import { MiddleForecastService } from '@forecast/middle-forecast.service';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [HttpModule, FinedustModule, ConfigModule],
  controllers: [ForecastController],
  providers: [ForecastService, MiddleForecastService],
})
export class ForecastModule {}
