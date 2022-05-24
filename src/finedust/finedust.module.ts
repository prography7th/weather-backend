import { CacheModule, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { FinedustService } from '@finedust/finedust.service';
import { FinedustHelper } from '@finedust/finedust.helper';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60 * 60 + 600,
    }),
    ScheduleModule.forRoot(),
  ],
  providers: [FinedustHelper, FinedustService],
  exports: [FinedustService],
})
export class FinedustModule {}
