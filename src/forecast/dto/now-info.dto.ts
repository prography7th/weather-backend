import { ApiProperty } from '@nestjs/swagger';

export class NowInfoDto {
  @ApiProperty({ example: '0300' })
  time: string;

  @ApiProperty({ description: '하늘상태(SKY)코드: 맑음(1), 구름많음(3), 흐림(4)', example: '1' })
  sky: string;

  @ApiProperty({ description: '기온', example: '9' })
  tmp: string;

  @ApiProperty({
    description: '강수형태(PTY)코드: (NOW) 없음(0), 비(1), 비/눈(2), 눈(3), 빗방울(5), 빗방울눈날림(6), 눈날림(7)',
    example: '0',
  })
  pty: string;
}
