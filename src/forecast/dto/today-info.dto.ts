import { ApiProperty } from '@nestjs/swagger';

export class MaxPop {
  @ApiProperty({ description: '최대 강수확률', example: '60' })
  value: string;

  @ApiProperty({
    description: '최대 강수확률에 해당하는 시간대의 첫번째 값 (강수확률 모두 0일 경우: all)',
    example: '0300',
  })
  time: string;
}

export class FineDust {
  @ApiProperty({ description: '행정구역 이름', example: '서울' })
  sidoName: string;

  @ApiProperty({ description: '미세먼지', example: '보통' })
  pm10: string;

  @ApiProperty({ description: '초미세먼지', example: '보통' })
  pm25: string;
}

export class Report {
  @ApiProperty({ description: '최대 기온', example: 26, required: false })
  maxTmp?: number;

  @ApiProperty({ description: '최소 기온', example: 17, required: false })
  minTmp?: number;

  @ApiProperty({ description: '최대 강수확률', required: false })
  maxPop?: MaxPop;

  @ApiProperty({ description: '미세먼지', required: false })
  fineDust?: FineDust;
}

export class WeatherMetadata {
  @ApiProperty()
  date: string;

  @ApiProperty()
  time: string;

  @ApiProperty({ description: '하늘상태(SKY)코드: 맑음(1), 구름많음(3), 흐림(4)' })
  sky: string;

  @ApiProperty({ description: '기온' })
  tmp: string;

  @ApiProperty({ description: '강수확률' })
  pop: string;

  @ApiProperty({ description: '강수형태(PTY)코드: (TODAY) 없음(0), 비(1), 비/눈(2), 눈(3), 소나기(4)' })
  pty: string;
}

export class TDay {
  @ApiProperty()
  report: Report;

  @ApiProperty({
    description: '시간대별 날씨 정보',
    example: [
      {
        date: '20220426',
        time: '0300',
        sky: '1',
        tmp: '9',
        pop: '0',
        pty: '0',
      },
    ],
  })
  timeline: WeatherMetadata[];
}

export class TodayInfoDto {
  @ApiProperty()
  today: TDay;

  @ApiProperty()
  tomorrow: TDay;

  @ApiProperty()
  afterTomorrow: TDay;
}
