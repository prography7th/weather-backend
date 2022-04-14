import { PickType } from '@nestjs/swagger';
import { UserEntity } from '../entity/user.entity';

export class UserResponseDto extends PickType(UserEntity, ['id', 'lat', 'lon', 'alarmTime'] as const) {}
