import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator.js';
import { Dashboard } from '../../application/dashboard.read-model.js';
import { GetDashboardUseCase } from '../../application/use-cases/get-dashboard.use-case.js';

/** Qualquer usuário autenticado; o que cada papel enxerga é decidido no caso de uso. */
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly getDashboard: GetDashboardUseCase) {}

    @Get()
    get(@CurrentUser() user: CurrentUser): Promise<Dashboard> {
        return this.getDashboard.execute({ requesterRole: user.role });
    }
}
