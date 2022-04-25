import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AreaService } from './area.service';
import { AreaEntity } from './entity/area.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AreaEntity])],
  providers: [AreaService],
  exports: [AreaService],
})
export class AreaModule {}
