import { Injectable } from '@nestjs/common';
import { Coordinate } from 'coordinate-transformer';
import { randRegionCode, yeongseoRegions, yeongdongRegions } from './rand.region-information';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { regionCode } from './middle-forecast.region-code';
@Injectable()
export class MiddleForecastService {
  Coordinate: any;
  ct: Coordinate.ICoordinateTransformer;
  serviceKey: string;
  tempEndpoint: string;
  randEndpoint: string;
  week = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

  constructor(private configService: ConfigService) {
    this.Coordinate = require('../lib/coordinateTransformer/src/index.js');
    this.serviceKey = this.configService.get('M_FORECAST_SERVICE_KEY');
    this.randEndpoint = this.configService.get('M_RAND_END_POINT');
    this.tempEndpoint = this.configService.get('M_TMP_END_POINT');
  }

  async getMiddleForecastInformation(x: number, y: number) {
    const regionCode = await this.getRegionCode(x, y);
    let requestDate = this.makeDateFormat(new Date());
    let tmpResult = await this.getTempMiddleForecast(regionCode[0], requestDate);
    let rndResult = await this.getRandMiddleForecast(regionCode[1], requestDate);

    let year = requestDate.slice(0, 4);
    let month = requestDate.slice(4, 6);
    let day = requestDate.slice(6, 8);

    delete tmpResult[0].regId;
    let temperatures = Object.entries(tmpResult[0]).filter(
      (entry) =>
        !entry[0].includes('High') &&
        !entry[0].includes('Low') &&
        !entry[0].includes('8') &&
        !entry[0].includes('9') &&
        !entry[0].includes('10'),
    );

    delete rndResult[0].regId;
    let precipitation = Object.entries(rndResult[0]).filter(
      (entry) =>
        !entry[0].includes('wf') && !entry[0].includes('8') && !entry[0].includes('9') && !entry[0].includes('10'),
    );

    let weather = Object.entries(rndResult[0]).filter(
      (entry) =>
        !entry[0].includes('rnSt') && !entry[0].includes('8') && !entry[0].includes('9') && !entry[0].includes('10'),
    );

    let result = {
      requestDay: new Date(requestDate).getDay(),
      informations: [],
    };

    for (let i = 0; i < 10; i += 2) {
      result.informations.push({
        day: this.week[new Date(Number(year), Number(month) - 1, Number(day + 3 + i / 2)).getDay()],
        tmpMin: temperatures[i][1],
        tmpMax: temperatures[i + 1][1],
        am: {
          precipitation: precipitation[i][1],
          weather: weather[i][1],
        },
        pm: {
          precipitation: precipitation[i + 1][1],
          weather: weather[i + 1][1],
        },
      });
    }

    console.log(JSON.stringify(result, null, 2));
    return result;
    //오늘 기준 3일 이후 부터 강수확률, 최대 최저 기온, 날씨
    /*
      {
        request_date: 
        weather: {
          1:
          2: //여기가 3
          3: 
          
        }
      }


    */
  }

  async getTempMiddleForecast(regionCode: string, date: string) {
    let result = await axios.get(
      `${this.tempEndpoint}?serviceKey=${this.serviceKey}&pageNo=1&numOfRows=10&dataType=JSON&regId=${regionCode}&tmFc=${date}`,
    );
    return result.data.response.body.items.item;
  }

  async getRandMiddleForecast(regionCode: string, date: string) {
    let result = await axios.get(
      `${this.randEndpoint}?serviceKey=${this.serviceKey}&pageNo=1&numOfRows=10&dataType=JSON&regId=${regionCode}&tmFc=${date}`,
    );
    return result.data.response.body.items.item;
  }

  makeDateFormat(date: Date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    if (hour < 6) {
      hour = 18;
      day = day - 1;
    } else hour = 18 <= hour ? 18 : 6;

    return `${
      String(year) + (month < 10 ? '0' + month : month) + (day < 10 ? '0' + day : day) + (hour < 10 ? '0' + hour : hour)
    }00`;
  }

  async getRegionCode(x: number, y: number) {
    this.ct = new this.Coordinate(x, y);
    let result: Coordinate.AllRegionInformationType = await this.ct.getResult();
    let randCode;
    let randRegionCodeKeys = Object.keys(randRegionCode);
    if (result.documents[0].region_1depth_name === '강원도') {
      yeongdongRegions.forEach((region) => {
        if (result.documents[0].address_name.includes(region)) {
          randCode = '11D20000';
        }
      });
      randCode = randCode === '11D20000' ? randCode : '11D10000';
    } else if (result.documents[0].region_1depth_name === '광주광역시') {
      return ['11F20501', '11F20000'];
    } else {
      randRegionCodeKeys.forEach((regionCodeKey) => {
        randRegionCode[regionCodeKey].forEach((region) => {
          if (result.documents[0].address_name.includes(region)) randCode = regionCodeKey;
        });
      });
    }

    let tmpCode = regionCode.filter((item) => result.documents[0].address_name.includes(item[0])).flat()[1];
    return [tmpCode, randCode];
  }
}
