import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('AlarmTime')
export class AlarmTimeEntity {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '알람 시간 (0 ~ 23)', example: 14 })
  @Column({ type: 'tinyint' })
  time: number;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ManyToOne((type) => UserEntity, (user) => user.alarmTimes, { nullable: false, onDelete: 'CASCADE' })
  user: UserEntity;
}
