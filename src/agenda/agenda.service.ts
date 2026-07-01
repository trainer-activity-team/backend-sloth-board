import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import {
  formatDateOnly,
  formatTimeOnly,
  toPrismaDate,
} from '../common/date-format';
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
type FormattedAgendaSession = Omit<
  AgendaSession,
  'date' | 'start' | 'end' | 'declarationDate'
> & {
  date: string;
  start: string;
  end: string;
  declarationDate: string | null;
};

export type { FormattedAgendaSession };

function formatAgendaSession(session: AgendaSession): FormattedAgendaSession {
  return {
    ...session,
    date: formatDateOnly(session.date),
    start: formatTimeOnly(session.start),
    end: formatTimeOnly(session.end),
    declarationDate: formatDateOnly(session.declarationDate),
  };
}

@Injectable()
export class AgendaService {
  constructor(private readonly prisma: PrismaService) {}

  async findSessions(): Promise<FormattedAgendaSession[]> {
    try {
      const sessions = await this.prisma.session.findMany({
        include: agendaSessionInclude,
      });

      return sessions.map(formatAgendaSession);
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch agenda sessions', {
        cause: error,
      });
    }
  }

  async findSessionsByDate(date: string): Promise<FormattedAgendaSession[]> {
    const { startOfDay, startOfNextDay } = this.parseSessionDate(date);

    try {
      const sessions = await this.prisma.session.findMany({
        where: {
          date: {
            gte: startOfDay,
            lt: startOfNextDay,
          },
        },
        include: agendaSessionInclude,
      });

      return sessions.map(formatAgendaSession);
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
    const startOfDay = toPrismaDate(date);
    const startOfNextDay = new Date(startOfDay);
    startOfNextDay.setUTCDate(startOfDay.getUTCDate() + 1);

    return { startOfDay, startOfNextDay };
  }
}
