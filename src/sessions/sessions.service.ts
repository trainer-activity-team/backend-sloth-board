import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Session } from '../generated/prisma/client';
import {
  isForeignKeyConstraintError,
  isPrismaNotFoundError,
} from '../common/prisma-errors';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

const sessionInclude = {
  class: {
    select: { id: true, name: true, classLevel: true },
  },
  contract: {
    select: { id: true, contractNumber: true },
  },
  sessionType: {
    select: { id: true, name: true },
  },
  statusRelation: {
    select: { id: true, name: true },
  },
  timescale: {
    select: { id: true, name: true },
  },
  user: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
} satisfies Prisma.SessionInclude;

type SessionWithRelations = Prisma.SessionGetPayload<{ include: typeof sessionInclude }>;

export type { SessionWithRelations };

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    try {
      return await this.prisma.session.create({
        data: createSessionDto,
      });
    } catch (error) {
      if (isForeignKeyConstraintError(error)) {
        throw new BadRequestException('Invalid session relation id');
      }
      throw new InternalServerErrorException('Failed to create session', {
        cause: error,
      });
    }
  }

  async findAll(): Promise<SessionWithRelations[]> {
    try {
      return await this.prisma.session.findMany({ include: sessionInclude });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch sessions', {
        cause: error,
      });
    }
  }

  async findOne(id: number): Promise<SessionWithRelations> {
    try {
      const session = await this.prisma.session.findUnique({
        where: { id },
        include: sessionInclude,
      });

      if (!session) {
        throw new NotFoundException(`Session #${id} not found`);
      }

      return session;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch session', {
        cause: error,
      });
    }
  }

  async update(id: number, updateSessionDto: UpdateSessionDto): Promise<Session> {
    await this.findOne(id);

    try {
      return await this.prisma.session.update({
        where: { id },
        data: updateSessionDto,
      });
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException(`Session #${id} not found`);
      }
      if (isForeignKeyConstraintError(error)) {
        throw new BadRequestException('Invalid session relation id');
      }
      throw new InternalServerErrorException('Failed to update session', {
        cause: error,
      });
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    try {
      await this.prisma.session.delete({ where: { id } });
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException(`Session #${id} not found`);
      }
      throw new InternalServerErrorException('Failed to delete session', {
        cause: error,
      });
    }
  }
}
