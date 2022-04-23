import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('Area')
export class AreaEntity {
  @PrimaryColumn()
  code: string;

  @Column()
  stage1: string;

  @Column({ nullable: true })
  stage2: string;

  @Column({ nullable: true })
  stage3: string;

  @Column()
  x: number;

  @Column()
  y: number;

  @Column()
  lonPerHour: number;

  @Column()
  lonPerMinute: number;

  @Column()
  lonPerSecond: number;

  @Column()
  latPerHour: number;

  @Column()
  latPerMinute: number;

  @Column()
  latPerSecond: number;

  @Column()
  lonPerSecond100: number;

  @Column()
  latPerSecond100: number;
}
