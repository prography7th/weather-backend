import { PickType } from '@nestjs/swagger';
import { UserEntity } from '../entity/user.entity';

export class UpdateUserDto extends PickType(UserEntity, ['token', 'lat', 'lon'] as const) {}
