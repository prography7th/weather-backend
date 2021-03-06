import { ApiProperty } from '@nestjs/swagger';

export class HalfOfMDay {
  @ApiProperty({ description: '강수확률' })
  precipitation: number;

  @ApiProperty({ description: '하늘상태' })
  weather: string;
}

export class MDay {
  @ApiProperty()
  day: string;

  @ApiProperty()
  tmpMin: number;

  @ApiProperty()
  tmpMax: number;

  @ApiProperty()
  am: HalfOfMDay;

  @ApiProperty()
  pm: HalfOfMDay;
}

export class MiddleInfoDto {
  @ApiProperty({ description: '요청 요일', example: '화요일' })
  requestDay: string;

  @ApiProperty({
    example: [
      {
        day: '화요일',
        tmpMin: 17,
        tmpMax: 26,
        am: {
          precipitation: 60,
          weather: '맑음',
        },
        pm: {
          precipitation: 0,
          weather: '맑음',
        },
      },
    ],
  })
  informations: MDay[];
}
