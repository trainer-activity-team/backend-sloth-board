import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const agendaSessionInclude = {
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

type AgendaSession = Prisma.SessionGetPayload<{
  include: typeof agendaSessionInclude;
}>;

export type { AgendaSession };

@Injectable()
export class AgendaService {
  constructor(private readonly prisma: PrismaService) {}

  async findSessions(): Promise<AgendaSession[]> {
    try {
      return await this.prisma.session.findMany({
        include: agendaSessionInclude,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch agenda sessions', {
        cause: error,
      });
    }
  }

  async findSessionsByDate(date: string): Promise<AgendaSession[]> {
    const { startOfDay, startOfNextDay } = this.parseSessionDate(date);

    try {
      return await this.prisma.session.findMany({
        where: {
          date: {
            gte: startOfDay,
            lt: startOfNextDay,
          },
        },
        include: agendaSessionInclude,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch agenda sessions by date',
        { cause: error },
      );
    }
  }

  private parseSessionDate(date: string): {
    startOfDay: Date;
    startOfNextDay: Date;
  } {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('Date must use YYYY-MM-DD format');
    }

    const startOfDay = new Date(`${date}T00:00:00.000Z`);

    if (
      Number.isNaN(startOfDay.getTime()) ||
      startOfDay.toISOString().slice(0, 10) !== date
    ) {
      throw new BadRequestException('Date must be a valid calendar date');
    }

    const startOfNextDay = new Date(startOfDay);
    startOfNextDay.setUTCDate(startOfDay.getUTCDate() + 1);

    return { startOfDay, startOfNextDay };
  }
}
