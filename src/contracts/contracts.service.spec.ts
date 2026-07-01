import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ContractsService } from './contracts.service';

describe('ContractsService', () => {
  let service: ContractsService;
  let prisma: {
    contract: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      contract: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ContractsService>(ContractsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('normalizes date-only strings when creating a contract', async () => {
    const createdContract = { id: 1 };
    prisma.contract.create.mockResolvedValue(createdContract);

    await expect(
      service.create({
        institutionId: 1,
        pricingModeId: 1,
        contractNumber: 'CTR-2026-001',
        startDate: '2026-09-01',
        endDate: '2027-06-30',
        hourlyVolumePlanned: 120.5,
        unitPrice: 45,
      }),
    ).resolves.toBe(createdContract);

    expect(prisma.contract.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        startDate: new Date('2026-09-01T00:00:00.000Z'),
        endDate: new Date('2027-06-30T00:00:00.000Z'),
      }),
    });
  });

  it('normalizes date-only strings when updating a contract', async () => {
    prisma.contract.findUnique.mockResolvedValue({ id: 1 });
    const updatedContract = { id: 1 };
    prisma.contract.update.mockResolvedValue(updatedContract);

    await expect(
      service.update(1, {
        startDate: '2026-09-01',
        endDate: '2027-06-30',
      }),
    ).resolves.toBe(updatedContract);

    expect(prisma.contract.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        startDate: new Date('2026-09-01T00:00:00.000Z'),
        endDate: new Date('2027-06-30T00:00:00.000Z'),
      }),
    });
  });
});
