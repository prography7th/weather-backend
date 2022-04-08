import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { MiddleForecastService } from './middle-forecast.service';

describe('middle-forecast', () => {
  let middleForecastService: MiddleForecastService;
  let sampleRegionCode: string[];
  let sampleDate: string;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [MiddleForecastService],
    }).compile();

    middleForecastService = module.get<MiddleForecastService>(MiddleForecastService);
    sampleRegionCode = await middleForecastService.getRegionCode(127.0275833, 37.4979278);
    sampleDate = middleForecastService.makeDateFormat(new Date());
  });

  describe('날씨 요청 데이터 포멧 함수', () => {
    it('6시 이전에 요청시 전날 18시 반환', async () => {
      let result = middleForecastService.makeDateFormat(new Date(2022, 3, 8, 5));
      expect(result).toBe('202204071800');
    });

    it('6시 이후에 요청시 당일 6시 반환', async () => {
      let result = middleForecastService.makeDateFormat(new Date(2022, 3, 8, 7));
      expect(result).toBe('202204080600');
    });
    it('18시 이후에 요청시 당일 18시 반환', async () => {
      let result = middleForecastService.makeDateFormat(new Date(2022, 3, 7, 19));
      expect(result).toBe('202204071800');
    });
  });

  describe('중기 예보 API 요청', () => {
    it('', async () => {
      let result = await middleForecastService.getMiddleForecastInformation(127.0275833, 37.4979278);
      //console.log(result);
    });

    it('3일부터 10일까지 기온 정보 조회 정상작동', async () => {
      let result = await middleForecastService.getTempMiddleForecast(sampleRegionCode[0], sampleDate);
      expect(result).toBeDefined();
    });

    it('3일부터 10까지 육상 정보 조회 정상작동', async () => {
      let result = await middleForecastService.getRandMiddleForecast(sampleRegionCode[1], sampleDate);
      expect(result).toBeDefined();
    });
  });

  describe('좌표를 입력해서 얻은 행정구역으로 중기예보 지역코드 얻기', () => {
    it('영천시', async () => {
      let result = await middleForecastService.getRegionCode(128.8875970893, 35.88795706523);
      expect(result).toStrictEqual(['11H10702', '11H10000']);
    });
    it('안양시', async () => {
      let result = await middleForecastService.getRegionCode(126.9568209, 37.3942527);
      expect(result).toStrictEqual(['11B20602', '11B00000']);
    });
    it('서울특별시', async () => {
      let result = await middleForecastService.getRegionCode(126.986, 37.541);
      expect(result).toStrictEqual(['11B10101', '11B00000']);
    });
    it('세종특별자치시', async () => {
      let result = await middleForecastService.getRegionCode(127.2494855, 36.5040736);
      expect(result).toStrictEqual(['11C20404', '11C20000']);
    });

    describe('광주광역시 경기도 광주 판별', () => {
      it('광주광역시', async () => {
        let result = await middleForecastService.getRegionCode(126.8526012, 35.1595454);
        expect(result).toStrictEqual(['11F20501', '11F20000']);
      });
      it('경기도 광주', async () => {
        let result = await middleForecastService.getRegionCode(127.2526508, 37.399198);
        expect(result).toStrictEqual(['11B20702', '11B00000']);
      });
    });

    describe('강원도 영동지방 영서지방 판별', () => {
      it('강릉시(영동)', async () => {
        let result = await middleForecastService.getRegionCode(128.8760574, 37.751853);
        expect(result).toStrictEqual(['11D20501', '11D20000']);
      });
      it('원주시(영서)', async () => {
        let result = await middleForecastService.getRegionCode(127.9201621, 37.3422186);
        expect(result).toStrictEqual(['11D10401', '11D10000']);
      });
    });
  });
});
