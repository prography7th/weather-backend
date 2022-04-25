import { ApiProperty, PickType } from '@nestjs/swagger';
import { UserEntity } from '../entity/user.entity';

export class UserResponseDto extends PickType(UserEntity, ['id', 'token', 'alarmTimes'] as const) {
  @ApiProperty({ description: '유저 현재 위치 행정구역' })
  areaName: string;
}
