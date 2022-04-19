import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserResponseDto } from './dto/user-response.dto';
import { AlarmTimeEntity } from './entity/alarmTime.entity';
import { UserEntity } from './entity/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>,
    @InjectRepository(AlarmTimeEntity) private alarmTimeRepository: Repository<AlarmTimeEntity>,
  ) {}

  async getUser(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne(id, {
      select: ['id', 'token', 'lat', 'lon'],
      relations: ['alarmTimes'],
    });
    if (!user) throw new NotFoundException('존재하지 않는 유저');

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

  async updateUser(id: string, token: string, lat: string, lon: string): Promise<UserResponseDto> {
    const user = await this.getUser(id);
    await this.usersRepository.update(user.id, { token, lat, lon });

    return this.getUser(user.id);
  }

  async deleteUser(id: string) {
    await this.usersRepository.delete(id);
  }

  private async getAlarmTime(time): Promise<AlarmTimeEntity> {
    const alarmTime = await this.alarmTimeRepository.findOne({ where: { time } });
    if (!alarmTime) throw new NotFoundException('존재하지 않는 알람 시간');

    return alarmTime;
  }

  async addUserAlarmTime(userId: string, time: number): Promise<UserResponseDto> {
    const user = await this.getUser(userId);
    const alarmTime = await this.getAlarmTime(time);

    user.alarmTimes.push(alarmTime);
    await this.usersRepository.save(user);

    return this.getUser(user.id);
  }

  async removeUserAlarmTime(userId: string, time: number): Promise<UserResponseDto> {
    const user = await this.getUser(userId);

    user.alarmTimes = user.alarmTimes.filter((alarmTime) => alarmTime.time !== time);
    await this.usersRepository.save(user);

    return this.getUser(user.id);
  }
}
