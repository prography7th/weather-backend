import { Controller, Get } from '@nestjs/common';
import { BatchService } from './batch.service';

@Controller('batch')
export class BatchController {
  constructor(private batchService: BatchService) {}

  @Get()
  requestToFCM() {
    return this.batchService.requestToFCM('우산 챙기세요', ['토큰1', '토큰2']);
  }
}
