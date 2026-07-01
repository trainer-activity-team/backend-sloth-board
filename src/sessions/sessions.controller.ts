import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  FormattedSession,
  FormattedSessionWithRelations,
  SessionsService,
} from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@ApiTags('sessions')
@ApiBearerAuth('JWT')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a session' })
  @ApiCreatedResponse({ description: 'Created session' })
  create(@Body() createSessionDto: CreateSessionDto): Promise<FormattedSession> {
    return this.sessionsService.create(createSessionDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all sessions' })
  @ApiOkResponse({ description: 'List of sessions with relations' })
  findAll(): Promise<FormattedSessionWithRelations[]> {
    return this.sessionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a session by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Session with relations' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<FormattedSessionWithRelations> {
    return this.sessionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a session' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Updated session' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSessionDto: UpdateSessionDto,
  ): Promise<FormattedSession> {
    return this.sessionsService.update(id, updateSessionDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a session' })
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse({ description: 'Session deleted' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.sessionsService.remove(id);
  }
}
