import { Test, TestingModule } from '@nestjs/testing';
import { TimescaleController } from './timescale.controller';
import { TimescaleService } from './timescale.service';

describe('TimescaleController', () => {
  let controller: TimescaleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimescaleController],
      providers: [
        {
          provide: TimescaleService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TimescaleController>(TimescaleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
