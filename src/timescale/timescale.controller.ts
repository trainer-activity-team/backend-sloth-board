import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Timescale } from '../generated/prisma/client';
import { TimescaleService } from './timescale.service';

@ApiTags('timescale')
@ApiBearerAuth('JWT')
@Controller('timescale')
export class TimescaleController {
  constructor(private readonly timescaleService: TimescaleService) {}

  @Get()
  @ApiOperation({ summary: 'List all timescales' })
  @ApiOkResponse({ description: 'List of timescales' })
  findAll(): Promise<Timescale[]> {
    return this.timescaleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a timescale by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Timescale' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Timescale> {
    return this.timescaleService.findOne(id);
  }
}
