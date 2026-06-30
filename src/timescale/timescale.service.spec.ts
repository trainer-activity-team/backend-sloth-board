import { Test, TestingModule } from '@nestjs/testing';
import { TimescaleService } from './timescale.service';

describe('TimescaleService', () => {
  let service: TimescaleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimescaleService],
    }).compile();

    service = module.get<TimescaleService>(TimescaleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
