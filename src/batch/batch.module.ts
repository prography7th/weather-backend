import { UsersModule } from '@app/users/users.module';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BatchService } from './batch.service';

@Module({
  imports: [ScheduleModule.forRoot(), UsersModule],
  providers: [BatchService],
})
export class BatchModule {}
