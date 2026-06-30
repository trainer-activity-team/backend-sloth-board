import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Contract, Prisma } from '../generated/prisma/client';
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

export type { ContractWithRelations };

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createContractDto: CreateContractDto): Promise<Contract> {
    try {
      return await this.prisma.contract.create({
        data: createContractDto,
      });
    } catch (error) {
      if (isForeignKeyConstraintError(error)) {
        throw new BadRequestException('Invalid institutionId or pricingModeId');
      }
      throw new InternalServerErrorException('Failed to create contract', {
        cause: error,
      });
    }
  }

  async findAll(): Promise<ContractWithRelations[]> {
    try {
      return await this.prisma.contract.findMany({ include: contractInclude });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch contracts', {
        cause: error,
      });
    }
  }

  async findOne(id: number): Promise<ContractWithRelations> {
    try {
      const contract = await this.prisma.contract.findUnique({
        where: { id },
        include: contractInclude,
      });

      if (!contract) {
        throw new NotFoundException(`Contract #${id} not found`);
      }

      return contract;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch contract', {
        cause: error,
      });
    }
  }

  async update(id: number, updateContractDto: UpdateContractDto): Promise<Contract> {
    await this.findOne(id);

    try {
      return await this.prisma.contract.update({
        where: { id },
        data: updateContractDto,
      });
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
