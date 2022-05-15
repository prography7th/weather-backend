import { Controller, Get } from '@nestjs/common';
import { AlarmService } from './alarm.service';

@Controller('alarm')
export class AlarmController {
  constructor(private alarmService: AlarmService) {}

  @Get()
  requestToFCM() {
    return this.alarmService.requestToFCM('우산 챙기세요', ['토큰1', '토큰2']);
  }
}
