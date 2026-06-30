import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PrismaModule } from './prisma/prisma.module';
import { ClassesModule } from './classes/classes.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { UsersModule } from './users/users.module';
import { ContractsModule } from './contracts/contracts.module';
import { PricingModeModule } from './pricing-mode/pricing-mode.module';
import { SessionsModule } from './sessions/sessions.module';
import { SessionsTypesModule } from './sessions_types/sessions_types.module';
import { TimescaleModule } from './timescale/timescale.module';

@Module({
  imports: [PrismaModule, AuthModule, ClassesModule, InstitutionsModule, UsersModule, ContractsModule, PricingModeModule, SessionsModule, SessionsTypesModule, TimescaleModule],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
