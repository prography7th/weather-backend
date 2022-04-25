import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('AlarmTime')
export class AlarmTimeEntity {
  @PrimaryColumn({ type: 'tinyint' })
  id: number;

  @Column({ type: 'tinyint' })
  time: number;

  @ManyToMany(() => UserEntity, (user) => user.alarmTimes)
  users: UserEntity[];
}
