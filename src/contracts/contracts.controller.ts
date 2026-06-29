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
import { Contract } from '../generated/prisma/client';
import { ContractsService, ContractWithRelations } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@ApiTags('contracts')
@ApiBearerAuth('JWT')
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a contract' })
  @ApiCreatedResponse({ description: 'Created contract' })
  create(@Body() createContractDto: CreateContractDto): Promise<Contract> {
    return this.contractsService.create(createContractDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all contracts' })
  @ApiOkResponse({ description: 'List of contracts with relations' })
  findAll(): Promise<ContractWithRelations[]> {
    return this.contractsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contract by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Contract with relations' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ContractWithRelations> {
    return this.contractsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contract' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Updated contract' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContractDto: UpdateContractDto,
  ): Promise<Contract> {
    return this.contractsService.update(id, updateContractDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a contract' })
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse({ description: 'Contract deleted' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.contractsService.remove(id);
  }
}
