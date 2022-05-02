import { dfs_xy_conv } from '@app/lib/gridCoordinateConverter/src';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AreaEntity } from './entity/area.entity';

@Injectable()
export class AreaService {
  constructor(@InjectRepository(AreaEntity) private areaRepository: Repository<AreaEntity>) {}

  private convertLatOrLonToDMS(value: number | string) {
    value = Number(value);
    const D = Math.floor(value);
    const M = Math.floor((value - D) * 60);
    const S = ((value - D) * 60 - M) * 60;

    return { D, M, S };
  }

  async getArea(lat: string, lon: string): Promise<AreaEntity[]> {
    const latDMS = this.convertLatOrLonToDMS(lat);
    const lonDMS = this.convertLatOrLonToDMS(lon);
    const { x, y } = dfs_xy_conv('toXY', lat, lon);

    return await this.areaRepository.find({
      where: { x, y, latD: latDMS.D, latM: latDMS.M, lonD: lonDMS.D, lonM: lonDMS.M },
    });
  }

  async getAreaFromCode(code: string): Promise<AreaEntity> {
    return this.areaRepository.findOne({ where: { code } });
  }
}
