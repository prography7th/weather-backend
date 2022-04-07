import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { MiddleForecastService } from './middle-forecast.service';

describe('middle-forecast', () => {
  let middleForecastService: MiddleForecastService;
  let sampleRegionCode: string;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [MiddleForecastService],
    }).compile();

    middleForecastService = module.get<MiddleForecastService>(MiddleForecastService);
    sampleRegionCode = await middleForecastService.getRegionCode(128.8875970893, 35.88795706523);
  });

  describe('날씨 요청 데이터 포멧 함수', () => {
    it('', () => {});
  });

  describe('중기 예보 API 요청', () => {
    it('3일부터 10일까지 기온 정보 조회 정상작동', async () => {
      let result = await middleForecastService.getTempMiddleForecast(sampleRegionCode);
      expect(result).toBeDefined();
      console.log(result);
    });

    it('3일부터 10까지 육상 정보 조회 정상작동', async () => {
      let result = await middleForecastService.getRandMiddleForecast(sampleRegionCode);
      expect(result).toBeDefined();
      console.log(result);
    });
  });

  describe('좌표를 입력해서 얻은 행정구역으로 중기예보 지역코드 얻기', () => {
    it('영천시', async () => {
      let result = await middleForecastService.getRegionCode(128.8875970893, 35.88795706523);
      expect(result).toBe('11H10702');
    });
    it('안양시', async () => {
      let result = await middleForecastService.getRegionCode(126.9568209, 37.3942527);
      expect(result).toBe('11B20602');
    });
    it('서울특별시', async () => {
      let result = await middleForecastService.getRegionCode(126.986, 37.541);
      expect(result).toBe('11B10101');
    });
    it('세종특별자치시', async () => {
      let result = await middleForecastService.getRegionCode(127.2494855, 36.5040736);
      expect(result).toBe('11C20404');
    });
  });
});
