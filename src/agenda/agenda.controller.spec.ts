import { Test, TestingModule } from '@nestjs/testing';
import { AgendaController } from './agenda.controller';
import { AgendaService } from './agenda.service';

describe('AgendaController', () => {
  let controller: AgendaController;
  let agendaService: {
    findSessions: jest.Mock;
    findSessionsByDate: jest.Mock;
  };

  const sessions = [{ id: 1, title: 'Math lesson' }];

  beforeEach(async () => {
    agendaService = {
      findSessions: jest.fn(),
      findSessionsByDate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgendaController],
      providers: [
        {
          provide: AgendaService,
          useValue: agendaService,
        },
      ],
    }).compile();

    controller = module.get<AgendaController>(AgendaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list agenda sessions', async () => {
    agendaService.findSessions.mockResolvedValue(sessions);

    await expect(controller.findSessions()).resolves.toEqual(sessions);
    expect(agendaService.findSessions).toHaveBeenCalledTimes(1);
  });

  it('should list agenda sessions by date', async () => {
    agendaService.findSessionsByDate.mockResolvedValue(sessions);

    await expect(controller.findSessionsByDate('2026-07-01')).resolves.toEqual(
      sessions,
    );
    expect(agendaService.findSessionsByDate).toHaveBeenCalledWith('2026-07-01');
  });
});
