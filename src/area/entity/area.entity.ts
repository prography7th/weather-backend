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
  lonD: number;

  @Column()
  lonM: number;

  @Column()
  lonS: number;

  @Column()
  latD: number;

  @Column()
  latM: number;

  @Column()
  latS: number;
}
