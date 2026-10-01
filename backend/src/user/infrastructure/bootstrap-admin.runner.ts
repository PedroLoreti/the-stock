import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { optionalEnv } from '../../shared/infrastructure/config/env.js';
import { BootstrapAdminUseCase } from '../application/use-cases/bootstrap-admin.use-case.js';

/**
 * Roda uma vez a cada boot. Se o sistema ainda não tem usuários, cria o admin inicial
 * a partir das variáveis ADMIN_* (com valores padrão para o primeiro acesso).
 */
@Injectable()
export class BootstrapAdminRunner implements OnApplicationBootstrap {
    private readonly logger = new Logger(BootstrapAdminRunner.name);

    constructor(private readonly bootstrapAdmin: BootstrapAdminUseCase) {}

    async onApplicationBootstrap(): Promise<void> {
        const username = optionalEnv('ADMIN_USERNAME', 'admin');
        const admin = await this.bootstrapAdmin.execute({
            username,
            email: optionalEnv('ADMIN_EMAIL', 'admin@thestock.local'),
            password: optionalEnv('ADMIN_PASSWORD', 'admin123'),
        });

        if (admin) {
            this.logger.warn(`Initial admin "${username}" created. Change its password on first login.`);
        }
    }
}
