import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Contract, Prisma } from '../generated/prisma/client';
import { formatDateOnly, toPrismaDate } from '../common/date-format';
import {
  isForeignKeyConstraintError,
  isPrismaNotFoundError,
} from '../common/prisma-errors';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

const contractInclude = {
  institution: {
    select: { id: true, name: true },
  },
  pricingMode: {
    select: { id: true, name: true },
  },
} satisfies Prisma.ContractInclude;

type ContractWithRelations = Prisma.ContractGetPayload<{ include: typeof contractInclude }>;
type FormattedContract<T extends Contract = Contract> = Omit<T, 'startDate' | 'endDate'> & {
  startDate: string;
  endDate: string;
};

export type FormattedContractWithRelations = FormattedContract<ContractWithRelations>;
export type { FormattedContract };

function normalizeContractCreateData(
  createContractDto: CreateContractDto,
): Prisma.ContractUncheckedCreateInput {
  return {
    ...createContractDto,
    startDate: toPrismaDate(createContractDto.startDate),
    endDate: toPrismaDate(createContractDto.endDate),
  };
}

function normalizeContractUpdateData(
  updateContractDto: UpdateContractDto,
): Prisma.ContractUncheckedUpdateInput {
  return {
    ...updateContractDto,
    ...(updateContractDto.startDate && {
      startDate: toPrismaDate(updateContractDto.startDate),
    }),
    ...(updateContractDto.endDate && {
      endDate: toPrismaDate(updateContractDto.endDate),
    }),
  };
}

function formatContract<T extends Contract>(contract: T): FormattedContract<T> {
  return {
    ...contract,
    startDate: formatDateOnly(contract.startDate),
    endDate: formatDateOnly(contract.endDate),
  };
}

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createContractDto: CreateContractDto): Promise<FormattedContract<Contract>> {
    try {
      const contract = await this.prisma.contract.create({
        data: normalizeContractCreateData(createContractDto),
      });

      return formatContract(contract);
    } catch (error) {
      if (isForeignKeyConstraintError(error)) {
        throw new BadRequestException('Invalid institutionId or pricingModeId');
      }
      throw new InternalServerErrorException('Failed to create contract', {
        cause: error,
      });
    }
  }

  async findAll(): Promise<FormattedContractWithRelations[]> {
    try {
      const contracts = await this.prisma.contract.findMany({ include: contractInclude });
      return contracts.map(formatContract);
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch contracts', {
        cause: error,
      });
    }
  }

  async findOne(id: number): Promise<FormattedContractWithRelations> {
    try {
      const contract = await this.prisma.contract.findUnique({
        where: { id },
        include: contractInclude,
      });

      if (!contract) {
        throw new NotFoundException(`Contract #${id} not found`);
      }

      return formatContract(contract);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch contract', {
        cause: error,
      });
    }
  }

  async update(
    id: number,
    updateContractDto: UpdateContractDto,
  ): Promise<FormattedContract<Contract>> {
    await this.findOne(id);

    try {
      const contract = await this.prisma.contract.update({
        where: { id },
        data: normalizeContractUpdateData(updateContractDto),
      });

      return formatContract(contract);
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException(`Contract #${id} not found`);
      }
      if (isForeignKeyConstraintError(error)) {
        throw new BadRequestException('Invalid institutionId or pricingModeId');
      }
      throw new InternalServerErrorException('Failed to update contract', {
        cause: error,
      });
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    try {
      await this.prisma.contract.delete({ where: { id } });
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException(`Contract #${id} not found`);
      }
      if (isForeignKeyConstraintError(error)) {
        throw new ConflictException('Cannot delete contract with related sessions');
      }
      throw new InternalServerErrorException('Failed to delete contract', {
        cause: error,
      });
    }
  }
}
