import { FinedustModule } from '@app/finedust/finedust.module';
import { HttpModule } from '@nestjs/axios';
import { CacheModule, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { ForecastController } from '@forecast/forecast.controller';
import { ForecastService } from '@forecast/forecast.service';
import { MiddleForecastService } from '@forecast/middle-forecast.service';
import { ConfigModule } from '@nestjs/config';
import { AreaModule } from '@app/area/area.module';

@Module({
  imports: [
    HttpModule,
    FinedustModule,
    ConfigModule,
    AreaModule,
    CacheModule.registerAsync({
      useFactory: async () => ({
        store: redisStore,
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        ttl: 100000,
      }),
    }),
  ],
  controllers: [ForecastController],
  providers: [ForecastService, MiddleForecastService],
})
export class ForecastModule {}
