import { PartialType } from '@nestjs/swagger';
import { CreateTimescaleDto } from './create-timescale.dto';

export class UpdateTimescaleDto extends PartialType(CreateTimescaleDto) {}
