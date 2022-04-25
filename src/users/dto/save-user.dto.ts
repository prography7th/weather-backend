import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { UserEntity } from '../entity/user.entity';

export class SaveUserDto extends PickType(UserEntity, ['id', 'token'] as const) {
  @ApiProperty({ description: '유저 현재 위치 위도' })
  @IsString()
  lat: string;

  @ApiProperty({ description: '유저 현재 위치 경도' })
  @IsString()
  lon: string;
}
