import { AreaService } from '@app/area/area.service';
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
    private areaService: AreaService,
  ) {}

  async getUserToSendAlarm() {
    const hour = parseInt(new Date().toLocaleString('en-GB', { hour12: false }).split(', ')[1].split(':')[0]);

    return (await this.alarmTimeRepository.findOne(hour, { relations: ['users'] })).users;
  }

  async getUser(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne(id, {
      select: ['id', 'token', 'areaCode'],
      relations: ['alarmTimes'],
    });
    if (!user) throw new NotFoundException('존재하지 않는 유저');

    const area = await this.areaService.getAreaFromCode(user.areaCode);

    return {
      id: user.id,
      token: user.token,
      areaName: area.stage2 ? `${area.stage1} ${area.stage2}` : area.stage1,
      alarmTimes: user.alarmTimes,
    };
  }

  async saveUser(id: string, token: string, lat: string, lon: string): Promise<UserResponseDto> {
    const areaCode = (await this.areaService.getArea(lat, lon))[0].code;
    const user = new UserEntity();
    user.id = id;
    user.token = token;
    user.areaCode = areaCode;

    const newUser = await this.usersRepository.save(user);

    return this.getUser(newUser.id);
  }

  async updateUser(id: string, token: string, lat: string, lon: string): Promise<UserResponseDto> {
    const areaCode = (await this.areaService.getArea(lat, lon))[0].code;
    const user = await this.getUser(id);

    await this.usersRepository.update(user.id, { token, areaCode });

    return this.getUser(user.id);
  }

  async deleteUser(id: string) {
    await this.usersRepository.delete(id);
  }

  async addAlarmTime(userId: string, time: number): Promise<UserResponseDto> {
    const user = await this.getUser(userId);

    const alarmTime = new AlarmTimeEntity();
    alarmTime.user = await this.usersRepository.findOne(userId);
    alarmTime.time = time;
    await this.alarmTimeRepository.save(alarmTime);

    return this.getUser(user.id);
  }

  async switchAlarmTime(userId: string, alarmTimeId: number): Promise<UserResponseDto> {
    const user = await this.getUser(userId);

    const alarmTime = await this.alarmTimeRepository.findOne(alarmTimeId);
    if (!alarmTime) {
      throw new NotFoundException('존재하지 않는 알람 시간');
    }

    await this.alarmTimeRepository.update(alarmTimeId, { isActive: !alarmTime.isActive });

    return this.getUser(user.id);
  }

  async removeAlarmTime(userId: string, alarmTimeId: number): Promise<UserResponseDto> {
    const user = await this.getUser(userId);

    await this.alarmTimeRepository.delete(alarmTimeId);

    return this.getUser(user.id);
  }
}
