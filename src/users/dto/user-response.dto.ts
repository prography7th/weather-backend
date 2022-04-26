import { ApiProperty, PickType } from '@nestjs/swagger';
import { AlarmTimeEntity } from '../entity/alarmTime.entity';
import { UserEntity } from '../entity/user.entity';

export class UserResponseDto extends PickType(UserEntity, ['id', 'token'] as const) {
  @ApiProperty({ example: [{ id: 14, time: 14 }] })
  alarmTimes: AlarmTimeEntity[];

  @ApiProperty({ description: '유저 현재 위치 행정구역' })
  areaName: string;
}
