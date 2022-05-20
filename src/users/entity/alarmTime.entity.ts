import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('AlarmTime')
export class AlarmTimeEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '알람 시간 (0 ~ 23)' })
  @Column({ type: 'tinyint' })
  time: number;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @ManyToOne((type) => UserEntity, (user) => user.alarmTimes, { onDelete: 'CASCADE' })
  user: UserEntity;
}
