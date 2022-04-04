import { Injectable } from '@nestjs/common';
import { Coordinate } from 'coordinate-transformer';
import { regionCode } from './middle-forecast.region-code';
@Injectable()
export class MiddleForecastService {
  Coordinate: any;
  ct: Coordinate.ICoordinateTransformer;
  constructor() {
    this.Coordinate = require('../lib/coordinateTransformer/src/index.js');
  }

  async getRegionCode(x: number, y: number) {
    this.ct = new this.Coordinate(x, y);
    let result: Coordinate.AllRegionInformationType = await this.ct.getResult();
    return regionCode.filter((item) => result.documents[0].address_name.includes(item[0])).flat()[1];
  }
}
