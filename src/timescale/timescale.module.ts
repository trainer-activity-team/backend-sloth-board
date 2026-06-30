import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TimescaleService } from './timescale.service';
import { TimescaleController } from './timescale.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TimescaleController],
  providers: [TimescaleService],
})
export class TimescaleModule {}
