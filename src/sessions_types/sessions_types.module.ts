import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SessionsTypesService } from './sessions_types.service';
import { SessionsTypesController } from './sessions_types.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SessionsTypesController],
  providers: [SessionsTypesService],
})
export class SessionsTypesModule {}
