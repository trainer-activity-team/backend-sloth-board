import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { SessionsService } from './sessions.service';

describe('SessionsService', () => {
  let service: SessionsService;
  let prisma: {
    session: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const session = {
    id: 1,
    title: 'Math lesson',
    date: new Date('2026-07-01T00:00:00.000Z'),
    start: new Date('1970-01-01T09:00:00.000Z'),
    end: new Date('1970-01-01T10:00:00.000Z'),
    declarationDate: new Date('2026-07-02T00:00:00.000Z'),
  };

  beforeEach(async () => {
    prisma = {
      session: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('normalizes date and time strings when creating a session', async () => {
    prisma.session.create.mockResolvedValue(session);

    await expect(
      service.create({
        title: 'Math lesson',
        date: '2026-07-01',
        start: '09:00',
        end: '10:00',
        declarationDate: '2026-07-02',
      }),
    ).resolves.toEqual({
      ...session,
      date: '2026-07-01',
      start: '09:00',
      end: '10:00',
      declarationDate: '2026-07-02',
    });

    expect(prisma.session.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        date: new Date('2026-07-01T00:00:00.000Z'),
        start: new Date('1970-01-01T09:00:00.000Z'),
        end: new Date('1970-01-01T10:00:00.000Z'),
        declarationDate: new Date('2026-07-02T00:00:00.000Z'),
      }),
    });
  });

  it('normalizes date and time strings when updating a session', async () => {
    prisma.session.findUnique.mockResolvedValue(session);
    prisma.session.update.mockResolvedValue(session);

    await expect(
      service.update(1, {
        date: '2026-07-01',
        start: '09:00',
        end: '10:00',
        declarationDate: '2026-07-02',
      }),
    ).resolves.toEqual({
      ...session,
      date: '2026-07-01',
      start: '09:00',
      end: '10:00',
      declarationDate: '2026-07-02',
    });

    expect(prisma.session.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        date: new Date('2026-07-01T00:00:00.000Z'),
        start: new Date('1970-01-01T09:00:00.000Z'),
        end: new Date('1970-01-01T10:00:00.000Z'),
        declarationDate: new Date('2026-07-02T00:00:00.000Z'),
      }),
    });
  });

  it('formats date and time fields when listing sessions', async () => {
    prisma.session.findMany.mockResolvedValue([session]);

    await expect(service.findAll()).resolves.toEqual([
      {
        ...session,
        date: '2026-07-01',
        start: '09:00',
        end: '10:00',
        declarationDate: '2026-07-02',
      },
    ]);
  });
});
