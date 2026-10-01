import { Module } from '@nestjs/common';
import { DashboardQuery } from './application/ports/dashboard-query.js';
import { GetDashboardUseCase } from './application/use-cases/get-dashboard.use-case.js';
import { PrismaDashboardQuery } from './infrastructure/prisma-dashboard.query.js';
import { DashboardController } from './presentation/controllers/dashboard.controller.js';

@Module({
    controllers: [DashboardController],
    providers: [{ provide: DashboardQuery, useClass: PrismaDashboardQuery }, GetDashboardUseCase],
})
export class DashboardModule {}
