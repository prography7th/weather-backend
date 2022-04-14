import { PickType } from '@nestjs/swagger';
import { UserEntity } from '../entity/user.entity';

export class SaveUserDto extends PickType(UserEntity, ['id', 'token', 'lat', 'lon'] as const) {}
