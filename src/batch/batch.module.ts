import { UsersModule } from '@app/users/users.module';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BatchService } from './batch.service';
import { BatchController } from './batch.controller';

@Module({
  imports: [ScheduleModule.forRoot(), UsersModule],
  providers: [BatchService],
  controllers: [BatchController],
})
export class BatchModule {}
