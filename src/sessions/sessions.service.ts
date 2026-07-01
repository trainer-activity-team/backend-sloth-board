import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Session } from '../generated/prisma/client';
import {
  formatDateOnly,
  formatTimeOnly,
  toPrismaDate,
  toPrismaTime,
} from '../common/date-format';
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
type FormattedSession<T extends Session = Session> = Omit<
  T,
  'date' | 'start' | 'end' | 'declarationDate'
> & {
  date: string;
  start: string;
  end: string;
  declarationDate: string | null;
};

export type FormattedSessionWithRelations = FormattedSession<SessionWithRelations>;
export type { FormattedSession };

function normalizeSessionCreateData(
  createSessionDto: CreateSessionDto,
): Prisma.SessionUncheckedCreateInput {
  return {
    ...createSessionDto,
    date: toPrismaDate(createSessionDto.date),
    start: toPrismaTime(createSessionDto.start),
    end: toPrismaTime(createSessionDto.end),
    ...(createSessionDto.declarationDate && {
      declarationDate: toPrismaDate(createSessionDto.declarationDate),
    }),
  };
}

function normalizeSessionUpdateData(
  updateSessionDto: UpdateSessionDto,
): Prisma.SessionUncheckedUpdateInput {
  return {
    ...updateSessionDto,
    ...(updateSessionDto.date && {
      date: toPrismaDate(updateSessionDto.date),
    }),
    ...(updateSessionDto.start && {
      start: toPrismaTime(updateSessionDto.start),
    }),
    ...(updateSessionDto.end && {
      end: toPrismaTime(updateSessionDto.end),
    }),
    ...(updateSessionDto.declarationDate && {
      declarationDate: toPrismaDate(updateSessionDto.declarationDate),
    }),
  };
}

function formatSession<T extends Session>(session: T): FormattedSession<T> {
  return {
    ...session,
    date: formatDateOnly(session.date),
    start: formatTimeOnly(session.start),
    end: formatTimeOnly(session.end),
    declarationDate: formatDateOnly(session.declarationDate),
  };
}

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSessionDto: CreateSessionDto): Promise<FormattedSession> {
    try {
      const session = await this.prisma.session.create({
        data: normalizeSessionCreateData(createSessionDto),
      });

      return formatSession(session);
    } catch (error) {
      if (isForeignKeyConstraintError(error)) {
        throw new BadRequestException('Invalid session relation id');
      }
      throw new InternalServerErrorException('Failed to create session', {
        cause: error,
      });
    }
  }

  async findAll(): Promise<FormattedSessionWithRelations[]> {
    try {
      const sessions = await this.prisma.session.findMany({ include: sessionInclude });
      return sessions.map(formatSession);
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch sessions', {
        cause: error,
      });
    }
  }

  async findOne(id: number): Promise<FormattedSessionWithRelations> {
    try {
      const session = await this.prisma.session.findUnique({
        where: { id },
        include: sessionInclude,
      });

      if (!session) {
        throw new NotFoundException(`Session #${id} not found`);
      }

      return formatSession(session);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch session', {
        cause: error,
      });
    }
  }

  async update(id: number, updateSessionDto: UpdateSessionDto): Promise<FormattedSession> {
    await this.findOne(id);

    try {
      const session = await this.prisma.session.update({
        where: { id },
        data: normalizeSessionUpdateData(updateSessionDto),
      });

      return formatSession(session);
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
