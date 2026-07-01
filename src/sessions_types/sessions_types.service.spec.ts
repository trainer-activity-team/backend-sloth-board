import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { SessionsTypesService } from './sessions_types.service';

describe('SessionsTypesService', () => {
  let service: SessionsTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsTypesService,
        {
          provide: PrismaService,
          useValue: {
            sessionType: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SessionsTypesService>(SessionsTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
