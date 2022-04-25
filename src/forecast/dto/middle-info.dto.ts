import { ApiProperty } from '@nestjs/swagger';

export class HalfOfDay {
  @ApiProperty({ description: '강수확률' })
  precipitation: number;

  @ApiProperty({ description: '하늘상태' })
  weather: string;
}

export class Day {
  @ApiProperty()
  day: string;

  @ApiProperty()
  tmpMin: number;

  @ApiProperty()
  tmpMax: number;

  @ApiProperty()
  am: HalfOfDay;

  @ApiProperty()
  pm: HalfOfDay;
}

export class MiddleInfoDto {
  @ApiProperty({ description: '요청 요일' })
  requestDay: string;

  @ApiProperty()
  informations: Day[];
}
