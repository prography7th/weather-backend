import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { AlarmTimeEntity } from './alarmTime.entity';

@Entity('User')
export class UserEntity {
  @ApiProperty({ description: 'UUID' })
  @IsUUID()
  @PrimaryColumn({ length: 40 })
  id: string;

  @ApiProperty({ description: '디바이스 토큰' })
  @IsString()
  @Column({ nullable: false, length: 255 })
  token: string;

  @ApiProperty({ description: '유저 위치 위도' })
  @IsString()
  @Column({ nullable: false, length: 30 })
  lat: string;

  @ApiProperty({ description: '유저 위치 경도' })
  @IsString()
  @Column({ nullable: false, length: 30 })
  lon: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => AlarmTimeEntity, (alarmTime) => alarmTime.users, { cascade: true })
  @JoinTable({
    name: 'user_alarmTime',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'alarmTimeId', referencedColumnName: 'id' },
  })
  @ApiProperty({})
  alarmTimes: AlarmTimeEntity[];
}
