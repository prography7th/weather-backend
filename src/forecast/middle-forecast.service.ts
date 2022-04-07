import { Injectable } from '@nestjs/common';
import { Coordinate } from 'coordinate-transformer';
import { regionCode } from './middle-forecast.region-code';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class MiddleForecastService {
  Coordinate: any;
  ct: Coordinate.ICoordinateTransformer;
  serviceKey: string;
  tempEndpoint: string;
  randEndpoint: string;

  constructor(private configService: ConfigService) {
    this.Coordinate = require('../lib/coordinateTransformer/src/index.js');
    this.serviceKey = this.configService.get('M_FORECAST_SERVICE_KEY');
    this.randEndpoint = this.configService.get('M_RAND_END_POINT');
    this.tempEndpoint = this.configService.get('M_TMP_END_POINT');
  }

  async getMiddleForecastInformation(x: number, y: number) {
    const regionCode = await this.getRegionCode(x, y);
  }

  async getTempMiddleForecast(regionCode: string) {
    let result = await axios.get(
      `${this.tempEndpoint}?serviceKey=${this.serviceKey}&pageNo=1&numOfRows=10&dataType=JSON&regId=${regionCode}&tmFc=202204070600`,
    );
    return result.data.response.body.items.item;
  }
  async getRandMiddleForecast(regionCode: string) {
    console.log(new Date());
    let result = await axios.get(
      `${this.randEndpoint}?serviceKey=${this.serviceKey}&pageNo=1&numOfRows=10&dataType=JSON&regId=${regionCode}&tmFc=202204070600`,
    );
    return result.data.response.body.items.item;
  }

  async getRegionCode(x: number, y: number) {
    this.ct = new this.Coordinate(x, y);
    let result: Coordinate.AllRegionInformationType = await this.ct.getResult();
    return regionCode.filter((item) => result.documents[0].address_name.includes(item[0])).flat()[1];
  }
}
