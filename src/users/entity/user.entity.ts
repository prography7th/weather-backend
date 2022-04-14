import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID } from 'class-validator';
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

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

  @ApiProperty({ description: '알람 시간 (0 ~ 24)' })
  @IsNumber()
  @Column({ default: null, type: 'tinyint' })
  alarmTime: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
