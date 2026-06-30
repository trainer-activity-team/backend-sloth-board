import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { SessionType } from '../generated/prisma/client';
import { SessionsTypesService } from './sessions_types.service';

@ApiTags('sessions-types')
@ApiBearerAuth('JWT')
@Controller('sessions-types')
export class SessionsTypesController {
  constructor(private readonly sessionsTypesService: SessionsTypesService) {}

  @Get()
  @ApiOperation({ summary: 'List all session types' })
  @ApiOkResponse({ description: 'List of session types' })
  findAll(): Promise<SessionType[]> {
    return this.sessionsTypesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a session type by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Session type' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<SessionType> {
    return this.sessionsTypesService.findOne(id);
  }
}
