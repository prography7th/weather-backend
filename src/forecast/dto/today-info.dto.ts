import { ApiProperty } from '@nestjs/swagger';

export class MaxPop {
  @ApiProperty({ description: '최대 강수확률' })
  value: string;

  @ApiProperty({ description: '최대 강수확률에 해당하는 시간대의 첫번째 값' })
  time: string;
}

export class Report {
  @ApiProperty({ description: '최대 기온' })
  maxTmp: number;

  @ApiProperty({ description: '최소 기온' })
  minTmp: number;

  @ApiProperty({ description: '최대 강수확률' })
  maxPop: MaxPop;
}

export class Finedust {
  @ApiProperty({ description: '행정구역 이름' })
  sidoName: string;

  @ApiProperty({ description: '미세먼지' })
  pm10: string;

  @ApiProperty({ description: '초미세먼지' })
  pm25: string;
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
}

export class Day {
  @ApiProperty()
  report: Report;

  @ApiProperty({ description: '미세먼지' })
  fineDust?: Finedust;

  @ApiProperty({ description: '시간대별 날씨 정보' })
  timeline: WeatherMetadata[];
}

export class TodayInfoDto {
  @ApiProperty()
  today: Day;

  @ApiProperty()
  tomorrow: Day;

  @ApiProperty()
  tmp: Day;
}
