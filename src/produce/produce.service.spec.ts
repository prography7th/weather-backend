import { Test, TestingModule } from '@nestjs/testing';
import { ProduceService } from './produce.service';

describe('ProduceService', () => {
  let service: ProduceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [ProduceService],
    }).compile();

    service = module.get<ProduceService>(ProduceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sqs 테스트', () => {});
});
