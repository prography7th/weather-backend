import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmTimeEntity } from './entity/alarmTime.entity';
import { UserEntity } from './entity/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, AlarmTimeEntity])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
