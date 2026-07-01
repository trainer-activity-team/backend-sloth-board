import { Test, TestingModule } from '@nestjs/testing';
import { SessionsTypesController } from './sessions_types.controller';
import { SessionsTypesService } from './sessions_types.service';

describe('SessionsTypesController', () => {
  let controller: SessionsTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionsTypesController],
      providers: [
        {
          provide: SessionsTypesService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SessionsTypesController>(SessionsTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
