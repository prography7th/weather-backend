import { ApiProperty } from '@nestjs/swagger';

export class NowInfoDto {
  @ApiProperty({ example: '1400' })
  time: string;

  @ApiProperty({ description: '하늘상태(SKY)코드: 맑음(1), 구름많음(3), 흐림(4)', example: '3' })
  sky: string;

  @ApiProperty({ description: '기온', example: '27' })
  tmp: string;
}
