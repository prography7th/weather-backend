import { IsNumber, IsString, IsUUID } from 'class-validator';
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('User')
export class UserEntity {
  @IsUUID()
  @PrimaryColumn({ length: 40 })
  id: string;

  @IsString()
  @Column({ nullable: false, length: 255 })
  token: string;

  @IsString()
  @Column({ nullable: false, length: 30 })
  lat: string;

  @IsString()
  @Column({ nullable: false, length: 30 })
  lon: string;

  @IsNumber()
  @Column({ default: null, type: 'tinyint' })
  alarmTime: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
