import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserResponseDto } from './dto/user-response.dto';
import { UserEntity } from './entity/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>) {}

  async getUser(id: string) {
    const user = await this.usersRepository.findOne(id, { select: ['id', 'lat', 'lon', 'alarmTime'] });
    if (!user) throw new NotFoundException();

    return user;
  }

  async saveUser(id: string, token: string, lat: string, lon: string): Promise<UserResponseDto> {
    const user = new UserEntity();
    user.id = id;
    user.token = token;
    user.lat = lat;
    user.lon = lon;

    const newUser = await this.usersRepository.save(user);

    return this.getUser(newUser.id);
  }

  async updateUser(id: string, lat: string, lon: string, alarmTime: number): Promise<UserResponseDto> {
    const user = await this.getUser(id);
    await this.usersRepository.update(user.id, { lat, lon, alarmTime });

    return this.getUser(user.id);
  }

  async deleteUser(id: string) {
    await this.usersRepository.delete(id);
  }
}
