import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { AlarmTimeEntity } from './alarmTime.entity';

@Entity('User')
export class UserEntity {
  @ApiProperty({ description: 'UUID' })
  @IsString()
  @PrimaryColumn({ length: 40 })
  id: string;

  @ApiProperty({ description: '디바이스 토큰', example: 'token' })
  @IsString()
  @Column({ nullable: false, length: 255 })
  token: string;

  @ApiProperty({ description: '유저 현재 위치 행정구역코드' })
  @IsString()
  @Column({ nullable: false, length: 30 })
  areaCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty()
  @OneToMany((type) => AlarmTimeEntity, (alarmTime) => alarmTime.user, { cascade: true })
  alarmTimes: AlarmTimeEntity[];
}
