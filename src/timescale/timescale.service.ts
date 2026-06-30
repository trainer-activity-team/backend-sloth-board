import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Timescale } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimescaleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Timescale[]> {
    try {
      return await this.prisma.timescale.findMany();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch timescales', {
        cause: error,
      });
    }
  }

  async findOne(id: number): Promise<Timescale> {
    try {
      const timescale = await this.prisma.timescale.findUnique({
        where: { id },
      });

      if (!timescale) {
        throw new NotFoundException(`Timescale #${id} not found`);
      }

      return timescale;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch timescale', {
        cause: error,
      });
    }
  }
}
