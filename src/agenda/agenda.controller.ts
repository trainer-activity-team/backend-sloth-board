import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AgendaService, FormattedAgendaSession } from './agenda.service';

@ApiTags('agenda')
@ApiBearerAuth('JWT')
@Controller('agenda')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Get('sessions')
  @ApiOperation({ summary: 'List all agenda sessions' })
  @ApiOkResponse({ description: 'List of sessions with relations' })
  findSessions(): Promise<FormattedAgendaSession[]> {
    return this.agendaService.findSessions();
  }

  @Get('sessions/date')
  @ApiOperation({ summary: 'List agenda sessions by date' })
  @ApiQuery({
    name: 'date',
    example: '2026-07-01',
    description: 'Session date in YYYY-MM-DD format',
  })
  @ApiOkResponse({ description: 'List of sessions for the requested date' })
  findSessionsByDate(@Query('date') date: string): Promise<FormattedAgendaSession[]> {
    return this.agendaService.findSessionsByDate(date);
  }
}
