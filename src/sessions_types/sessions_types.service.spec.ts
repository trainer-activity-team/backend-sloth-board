import { Test, TestingModule } from '@nestjs/testing';
import { SessionsTypesService } from './sessions_types.service';

describe('SessionsTypesService', () => {
  let service: SessionsTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionsTypesService],
    }).compile();

    service = module.get<SessionsTypesService>(SessionsTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
