import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SessionType } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionsTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<SessionType[]> {
    try {
      return await this.prisma.sessionType.findMany();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch session types', {
        cause: error,
      });
    }
  }

  async findOne(id: number): Promise<SessionType> {
    try {
      const sessionType = await this.prisma.sessionType.findUnique({
        where: { id },
      });

      if (!sessionType) {
        throw new NotFoundException(`Session type #${id} not found`);
      }

      return sessionType;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch session type', {
        cause: error,
      });
    }
  }
}
