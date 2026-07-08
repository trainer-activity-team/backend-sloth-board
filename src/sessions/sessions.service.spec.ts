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
    declarationDate: new Date('2026-07-08T00:00:00.000Z'),
  };

  const todayDeclarationDate = new Date(
    `${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`,
  );

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

  it('assigns teacherId and normalizes date and time when creating a session', async () => {
    prisma.session.create.mockResolvedValue({ id: session.id });

    await expect(
      service.create(
        {
          title: 'Math lesson',
          date: '2026-07-01',
          start: '09:00',
          end: '10:00',
        },
        7,
      ),
    ).resolves.toEqual({ id: session.id });

    expect(prisma.session.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        teacherId: 7,
        date: new Date('2026-07-01T00:00:00.000Z'),
        start: new Date('1970-01-01T09:00:00.000Z'),
        end: new Date('1970-01-01T10:00:00.000Z'),
      }),
      select: { id: true },
    });

    const createData = prisma.session.create.mock.calls[0][0].data;
    expect(createData).not.toHaveProperty('declarationDate');
  });

  it('sets declarationDate when creating a session with a declaration reference', async () => {
    prisma.session.create.mockResolvedValue({ id: session.id });

    await service.create(
      {
        title: 'Math lesson',
        date: '2026-07-01',
        start: '09:00',
        end: '10:00',
        declarationReference: 'REF-123',
      },
      7,
    );

    expect(prisma.session.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        teacherId: 7,
        declarationReference: 'REF-123',
        declarationDate: todayDeclarationDate,
      }),
      select: { id: true },
    });
  });

  it('sets declarationDate when updating a session with a declaration reference', async () => {
    prisma.session.findUnique.mockResolvedValue(session);
    prisma.session.update.mockResolvedValue(session);

    await expect(
      service.update(1, {
        declarationReference: 'REF-456',
      }),
    ).resolves.toEqual({
      ...session,
      date: '2026-07-01',
      start: '09:00',
      end: '10:00',
      declarationDate: new Date().toISOString().slice(0, 10),
    });

    expect(prisma.session.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        declarationReference: 'REF-456',
        declarationDate: todayDeclarationDate,
      }),
    });
  });

  it('clears declarationDate when updating a session with an empty declaration reference', async () => {
    prisma.session.findUnique.mockResolvedValue(session);
    prisma.session.update.mockResolvedValue({
      ...session,
      declarationReference: null,
      declarationDate: null,
    });

    await service.update(1, {
      declarationReference: '',
    });

    expect(prisma.session.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        declarationReference: '',
        declarationDate: null,
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
      }),
    ).resolves.toEqual({
      ...session,
      date: '2026-07-01',
      start: '09:00',
      end: '10:00',
      declarationDate: '2026-07-08',
    });

    expect(prisma.session.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        date: new Date('2026-07-01T00:00:00.000Z'),
        start: new Date('1970-01-01T09:00:00.000Z'),
        end: new Date('1970-01-01T10:00:00.000Z'),
      }),
    });

    const updateData = prisma.session.update.mock.calls[0][0].data;
    expect(updateData).not.toHaveProperty('declarationDate');
  });

  it('formats date and time fields when listing sessions', async () => {
    prisma.session.findMany.mockResolvedValue([session]);

    await expect(service.findAll()).resolves.toEqual([
      {
        ...session,
        date: '2026-07-01',
        start: '09:00',
        end: '10:00',
        declarationDate: '2026-07-08',
      },
    ]);
  });
});
