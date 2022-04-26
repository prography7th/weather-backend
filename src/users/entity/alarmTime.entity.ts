import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('AlarmTime')
export class AlarmTimeEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'tinyint' })
  id: number;

  @ApiProperty({ description: '알람 시간' })
  @Column({ type: 'tinyint' })
  time: number;

  @ManyToMany(() => UserEntity, (user) => user.alarmTimes)
  users: UserEntity[];
}
