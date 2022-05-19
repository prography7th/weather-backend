import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, IsUUID } from 'class-validator';
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { AlarmTimeEntity } from './alarmTime.entity';

@Entity('User')
export class UserEntity {
  @ApiProperty({ description: 'UUID', example: 'a4f35968-dc52-48d6-8068-16a6c600bcce' })
  @IsUUID()
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

  @ApiProperty({ description: '알람 활성화 상태' })
  @IsBoolean()
  @Column({ default: false })
  isActive: boolean;

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
