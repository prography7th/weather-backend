import { PickType } from '@nestjs/swagger';
import { UserEntity } from '../entity/user.entity';

export class UpdateUserDto extends PickType(UserEntity, ['lat', 'lon', 'alarmTime'] as const) {}
